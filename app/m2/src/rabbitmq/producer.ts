import { Channel } from 'amqplib';

import { RabbitMessage } from '../interfaces';
import { Log } from '../log/log.interface';

export default class RabbitClientProducer {
  constructor(private channel: Channel, private logger: Log) {}

  async produceMessage<T = RabbitMessage>(
    message: T,
    correlationId: string,
    replyToQueue: string,
  ): Promise<void> {
    const messageContent = JSON.stringify(message);
    this.channel.sendToQueue(replyToQueue, Buffer.from(messageContent), {
      correlationId,
    });
    this.logger.info({ correlationId, replyToQueue, message }, 'Send to queue');
  }
}
