import loggerService from './log/log.service';
import MessageHandler from './messageHandler';
import rabbitClient from './rabbitmq/clients';

const bootstrap = async (): Promise<void> => {
  await rabbitClient.initialize(loggerService);

  const messageHandler = new MessageHandler(rabbitClient);

  rabbitClient.consume(messageHandler);
};

bootstrap();
