import type { InquiryRecord } from '../domain/_inquiry.ts';

const titles = { lead: 'Novo lead', contact: 'Nova mensagem', quote: 'Pedido de orçamento' };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );
}

export function inquiryNotification(record: InquiryRecord) {
  const data = record.payload;
  const title = titles[record.kind];
  const fields = [
    ['Nome', data.name],
    ['E-mail', data.email],
    ['WhatsApp', data.phone],
    ['Empresa', data.company || 'Não informada'],
    'interest' in data ? ['Interesse', data.interest] : null,
    'budget' in data ? ['Investimento', data.budget || 'Não informado'] : null,
    'timeline' in data ? ['Prazo', data.timeline || 'Não informado'] : null,
  ].filter((field): field is string[] => field !== null);
  const message = data.message || 'Não informada';
  const rows = fields.map(([label, value]) =>
    `<tr><td style="padding:13px 16px;color:#848da3;font-size:13px;width:115px;border-bottom:1px solid #edf0f6">${escapeHtml(label)}</td><td style="padding:13px 16px;color:#1c2337;font-size:14px;font-weight:600;border-bottom:1px solid #edf0f6;word-break:break-word">${escapeHtml(value)}</td></tr>`,
  ).join('');
  return {
    subject: `lummoo | ${title}`,
    text: [
      title, '',
      ...fields.map(([label, value]) => `${label}: ${value}`),
      '', 'Mensagem:', message, '', `Referência: ${record.id}`,
    ].join('\n'),
    html: `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} | lummoo</title></head>
<body style="margin:0;padding:0;background:#f3f5fa;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f3f5fa;padding:40px 16px"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;background:#fff;border:1px solid #e5e8f1;border-radius:18px;overflow:hidden">
<tr><td style="background:#171c2d;padding:28px 36px;color:#fff"><span style="font-size:25px;font-weight:800;letter-spacing:-1px">lummoo<span style="color:#818cf8">.</span></span><span style="float:right;font-size:12px;color:#b2b9ce;padding-top:9px">Nova solicitação</span></td></tr>
<tr><td style="padding:36px 36px 24px"><span style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:#6876ed;text-transform:uppercase">Site lummoo</span><h1 style="font-size:28px;letter-spacing:-0.8px;color:#171c2d;margin:12px 0 10px">${title}</h1><p style="color:#606b80;font-size:15px;line-height:1.6;margin:0">Uma pessoa entrou em contato pelo formulário do site. Confira os dados para dar continuidade à conversa.</p></td></tr>
<tr><td style="padding:0 36px 30px"><table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #edf0f6;border-radius:10px">${rows}</table></td></tr>
<tr><td style="padding:0 36px 35px"><div style="font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#6876ed;margin-bottom:12px">Mensagem do cliente</div><div style="background:#f3f4ff;border-left:4px solid #767df4;border-radius:8px;padding:20px;color:#343d62;font-size:15px;line-height:1.7;white-space:pre-wrap;word-break:break-word">${escapeHtml(message)}</div></td></tr>
<tr><td style="padding:20px 36px;border-top:1px solid #edf0f6;color:#8890a2;font-size:12px">Referência: ${escapeHtml(record.id)}</td></tr>
</table></td></tr></table></body></html>`,
    reply_to: data.email,
  };
}
