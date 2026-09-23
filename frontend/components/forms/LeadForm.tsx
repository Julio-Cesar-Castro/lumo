import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { INTERESTS, type Interest } from '@lummoo/contracts';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { useLeadForm } from '@/hooks/useLeadForm';
export function LeadForm({
  interest,
  onInterestChange,
}: {
  interest: Interest;
  onInterestChange: (value: Interest) => void;
}) {
  const { status, error, consent, setConsent, submit, reset } = useLeadForm(interest);
  return (
    <>
      {status === 'success' ? (
        <div className="success" role="status">
          <CheckCircle2 />
          <h3>Ideia recebida!</h3>
          <p>
            Seu contato foi registrado. A lummoo poderá conversar com você pelos dados informados
            para entender os próximos passos.
          </p>
          <Button variant="outline" onClick={reset}>
            Enviar outra ideia
          </Button>
        </div>
      ) : (
        <form className="form" onSubmit={submit}>
          <fieldset>
            <legend>O que você tem em mente?</legend>
            <RadioGroup
              className="choices"
              value={interest}
              onValueChange={(value) => onInterestChange(value as Interest)}
            >
              {INTERESTS.map((item, i) => (
                <label className="choice" key={item} htmlFor={`interest-${i}`}>
                  <RadioGroupItem value={item} id={`interest-${i}`} />
                  {item}
                </label>
              ))}
            </RadioGroup>
          </fieldset>
          <div className="form-row">
            <div>
              <label htmlFor="name">Seu nome *</label>
              <Input
                id="name"
                name="name"
                placeholder="Como podemos te chamar?"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div>
              <label htmlFor="company">Empresa</label>
              <Input
                id="company"
                name="company"
                placeholder="Nome do seu negócio"
                autoComplete="organization"
                maxLength={150}
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label htmlFor="email">E-mail *</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="voce@empresa.com"
                autoComplete="email"
                required
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor="phone">WhatsApp *</label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                autoComplete="tel"
                required
                minLength={10}
                maxLength={22}
              />
            </div>
          </div>
          <div>
            <label htmlFor="message">Conte um pouco sobre seu projeto</label>
            <Textarea
              id="message"
              name="message"
              placeholder="O que você gostaria de criar ou simplificar?"
              maxLength={3000}
            />
          </div>
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <label className="consent" htmlFor="consent">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              required
            />
            Autorizo a lummoo a usar os dados informados para entrar em contato sobre este projeto.
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button className="submit" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Enviando sua ideia...' : 'Quero conversar sobre meu projeto'}
            <ArrowUpRight />
          </Button>
          <p className="form-foot">Sem compromisso. Sem mensagens indesejadas.</p>
        </form>
      )}
    </>
  );
}
