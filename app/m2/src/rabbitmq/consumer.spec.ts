import { AMQP_QUEUE_NAME } from '../constants';

import RabbitClientConsumer from './consumer';

const mockMessageContent = { test: 'test' };
const mockcorrelationId = 'cid123';
const mockreplyTo = 'replyToQueue';

const mockMessageHandler = {
  handle: jest.fn(),
};

const mockLogger = {
  error: jest.fn(),
};

describe('RabbitClientConsumer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should consume messages from AMQP queue', async () => {
    const mockMessage = {
      content: Buffer.from(JSON.stringify(mockMessageContent)),
      properties: {
        correlationId: mockcorrelationId,
        replyTo: mockreplyTo,
      },
    };

    const mockChannel = {
      consume: jest.fn().mockImplementation((queue, callback) => {
        callback(mockMessage);
      }),
      ack: jest.fn(),
    };

    const rabbitClientConsumer = new RabbitClientConsumer(mockChannel as any, mockLogger as any);

    await rabbitClientConsumer.consumeMessages(mockMessageHandler);

    expect(mockMessageHandler.handle).toHaveBeenCalledWith(
      mockMessageContent,
      mockcorrelationId,
      mockreplyTo,
    );
    expect(mockChannel.consume).toHaveBeenCalledWith(AMQP_QUEUE_NAME, expect.any(Function));
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
  });

  it('should not call messageHandler.handle when message is null', async () => {
    const mockChannel = {
      consume: jest.fn().mockImplementationOnce((queue, callback) => callback(null)),
    };

    const rabbitClientConsumer = new RabbitClientConsumer(mockChannel as any, mockLogger as any);

    await rabbitClientConsumer.consumeMessages(mockMessageHandler);

    expect(mockMessageHandler.handle).not.toHaveBeenCalled();
  });

  it('should log an error and not call messageHandler.handle when correlationId or replyTo are missing', async () => {
    const mockMessage = {
      content: Buffer.from(JSON.stringify(mockMessageContent)),
      properties: {},
    };

    const mockChannel = {
      consume: jest.fn().mockImplementation((queue, callback) => callback(mockMessage)),
      reject: jest.fn(),
    };
    const logger = { error: jest.fn() };
    const rabbitClientConsumer = new RabbitClientConsumer(mockChannel as any, logger as any);

    await rabbitClientConsumer.consumeMessages(mockMessageHandler);

    expect(logger.error).toHaveBeenCalledWith({}, 'Missing some message properties...');
    expect(mockMessageHandler.handle).not.toHaveBeenCalled();
    expect(mockChannel.reject).toHaveBeenCalledWith(mockMessage, false);
  });

  it('should reject message and log error when message content cannot be parsed to JSON', async () => {
    const mockMessage = {
      content: Buffer.from('invalid JSON'),
      properties: {
        correlationId: mockcorrelationId,
        replyTo: mockreplyTo,
      },
    };

    const mockChannel = {
      consume: jest.fn().mockImplementation((queue, callback) => callback(mockMessage)),
      ack: jest.fn(),
      reject: jest.fn(),
    };
    const logger = { error: jest.fn() };
    const rabbitClientConsumer = new RabbitClientConsumer(mockChannel as any, logger as any);

    mockMessageHandler.handle.mockRejectedValueOnce(null);

    await rabbitClientConsumer.consumeMessages(mockMessageHandler);

    expect(logger.error).toHaveBeenCalledWith(
      { correlationId: mockcorrelationId, replyTo: mockreplyTo, error: expect.any(SyntaxError) },
      'Error while passing message content',
    );

    expect(mockChannel.reject).toHaveBeenCalledWith(mockMessage, false);
  });

  it('should log an error and not throw the error when an error occurs while calling messageHandler.handle', async () => {
    const mockMessage = {
      content: Buffer.from(JSON.stringify(mockMessageContent)),
      properties: {
        correlationId: mockcorrelationId,
        replyTo: mockreplyTo,
      },
    };

    const mockChannel = {
      consume: jest.fn().mockImplementation((queue, callback) => callback(mockMessage)),
      ack: jest.fn(),
      reject: jest.fn(),
    };
    const logger = { error: jest.fn() };
    const rabbitClientConsumer = new RabbitClientConsumer(mockChannel as any, logger as any);

    mockMessageHandler.handle.mockRejectedValueOnce(null);

    await rabbitClientConsumer.consumeMessages(mockMessageHandler);

    expect(logger.error).toHaveBeenCalledWith(
      { correlationId: mockcorrelationId, replyTo: mockreplyTo, error: null },
      'Error while handle message',
    );
    expect(mockChannel.reject).toHaveBeenCalledWith(mockMessage, false);
  });
});
