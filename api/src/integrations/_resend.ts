import type { Config } from '../config/_env.ts';
import type { InquiryRecord, Mailer } from '../domain/_inquiry.ts';
import { inquiryNotification } from '../emails/_inquiry-notification.ts';
export class ResendMailer implements Mailer {
  constructor(
    private config: Config,
    private request: typeof fetch = fetch,
  ) {}
  async send(record: InquiryRecord) {
    const response = await this.request('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `inquiry/${record.id}`,
      },
      body: JSON.stringify({
        from: this.config.EMAIL_FROM,
        to: [this.config.LEADS_EMAIL_TO],
        ...inquiryNotification(record),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      // Only log the provider's machine-readable code; its message may contain addresses.
      const error = (await response.json().catch(() => ({}))) as { name?: unknown };
      const code = typeof error.name === 'string' ? error.name : 'unknown';
      throw new Error(`Resend request failed (${response.status}, ${code})`);
    }
    const data = (await response.json()) as { id?: string };
    if (!data.id) throw new Error('Resend returned no message identifier');
    return data.id;
  }
}
