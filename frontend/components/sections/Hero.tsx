import {
  ArrowUpRight,
  ArrowRight,
  MousePointer2,
  Workflow,
  Monitor,
  ShieldCheck,
  Zap,
  Layers,
} from 'lucide-react';
export function Hero() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Ideias que conectam. Negócios que crescem.</div>
          <h1>
            Seu próximo nível
            <br />
            começa com uma
            <br />
            <span className="gradient">presença digital.</span>
          </h1>
          <p>
            Criamos landing pages que conectam sua marca a novos clientes e automações que devolvem
            tempo ao seu negócio.
          </p>
          <div className="hero-actions">
            <a href="#contato" className="button">
              Vamos tirar sua ideia do papel <ArrowUpRight />
            </a>
            <a href="#solucoes" className="text-link">
              Explore as soluções <ArrowRight />
            </a>
          </div>
          <div className="note">
            <ShieldCheck /> Uma conversa sem compromisso. Um projeto com propósito.
          </div>
        </div>
        <div className="hero-art" aria-label="Arte abstrata lummoo">
          <img src="/lummoo-art.webp" alt="Escultura translúcida em azul e violeta" />
          <div className="mini-tag tag-one">
            <MousePointer2 /> Mais conexões. Mais oportunidades.
          </div>
          <div className="mini-tag tag-two">
            <Workflow /> Menos tarefas. Mais possibilidades.
          </div>
          <span className="art-caption">O digital a favor do seu negócio</span>
        </div>
      </section>
      <div className="benefits">
        <span>
          <Monitor /> Design pensado para sua marca
        </span>
        <span>
          <Zap /> Experiência rápida e responsiva
        </span>
        <span>
          <Layers /> Soluções feitas sob medida
        </span>
        <span>
          <MousePointer2 /> Foco em conversão
        </span>
      </div>
    </>
  );
}
