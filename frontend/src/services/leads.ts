import { leadSchema, type LeadInput, type SubmissionResponse } from '@lummoo/contracts';
export async function sendLead(input: LeadInput, requestId: string): Promise<SubmissionResponse> {
  const data = leadSchema.parse(input);
  const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  const response = await fetch(`${base}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestId },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(error.error ?? 'Não foi possível enviar. Tente novamente em instantes.');
  }
  return { ok: true };
}
