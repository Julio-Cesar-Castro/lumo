import {env} from 'cloudflare:workers';
export function leadDatabase():D1Database {const db=(env as unknown as {DB?:D1Database}).DB;if(!db)throw new Error('Lead storage unavailable');return db;}
