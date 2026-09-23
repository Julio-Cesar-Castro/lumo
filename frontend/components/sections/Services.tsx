import { ArrowUpRight, Check, Workflow, Monitor } from 'lucide-react';
import type { Interest } from '@lummoo/contracts';
export function Services({ onSelect }: { onSelect: (value: Interest) => void }) {
  return (
    <>
      <section className="section" id="solucoes">
        <div className="section-heading">
          <div>
            <div className="eyebrow">O que fazemos</div>
            <h2>
              Seu negócio tem potencial.
              <br />
              <span style={{ color: '#8992aa' }}>A gente coloca em movimento.</span>
            </h2>
          </div>
          <p>
            Da primeira impressão ao próximo processo. Tecnologia com um objetivo claro: fazer sua
            empresa avançar.
          </p>
        </div>
        <div className="services">
          <article className="service">
            <span className="service-num">01 / PRESENÇA</span>
            <div className="icon-box">
              <Monitor />
            </div>
            <h3>Landing pages que conectam.</h3>
            <p>
              Uma página que apresenta o valor da sua marca e conduz o visitante ao que importa:
              falar com você.
            </p>
            <ul>
              <li>
                <Check /> Visual exclusivo, alinhado à sua identidade
              </li>
              <li>
                <Check /> Experiência fluida no celular e no computador
              </li>
              <li>
                <Check /> Formulários e chamadas para captar interessados
              </li>
              <li>
                <Check /> Estrutura preparada para suas campanhas
              </li>
            </ul>
            <a href="#contato" onClick={() => onSelect('Landing page')} className="text-link">
              Quero uma landing page <ArrowUpRight />
            </a>
          </article>
          <article className="service">
            <span className="service-num">02 / EFICIÊNCIA</span>
            <div className="icon-box">
              <Workflow />
            </div>
            <h3>Automações que simplificam.</h3>
            <p>
              Conecte ferramentas e elimine etapas repetitivas. Sua equipe ganha espaço para focar
              no que faz diferença.
            </p>
            <ul>
              <li>
                <Check /> Organização e encaminhamento de leads
              </li>
              <li>
                <Check /> Integração entre formulários, planilhas e sistemas
              </li>
              <li>
                <Check /> Fluxos de acompanhamento e notificações
              </li>
              <li>
                <Check /> Processos desenhados para a sua operação
              </li>
            </ul>
            <a href="#contato" onClick={() => onSelect('Automação')} className="text-link">
              Quero automatizar meu negócio <ArrowUpRight />
            </a>
          </article>
        </div>
      </section>
    </>
  );
}
