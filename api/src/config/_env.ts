import { z } from 'zod';
const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SECRET_KEY: z.string().min(20),
  RESEND_API_KEY: z.string().min(10),
  EMAIL_FROM: z
    .string()
    .min(5)
    .refine((value) => !/[\r\n]/.test(value)),
  LEADS_EMAIL_TO: z.string().email(),
  ALLOWED_ORIGINS: z.string().min(1),
  RATE_LIMIT_SALT: z.string().min(32),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
});
export function readConfig(source: NodeJS.ProcessEnv = process.env) {
  const result = envSchema.safeParse(source);
  if (!result.success)
    throw new Error(
      `Configure as variáveis: ${result.error.issues.map((i) => i.path.join('.')).join(', ')}`,
    );
  const origins = result.data.ALLOWED_ORIGINS.split(',').map(
    (value) => new URL(value.trim()).origin,
  );
  return { ...result.data, origins };
}
export type Config = ReturnType<typeof readConfig>;
