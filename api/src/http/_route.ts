import type { ServerResponse } from 'node:http';
import type { InquiryKind } from '@lummoo/contracts';
import { createContainer } from '../_container.ts';
import { createHandler, type RequestWithBody } from './_handler.ts';
export function route(kind: InquiryKind) {
  let handler: ReturnType<typeof createHandler> | undefined;
  return async (req: RequestWithBody, res: ServerResponse) => {
    try {
      if (!handler) {
        const { config, repository, service } = createContainer();
        handler = createHandler(kind, config, repository, service);
      }
      await handler(req, res);
    } catch {
      console.error('api_configuration_missing');
      res.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(
        JSON.stringify({
          error: 'Atendimento temporariamente indisponível. Tente novamente em instantes.',
        }),
      );
    }
  };
}
