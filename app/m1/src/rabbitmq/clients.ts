import EventEmitter from 'node:events';

import { Channel, Connection, connect } from 'amqplib';

import { RABBIT_URL } from '../constants';
import { RabbitMessage } from '../interfaces';
import { Log } from '../log/log.interface';

import RabbitClientProducer from './producer';
import RabbitClientConsumer from './consumer';

export class RabbitClient {
  private logger: Log;

  private isInitialized: boolean;

  private static instance: RabbitClient;

  private connection: Connection;

  private produceChannel: Channel;

  private consumeChannel: Channel;

  private eventEmitter: EventEmitter;

  private producer: RabbitClientProducer;

  private consumer: RabbitClientConsumer;

  private constructor() {
    this.isInitialized = false;
  }

  public static getRange(): RabbitClient {
    if (!this.instance) {
      this.instance = new RabbitClient();
    }
    return this.instance;
  }

  public async initialize(logger: Log): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.logger = logger;

    this.connection = await connect(RABBIT_URL);
    this.produceChannel = await this.connection.createChannel();
    this.consumeChannel = await this.connection.createChannel();

    const { queue: replyToQueue } = await this.consumeChannel.assertQueue('', { exclusive: true });

    this.eventEmitter = new EventEmitter();
    this.producer = new RabbitClientProducer(
      this.produceChannel,
      replyToQueue,
      this.eventEmitter,
      this.logger,
    );
    this.consumer = new RabbitClientConsumer(
      this.consumeChannel,
      replyToQueue,
      this.eventEmitter,
      this.logger,
    );

    this.consumer.consumeMessages();

    this.isInitialized = true;
    this.logger.info('RabbitMQ client is initialized');
  }

  public async produce<T = RabbitMessage>(message: T): Promise<T> {
    if (!this.isInitialized) {
      throw new Error('Rabbit client is not initialized...');
    }
    return this.producer.produceMessage(message);
  }
}

export default RabbitClient.getRange();
