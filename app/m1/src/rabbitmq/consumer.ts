import EventEmitter from 'node:events';

import { Channel, ConsumeMessage } from 'amqplib';

import { Log } from '../log/log.interface';

export default class RabbitClientConsumer {
  constructor(
    private channel: Channel,
    private replyToQueue: string,
    private eventEmitter: EventEmitter,
    private logger: Log,
  ) {}

  async consumeMessages(): Promise<void> {
    this.channel.consume(this.replyToQueue, (message: ConsumeMessage | null) => {
      if (message === null) {
        return;
      }

      const { correlationId } = message.properties;
      if (!correlationId) {
        return;
      }

      this.eventEmitter.emit(correlationId, message);

      this.channel.ack(message);

      const messageContent = JSON.parse(message.content.toString());

      this.logger.info(
        {
          queue: this.replyToQueue,
          correlationId,
          message: messageContent,
        },
        'Received message from queue',
      );
    });
  }
}
