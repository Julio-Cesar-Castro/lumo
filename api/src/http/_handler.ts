import { createHmac } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { InquiryKind } from '@lummoo/contracts';
import type { InquiryRepository } from '../domain/_inquiry.ts';
import type { InquiryService } from '../services/_inquiries.ts';
import type { Config } from '../config/_env.ts';
import { HttpError } from '../lib/_errors.ts';
export interface RequestWithBody extends IncomingMessage {
  body?: unknown;
}
const MAX_BODY = 16000;
async function readBody(req: RequestWithBody): Promise<unknown> {
  if (!req.headers['content-type']?.toLowerCase().startsWith('application/json'))
    throw new HttpError(415, 'Envie os dados em JSON.');
  if (Number(req.headers['content-length'] ?? 0) > MAX_BODY)
    throw new HttpError(413, 'Mensagem muito longa.');
  if (req.body !== undefined) {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(raw) > MAX_BODY) throw new HttpError(413, 'Mensagem muito longa.');
    try {
      return JSON.parse(raw);
    } catch {
      throw new HttpError(400, 'JSON inválido.');
    }
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY) throw new HttpError(413, 'Mensagem muito longa.');
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'JSON inválido.');
  }
}
function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(JSON.stringify(body));
}
export function createHandler(
  kind: InquiryKind,
  config: Config,
  repository: InquiryRepository,
  service: InquiryService,
) {
  return async (req: RequestWithBody, res: ServerResponse) => {
    try {
      const origin = req.headers.origin;
      if (origin && !config.origins.includes(origin))
        throw new HttpError(403, 'Origem não permitida.');
      res.setHeader('Vary', 'Origin');
      if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key');
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS');
        throw new HttpError(405, 'Método não permitido.');
      }
      const data = await readBody(req);
      // Trust only Vercel's overwritten header on Vercel; standalone ignores client forwarding headers.
      const forwarded = process.env.VERCEL ? req.headers['x-vercel-forwarded-for'] : undefined;
      const ip =
        typeof forwarded === 'string'
          ? forwarded.split(',')[0].trim()
          : (req.socket.remoteAddress ?? 'unknown');
      const key = createHmac('sha256', config.RATE_LIMIT_SALT).update(ip).digest('hex');
      if (!(await repository.consumeRateLimit(key))) {
        res.setHeader('Retry-After', '600');
        throw new HttpError(429, 'Muitos envios. Aguarde alguns minutos e tente novamente.');
      }
      const idempotencyKey = req.headers['idempotency-key'];
      if (Array.isArray(idempotencyKey)) throw new HttpError(400, 'Identificador inválido.');
      json(res, 201, await service.submit(kind, data, idempotencyKey));
    } catch (error) {
      if (error instanceof HttpError) {
        json(res, error.status, { error: error.message });
        return;
      }
      console.error('inquiry_request_failed');
      json(res, 503, {
        error:
          'Não conseguimos registrar agora. Seus dados continuam no formulário; tente novamente em instantes.',
      });
    }
  };
}
