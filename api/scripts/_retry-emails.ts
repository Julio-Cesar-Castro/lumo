import { createContainer } from '../src/_container.ts';
const { repository, service } = createContainer();
for (const record of await repository.pendingNotifications()) await service.notify(record);
console.log('Lote de notificações processado. Confira os estados em inquiries.');
