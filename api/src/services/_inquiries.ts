import { createHash, randomUUID } from 'node:crypto';
import { schemas, type InquiryKind } from '@lummoo/contracts';
import { z } from 'zod';
import type { InquiryRecord, InquiryRepository, Mailer } from '../domain/_inquiry.ts';
import { HttpError } from '../lib/_errors.ts';
export class InquiryService {
  constructor(
    private repository: InquiryRepository,
    private mailer: Mailer,
    private report: (event: string, id: string) => void = (event, id) =>
      console.error(event, { id }),
  ) {}
  async notify(record: InquiryRecord) {
    if (record.notification_status === 'sent') return;
    try {
      const startedAt = await this.repository.startNotification(record.id);
      // Resend retains idempotency keys for 24h. Older ambiguous attempts require manual reconciliation.
      if (Date.now() - Date.parse(startedAt) >= 23 * 60 * 60 * 1000) {
        this.report('email_requires_manual_review', record.id);
        return;
      }
      const resendId = await this.mailer.send(record);
      await this.repository.markNotification(record.id, 'sent', resendId);
    } catch {
      this.report('email_notification_failed', record.id);
      try {
        await this.repository.markNotification(record.id, 'failed');
      } catch {
        this.report('email_status_update_failed', record.id);
      }
    }
  }
  async submit(kind: InquiryKind, input: unknown, key?: string) {
    const parsed = schemas[kind].safeParse(input);
    if (!parsed.success)
      throw new HttpError(
        400,
        'Confira seu nome, e-mail, WhatsApp, mensagem e autorização de contato.',
      );
    if (key && !z.string().uuid().safeParse(key).success)
      throw new HttpError(400, 'Identificador de envio inválido.');
    if (parsed.data.website) return { ok: true as const };
    const { website: _trap, ...payload } = parsed.data;
    const fingerprint = createHash('sha256')
      .update(JSON.stringify({ kind, payload }))
      .digest('hex');
    const record = await this.repository.save({
      id: key ?? randomUUID(),
      kind,
      fingerprint,
      payload,
      created_at: new Date().toISOString(),
      notification_status: 'pending',
      notification_started_at: null,
      resend_id: null,
    });
    if (record.fingerprint !== fingerprint)
      throw new HttpError(409, 'Identificador já usado para outra solicitação.');
    await this.notify(record);
    return { ok: true as const };
  }
}
