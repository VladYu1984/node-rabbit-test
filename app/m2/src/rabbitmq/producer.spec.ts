import RabbitClientProducer from './producer';

describe('RabbitClientProducer', () => {
  it('should successfully produce a message to the queue', async () => {
    const channel = {
      sendToQueue: jest.fn(),
    } as any;

    const logger = {
      info: jest.fn(),
    } as any;

    const producer = new RabbitClientProducer(channel, logger);

    const message = { task: 'do something' };
    const correlationId = '123';
    const replyToQueue = 'queue';

    await producer.produceMessage(message, correlationId, replyToQueue);

    expect(channel.sendToQueue).toHaveBeenCalledWith(
      replyToQueue,
      Buffer.from(JSON.stringify(message)),
      { correlationId },
    );
    expect(logger.info).toHaveBeenCalledWith(
      { correlationId, replyToQueue, message },
      'Send to queue',
    );
  });
});
