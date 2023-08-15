/* eslint-disable @typescript-eslint/dot-notation */
import amqp, { Channel, Connection } from 'amqplib';

import { AMQP_QUEUE_NAME, RABBIT_URL } from '../constants';
import { Log } from '../log/log.interface';

import { RabbitClient } from './clients';
import RabbitClientProducer from './producer';

jest.spyOn(RabbitClientProducer.prototype, 'produceMessage');

const mockChannel = { assertQueue: jest.fn() } as any as Channel;
const mockConnection = {
  createChannel: jest.fn().mockResolvedValue(mockChannel),
  close: jest.fn(),
} as any as Connection;

const connectSpy = jest.spyOn(amqp, 'connect').mockResolvedValue(mockConnection);

const logger = {
  info: jest.fn(),
  error: jest.fn(),
} as unknown as Log;

describe('Rabbit client', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should initialize RabbitMQ client', async () => {
    const rabbitClient = RabbitClient.getRange();

    await rabbitClient.initialize(logger);

    expect(rabbitClient).toBeDefined();
    expect(rabbitClient['isInitialized']).toBeTruthy();

    expect(connectSpy).toHaveBeenCalledWith(RABBIT_URL);
    expect(rabbitClient['consumeChannel']['assertQueue']).toHaveBeenCalledWith(
      AMQP_QUEUE_NAME,
      expect.any(Object),
    );
    expect(rabbitClient['connection']['createChannel']).toHaveBeenCalledTimes(2);
    await rabbitClient.destroy();
  });
});
