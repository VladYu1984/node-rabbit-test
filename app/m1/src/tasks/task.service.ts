import { IncomingMessage } from 'node:http';

import { Task, TaskType } from '../interfaces';

import echoTask from './echo.task';

export default class TaskService {
  private static RequestToTaskMap = {
    'get /echo': echoTask,
  };

  public static fromRequest(req: IncomingMessage, body: Record<string, unknown> | undefined): Task {
    const { method, url } = req;

    const task = TaskService.RequestToTaskMap[`${method} ${url}`.toLocaleLowerCase()];
    return task ? task(req, body) : this.unknownTask();
  }

  private static unknownTask(): Task {
    return { taskType: TaskType.UNKNOWN };
  }
}
