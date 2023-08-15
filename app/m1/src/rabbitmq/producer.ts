import EventEmitter from 'node:events';
import { randomUUID } from 'node:crypto';

import { Channel, Message } from 'amqplib';

import { AMQP_QUEUE_NAME } from '../constants';
import { RabbitMessage } from '../interfaces';
import { Log } from '../log/log.interface';

export default class RabbitClientProducer {
  constructor(
    private channel: Channel,
    private replyToQueue: string,
    private eventEmitter: EventEmitter,
    private logger: Log,
  ) {}

  async produceMessage<T = RabbitMessage>(message: T): Promise<T> {
    const correlationId = randomUUID().toString();

    this.channel.sendToQueue(AMQP_QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      correlationId,
      replyTo: this.replyToQueue,
    });

    this.logger.info({ queue: AMQP_QUEUE_NAME, correlationId, message }, 'Send message to queue');

    return new Promise((resolve) => {
      this.eventEmitter.once(correlationId, async (data: Message) => {
        const reply = JSON.parse(data.content.toString());
        resolve(reply);
      });
    });
  }
}
