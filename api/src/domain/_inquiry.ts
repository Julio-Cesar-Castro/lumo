import type { Inquiry, InquiryKind } from '@lummoo/contracts';
export interface InquiryRecord {
  id: string;
  kind: InquiryKind;
  fingerprint: string;
  payload: Omit<Inquiry, 'website'>;
  created_at: string;
  notification_status: 'pending' | 'failed' | 'sent';
  notification_started_at: string | null;
  resend_id: string | null;
}
export interface InquiryRepository {
  consumeRateLimit(key: string): Promise<boolean>;
  save(record: InquiryRecord): Promise<InquiryRecord>;
  markNotification(id: string, status: 'sent' | 'failed', resendId?: string): Promise<void>;
  startNotification(id: string): Promise<string>;
  pendingNotifications(): Promise<InquiryRecord[]>;
}
export interface Mailer {
  send(record: InquiryRecord): Promise<string>;
  sendReceipt(record: InquiryRecord): Promise<string>;
}
