import { ArrowUpRight } from 'lucide-react';
import { Brand } from './Brand';
export function Header() {
  return (
    <header className="header">
      <Brand />
      <nav className="nav" aria-label="Navegação principal">
        <a href="#solucoes">Soluções</a>
        <a href="#processo">Como funciona</a>
        <a href="#sobre">A lummoo</a>
      </nav>
      <a className="button outline" href="#contato">
        Vamos conversar <ArrowUpRight />
      </a>
    </header>
  );
}
