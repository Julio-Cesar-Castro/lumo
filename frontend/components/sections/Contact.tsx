import { ShieldCheck, Clock3 } from 'lucide-react';
import type { Interest } from '@lummoo/contracts';
import { LeadForm } from '../forms/LeadForm';
export function Contact({
  interest,
  onInterestChange,
}: {
  interest: Interest;
  onInterestChange: (value: Interest) => void;
}) {
  return (
    <section className="contact" id="contato">
      <div className="contact-copy">
        <div className="eyebrow">Vamos construir algo juntos</div>
        <h2>
          O próximo passo
          <br />
          do seu negócio
          <br />
          <span className="gradient">começa aqui.</span>
        </h2>
        <p>
          Conte um pouco sobre a sua ideia. Vamos entender o que você precisa e pensar na melhor
          solução para o seu momento.
        </p>
        <div className="contact-detail">
          <ShieldCheck />
          <div>
            <strong>Proposta sob medida, sem compromisso.</strong>
            <p>Escopo e investimento definidos com clareza.</p>
          </div>
        </div>
        <div className="contact-detail">
          <Clock3 />
          <div>
            <strong>Contato direto. Conversa de verdade.</strong>
            <p>
              Usaremos seus dados apenas para conversar
              <br />
              sobre o seu projeto.
            </p>
          </div>
        </div>
      </div>
      <LeadForm interest={interest} onInterestChange={onInterestChange} />
    </section>
  );
}
