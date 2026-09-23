import { z } from 'zod';
export const INTERESTS = ['Landing page', 'Automação', 'Os dois'] as const;
export type Interest = (typeof INTERESTS)[number];
export const inquiryKinds = ['lead', 'contact', 'quote'] as const;
export type InquiryKind = (typeof inquiryKinds)[number];
const baseSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .email()
    .max(200)
    .transform((value) => value.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(22)
    .regex(/^\+?[\d ()-]+$/)
    .refine((value) => {
      const length = value.replace(/\D/g, '').length;
      return length >= 10 && length <= 15;
    }),
  company: z.string().trim().max(150).default(''),
  message: z.string().trim().max(3000).default(''),
  consent: z.literal(true),
  website: z.string().max(200).default(''),
});
export const leadSchema = baseSchema.extend({ interest: z.enum(INTERESTS) });
export const contactSchema = baseSchema.extend({ message: z.string().trim().min(10).max(3000) });
export const quoteSchema = leadSchema.extend({
  message: z.string().trim().min(10).max(3000),
  budget: z.string().trim().max(120).default(''),
  timeline: z.string().trim().max(120).default(''),
});
export const schemas = { lead: leadSchema, contact: contactSchema, quote: quoteSchema };
export type LeadInput = z.input<typeof leadSchema>;
export type Inquiry =
  z.output<typeof leadSchema> | z.output<typeof contactSchema> | z.output<typeof quoteSchema>;
export interface SubmissionResponse {
  ok: true;
}
