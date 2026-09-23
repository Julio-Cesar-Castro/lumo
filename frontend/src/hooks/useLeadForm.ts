import { useRef, useState, type FormEvent } from 'react';
import { leadSchema, type Interest } from '@lummoo/contracts';
import { sendLead } from '../services/leads';
export function useLeadForm(interest: Interest) {
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const attempt = useRef<{ fingerprint: string; id: string } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = leadSchema.safeParse({ ...data, interest, consent });
    if (!parsed.success) {
      setError('Confira seu nome, e-mail, WhatsApp e autorização de contato.');
      return;
    }
    const fingerprint = JSON.stringify(parsed.data);
    if (attempt.current?.fingerprint !== fingerprint) {
      attempt.current = { fingerprint, id: crypto.randomUUID() };
    }
    inFlight.current = true;
    setStatus('sending');
    setError('');
    try {
      await sendLead(parsed.data, attempt.current.id);
      setStatus('success');
    } catch (cause) {
      setStatus('idle');
      setError(
        cause instanceof Error && cause.name !== 'TimeoutError'
          ? cause.message
          : 'O envio demorou mais que o esperado. Tente novamente; seus dados foram mantidos.',
      );
    } finally {
      inFlight.current = false;
    }
  }
  function reset() {
    setStatus('idle');
    setConsent(false);
    setError('');
    attempt.current = null;
  }
  return { consent, setConsent, status, error, submit, reset };
}
