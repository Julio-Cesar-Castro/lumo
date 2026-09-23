import { useState } from 'react';
import type { Interest } from '@lummoo/contracts';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { Services } from '../components/sections/Services';
import { Process } from '../components/sections/Process';
import { About } from '../components/sections/About';
import { Contact } from '../components/sections/Contact';
export default function HomePage() {
  const [interest, setInterest] = useState<Interest>('Landing page');
  return (
    <>
      <a className="skip" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="wrap" id="inicio">
        <Header />
      </div>
      <main id="conteudo">
        <div className="wrap">
          <Hero />
          <Services onSelect={setInterest} />
        </div>
        <Process />
        <div className="wrap">
          <About />
          <Contact interest={interest} onInterestChange={setInterest} />
        </div>
      </main>
      <div className="wrap">
        <Footer />
      </div>
    </>
  );
}
