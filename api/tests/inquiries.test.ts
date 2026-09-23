import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import type { InquiryRecord, InquiryRepository, Mailer } from '../src/domain/inquiry.ts';
import { InquiryService } from '../src/services/inquiries.ts';
import { createHandler } from '../src/http/handler.ts';
import { readConfig } from '../src/config/env.ts';
import { ResendMailer } from '../src/integrations/resend.ts';
import { SupabaseClient } from '../src/integrations/supabase.ts';
const config = readConfig({
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SECRET_KEY: 'test-only-secret-key-long',
  RESEND_API_KEY: 'test-only-resend-key',
  EMAIL_FROM: 'lummoo <sender@example.com>',
  LEADS_EMAIL_TO: 'team@example.com',
  ALLOWED_ORIGINS: 'https://lummoo.example',
  RATE_LIMIT_SALT: 'test-only-rate-limit-salt-32-characters',
});
const input = {
  name: 'Cliente Teste',
  email: 'cliente@example.com',
  phone: '11999999999',
  interest: 'Landing page',
  consent: true,
  message: 'Quero uma página para minha empresa.',
};
const id = '4370ebbf-5c0a-455e-a4d0-ebc73de9b282';
class MemoryRepository implements InquiryRepository {
  records = new Map<string, InquiryRecord>();
  allowed = true;
  unavailable = false;
  async consumeRateLimit() {
    return this.allowed;
  }
  async save(record: InquiryRecord) {
    if (this.unavailable) throw new Error('DB unavailable');
    if (!this.records.has(record.id)) this.records.set(record.id, record);
    return this.records.get(record.id)!;
  }
  async startNotification(id: string) {
    const record = this.records.get(id)!;
    record.notification_started_at ??= new Date().toISOString();
    return record.notification_started_at;
  }
  async markNotification(id: string, status: 'sent' | 'failed', resendId?: string) {
    const record = this.records.get(id)!;
    record.notification_status = status;
    record.resend_id = resendId ?? null;
  }
  async pendingNotifications() {
    return [...this.records.values()].filter((r) => r.notification_status !== 'sent');
  }
}
function setup() {
  const repository = new MemoryRepository();
  let sends = 0;
  const mailer: Mailer = {
    async send() {
      sends++;
      return 'email-test';
    },
  };
  const service = new InquiryService(repository, mailer, () => {});
  return { repository, mailer, service, sends: () => sends };
}
test('lead is persisted before notification; identical retry does not duplicate', async () => {
  const ctx = setup();
  assert.deepEqual(await ctx.service.submit('lead', input, id), { ok: true });
  assert.equal(ctx.repository.records.size, 1);
  assert.equal(ctx.repository.records.get(id)?.notification_status, 'sent');
  await ctx.service.submit('lead', input, id);
  assert.equal(ctx.sends(), 1);
  await assert.rejects(
    ctx.service.submit('lead', { ...input, name: 'Outra pessoa' }, id),
    /Identificador já usado/,
  );
});
test('invalid consent and honeypot never create a lead or email', async () => {
  const ctx = setup();
  await assert.rejects(ctx.service.submit('lead', { ...input, consent: false }, id));
  await ctx.service.submit('lead', { ...input, website: 'spam' }, id);
  assert.equal(ctx.repository.records.size, 0);
  assert.equal(ctx.sends(), 0);
});
test('mail failure preserves lead and explicit retry updates status', async () => {
  const ctx = setup();
  ctx.mailer.send = async () => {
    throw new Error('Resend timeout');
  };
  assert.deepEqual(await ctx.service.submit('lead', input, id), { ok: true });
  assert.equal(ctx.repository.records.get(id)?.notification_status, 'failed');
  ctx.mailer.send = async () => 'retried-email';
  await ctx.service.notify(ctx.repository.records.get(id)!);
  assert.equal(ctx.repository.records.get(id)?.resend_id, 'retried-email');
});
test('database failure never sends mail or reports success', async () => {
  const ctx = setup();
  ctx.repository.unavailable = true;
  await assert.rejects(ctx.service.submit('lead', input, id));
  assert.equal(ctx.sends(), 0);
});
test('ambiguous mail attempts older than idempotency retention are not resent automatically', async () => {
  const ctx = setup();
  await ctx.service.submit('lead', input, id);
  const record = ctx.repository.records.get(id)!;
  record.notification_status = 'failed';
  record.notification_started_at = new Date(Date.now() - 25 * 3600000).toISOString();
  await ctx.service.notify(record);
  assert.equal(ctx.sends(), 1);
});
test('three endpoint schemas support their own payloads', async () => {
  const ctx = setup();
  await ctx.service.submit('contact', input);
  await ctx.service.submit('quote', { ...input, budget: 'R$ 2.000', timeline: 'Próximo mês' });
  await assert.rejects(ctx.service.submit('quote', { ...input, message: '' }));
  assert.deepEqual(
    [...ctx.repository.records.values()].map((r) => r.kind),
    ['contact', 'quote'],
  );
});
test('HTTP boundary enforces origin, method, JSON size, rate limit, and validates fields', async (t) => {
  const ctx = setup();
  const server = createServer(createHandler('lead', config, ctx.repository, ctx.service));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (body: unknown, origin = 'https://lummoo.example') =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify(body),
    });
  assert.equal((await fetch(url)).status, 405);
  assert.equal((await post(input, 'https://evil.example')).status, 403);
  assert.equal(
    (await fetch(url, { method: 'OPTIONS', headers: { Origin: 'https://lummoo.example' } })).status,
    204,
  );
  assert.equal((await post({ ...input, message: 'x'.repeat(17000) })).status, 413);
  assert.equal((await post({ ...input, email: 'invalid' })).status, 400);
  const response = await post(input);
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  ctx.repository.allowed = false;
  assert.equal((await post(input)).status, 429);
});
test('provider adapters use server-only keys, stable email idempotency and plain text', async () => {
  const ctx = setup();
  await ctx.service.submit('lead', input, id);
  const record = ctx.repository.records.get(id)!;
  let captured: RequestInit | undefined;
  const mailer = new ResendMailer(config, async (_url, init) => {
    captured = init;
    return Response.json({ id: 'provider-id' });
  });
  assert.equal(await mailer.send(record), 'provider-id');
  assert.equal(new Headers(captured?.headers).get('Idempotency-Key'), `inquiry/${id}`);
  const body = JSON.parse(captured?.body as string);
  assert.deepEqual(body.to, ['team@example.com']);
  assert.equal(body.reply_to, input.email);
  assert.ok(!body.html);
  const db = new SupabaseClient(config, async (_url, init) => {
    captured = init;
    return Response.json([]);
  });
  await db.call('inquiries');
  assert.equal(new Headers(captured?.headers).get('apikey'), config.SUPABASE_SECRET_KEY);
  assert.equal(new Headers(captured?.headers).has('Authorization'), false);
  const failed = new ResendMailer(config, async () => new Response('error', { status: 503 }));
  await assert.rejects(failed.send(record));
});
