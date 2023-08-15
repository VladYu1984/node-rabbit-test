import { pino, LoggerOptions } from 'pino';

import { SERVICE_NAME } from '../constants';

const loggerConfig: LoggerOptions = {
  name: SERVICE_NAME,
  level: 'info',
};

export default pino(loggerConfig);
