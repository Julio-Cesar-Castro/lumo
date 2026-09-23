import type { InquiryRecord, InquiryRepository } from '../domain/inquiry.ts';
import { SupabaseClient } from '../integrations/supabase.ts';
export class SupabaseInquiryRepository implements InquiryRepository {
  constructor(private client: SupabaseClient) {}
  consumeRateLimit(key: string) {
    return this.client.call<boolean>('rpc/consume_submission_limit', {
      method: 'POST',
      body: JSON.stringify({ p_key: key }),
    });
  }
  async save(record: InquiryRecord) {
    const rows = await this.client.call<InquiryRecord[]>('inquiries?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify(record),
    });
    if (rows[0]) return rows[0];
    const existing = await this.client.call<InquiryRecord[]>(
      `inquiries?id=eq.${encodeURIComponent(record.id)}&select=*&limit=1`,
    );
    if (!existing[0]) throw new Error('Could not retrieve persisted inquiry');
    return existing[0];
  }
  async startNotification(id: string) {
    return this.client.call<string>('rpc/start_inquiry_notification', {
      method: 'POST',
      body: JSON.stringify({ p_id: id }),
    });
  }
  async markNotification(id: string, status: 'sent' | 'failed', resendId?: string) {
    // A failed concurrent attempt must never overwrite an already successful send.
    await this.client.call(
      `inquiries?id=eq.${encodeURIComponent(id)}&notification_status=neq.sent`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          notification_status: status,
          ...(resendId ? { resend_id: resendId } : {}),
        }),
      },
    );
  }
  pendingNotifications() {
    return this.client.call<InquiryRecord[]>(
      'inquiries?notification_status=in.(pending,failed)&order=created_at.asc&limit=100',
    );
  }
}
