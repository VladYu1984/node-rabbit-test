export type RabbitMessage = Task;

export enum TaskType {
  UNKNOWN = 'unknown',
  ECHO = 'echo',
}

export interface Task {
  taskType: TaskType;
  taskData?: Record<string, unknown> | undefined;
}
