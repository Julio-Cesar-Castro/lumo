import { createServer } from 'node:http';
import { readConfig } from './src/config/env.ts';
import leads from './leads/index.ts';
import contact from './contact/index.ts';
import quote from './quote/index.ts';
const config = readConfig();
const routes = { '/api/leads': leads, '/api/contact': contact, '/api/quote': quote };
const server = createServer((req, res) => {
  const path = (req.url ?? '/').split('?')[0].replace(/\/$/, '');
  const handler = routes[path as keyof typeof routes];
  if (handler) {
    void handler(req, res);
    return;
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Rota não encontrada.' }));
});
server.requestTimeout = 30000;
server.headersTimeout = 15000;
server.listen(config.PORT, () => console.log(`lummoo API disponível na porta ${config.PORT}`));
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
