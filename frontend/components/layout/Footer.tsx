import { Brand } from './Brand';
export function Footer() {
  return (
    <>
      <details className="privacy">
        <summary>Sobre seus dados e privacidade</summary>
        <p>
          O formulário registra nome, e-mail, WhatsApp, empresa e informações sobre o projeto para
          permitir que a lummoo avalie a solicitação e entre em contato. Os dados são armazenados de
          forma restrita e não são exibidos no site. Você pode solicitar a correção ou exclusão dos
          dados ao responder ao contato da lummoo. Não usamos este formulário para inscrever você em
          campanhas de marketing.
        </p>
      </details>
      <footer className="footer">
        <Brand />
        <p>© {new Date().getFullYear()} lummoo. Ideias que conectam.</p>
        <a href="#inicio">Voltar ao topo ↑</a>
      </footer>
    </>
  );
}
