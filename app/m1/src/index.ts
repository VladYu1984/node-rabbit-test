import http from 'node:http';

import rabbitClient from './rabbitmq/clients';
import { HTTP_HOSTNAME, HTTP_PORT } from './constants';
import TaskService from './tasks/task.service';
import logger from './log/log.service';

async function bootstrap(): Promise<void> {
  await rabbitClient.initialize(logger);

  const server = http.createServer();

  server.on('request', async (req, res) => {
    const chunks: string[] = [];
    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', async () => {
      let body: Record<string, unknown> | undefined;
      try {
        body = JSON.parse(chunks.join('\n'));
      } catch (error) {
        body = undefined;
      }

      const message = TaskService.fromRequest(req, body);

      const reply = await rabbitClient.produce(message);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(reply));
      res.end();
    });
  });

  server.on('error', (err: Error & { code: string }) => {
    if (err?.code === 'EACCES') {
      logger.error(`No access to port: ${HTTP_PORT}`);
    } else {
      logger.error(err, 'Error');
    }
  });

  server.listen(HTTP_PORT, HTTP_HOSTNAME, () => {
    logger.info(`Server running at http://${HTTP_HOSTNAME}:${HTTP_PORT}/`);
  });
}

bootstrap();
