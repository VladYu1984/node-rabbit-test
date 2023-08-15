import { IncomingMessage } from 'http';

import { Task, TaskType } from '../interfaces';

export default function echoTask(req: IncomingMessage, body: Record<string, unknown>): Task {
  return {
    taskType: TaskType.ECHO,
    taskData: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body,
    },
  };
}
