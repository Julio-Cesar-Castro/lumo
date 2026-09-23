import type { InquiryRecord } from '../domain/inquiry.ts';
const titles = { lead: 'Novo lead', contact: 'Nova mensagem', quote: 'Pedido de orçamento' };
export function inquiryNotification(record: InquiryRecord) {
  const data = record.payload;
  return {
    subject: `lummoo | ${titles[record.kind]}`,
    text: [
      titles[record.kind],
      '',
      `Nome: ${data.name}`,
      `E-mail: ${data.email}`,
      `WhatsApp: ${data.phone}`,
      `Empresa: ${data.company || 'Não informada'}`,
      'interest' in data ? `Interesse: ${data.interest}` : '',
      'budget' in data ? `Investimento: ${data.budget || 'Não informado'}` : '',
      'timeline' in data ? `Prazo: ${data.timeline || 'Não informado'}` : '',
      '',
      'Mensagem:',
      data.message || 'Não informada',
      '',
      `Referência: ${record.id}`,
    ]
      .filter((value) => value !== '')
      .join('\n'),
    reply_to: data.email,
  };
}
