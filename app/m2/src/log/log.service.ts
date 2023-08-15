import { pino, LoggerOptions } from 'pino';

import { SERVICE_NAME } from '../constants';

const loggerConfig: LoggerOptions = {
  name: SERVICE_NAME,
};

export default pino(loggerConfig);
