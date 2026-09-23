import { readConfig } from './config/env.ts';
import { SupabaseClient } from './integrations/supabase.ts';
import { ResendMailer } from './integrations/resend.ts';
import { SupabaseInquiryRepository } from './repositories/inquiries.ts';
import { InquiryService } from './services/inquiries.ts';
export function createContainer() {
  const config = readConfig();
  const repository = new SupabaseInquiryRepository(new SupabaseClient(config));
  const service = new InquiryService(repository, new ResendMailer(config));
  return { config, repository, service };
}
