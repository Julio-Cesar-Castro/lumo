import { readConfig } from './config/_env.ts';
import { SupabaseClient } from './integrations/_supabase.ts';
import { ResendMailer } from './integrations/_resend.ts';
import { SupabaseInquiryRepository } from './repositories/_inquiries.ts';
import { InquiryService } from './services/_inquiries.ts';
export function createContainer() {
  const config = readConfig();
  const repository = new SupabaseInquiryRepository(new SupabaseClient(config));
  const service = new InquiryService(repository, new ResendMailer(config));
  return { config, repository, service };
}
