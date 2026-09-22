import {z} from 'zod';
import {leadDatabase} from '@/lib/leads-db';
const schema=z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(200),phone:z.string().trim().max(22).refine(v=>/^\+?[\d ()-]+$/.test(v)&&v.replace(/\D/g,'').length>=10&&v.replace(/\D/g,'').length<=15),company:z.string().trim().max(150).optional().default(''),interest:z.enum(['Landing page','Automação','Os dois']),message:z.string().trim().max(3000).optional().default(''),consent:z.literal(true),website:z.string().max(200).optional()});
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origem não permitida.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>16000)return Response.json({error:'Mensagem muito longa.'},{status:413});
 let raw;try{const text=await request.text();if(text.length>16000)return Response.json({error:'Mensagem muito longa.'},{status:413});raw=JSON.parse(text)}catch{return Response.json({error:'Dados inválidos.'},{status:400})}
 const result=schema.safeParse(raw);if(!result.success)return Response.json({error:'Confira seu nome, e-mail, WhatsApp e autorização de contato.'},{status:400});
 const d=result.data;if(d.website)return Response.json({ok:true},{status:201});
 try{const db=leadDatabase();await db.prepare('INSERT INTO leads (id,name,email,phone,company,interest,message,consent,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),d.name,d.email,d.phone,d.company,d.interest,d.message,1,new Date().toISOString()).run();return Response.json({ok:true},{status:201,headers:{'Cache-Control':'no-store'}})}catch(error){console.error('Lead storage failed',error);return Response.json({error:'Não conseguimos registrar agora. Seus dados continuam no formulário; tente novamente em instantes.'},{status:503})}
}
