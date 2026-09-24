import type { InquiryRecord } from '../domain/_inquiry.ts';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );
}

export function inquiryReceipt(record: InquiryRecord) {
  const name = record.payload.name.trim().split(/\s+/)[0] || 'você';
  const greeting = escapeHtml(name);
  const subject = 'Recebemos sua mensagem | lummoo';
  const text = `Olá, ${name}!

Obrigado por entrar em contato com a lummoo. Recebemos sua solicitação e ficamos felizes em saber que você está pensando no próximo passo do seu projeto.

Vamos analisar as informações que você enviou e, em breve, entraremos em contato para conversar sobre o desenvolvimento e entender melhor o que você precisa.

Sua mensagem chegou por aqui. Agora é com a gente.

Até breve,
Equipe lummoo

Você recebeu este e-mail porque enviou uma solicitação pelo site lummoo.com.br.`;
  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#f3f5fa;font-family:Arial,Helvetica,sans-serif;color:#182033">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Recebemos sua solicitação. Em breve, entraremos em contato para conversar sobre seu projeto.</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f5fa;padding:40px 16px"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#fff;border:1px solid #e5e8f1;border-radius:18px;overflow:hidden">
<tr><td style="background:#171c2d;padding:31px 40px"><span style="font-size:25px;font-weight:800;letter-spacing:-1px;color:#fff">lummoo<span style="color:#818cf8">.</span></span></td></tr>
<tr><td style="padding:48px 40px 38px">
<div style="color:#6876ed;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;margin-bottom:18px">Mensagem recebida</div>
<h1 style="font-size:32px;line-height:1.2;letter-spacing:-1px;margin:0 0 24px;color:#171c2d">Olá, ${greeting}! 👋</h1>
<p style="font-size:16px;line-height:1.8;color:#434b5e;margin:0 0 18px">Obrigado por entrar em contato com a <strong style="color:#171c2d">lummoo</strong>. Recebemos sua solicitação e ficamos felizes em saber que você está pensando no próximo passo do seu projeto.</p>
<p style="font-size:16px;line-height:1.8;color:#434b5e;margin:0 0 32px">Vamos analisar as informações que você enviou e, em breve, entraremos em contato para conversar sobre o desenvolvimento e entender melhor o que você precisa.</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f4ff;border-left:4px solid #767df4;border-radius:8px"><tr><td style="padding:20px 22px;font-size:15px;line-height:1.6;color:#343d62">Sua mensagem chegou por aqui. Agora é com a gente. ✨</td></tr></table>
<p style="font-size:15px;line-height:1.7;color:#434b5e;margin:34px 0 0">Até breve,<br><strong style="color:#171c2d">Equipe lummoo</strong></p>
</td></tr>
<tr><td style="border-top:1px solid #ebedf4;padding:22px 40px;color:#8890a2;font-size:12px;line-height:1.6">Você recebeu este e-mail porque enviou uma solicitação pelo site <a href="https://lummoo.com.br" style="color:#6876ed;text-decoration:none">lummoo.com.br</a>. Esta é uma confirmação automática; nossa equipe entrará em contato em breve.</td></tr>
</table></td></tr></table>
</body></html>`;
  return { subject, text, html };
}
