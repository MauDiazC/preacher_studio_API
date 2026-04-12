import api from './api';

export interface TaskStatus {
  task_id: string;
  status: string;
  result?: any;
  error?: string;
}

export const taskService = {
  getTaskStatus: async (taskId: string): Promise<TaskStatus> => {
    const response = await api.get<TaskStatus>(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Polls a task until it's finished.
   * @param taskId The ID of the Celery task.
   * @param interval Ms between polls.
   * @param maxRetries Maximum number of polls.
   */
  pollTask: async <T>(
    taskId: string, 
    interval: number = 2000, 
    maxRetries: number = 60
  ): Promise<T> => {
    let retries = 0;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const task = await taskService.getTaskStatus(taskId);
          
          if (task.status === 'SUCCESS') {
            resolve(task.result as T);
          } else if (task.status === 'FAILURE' || task.status === 'REVOKED') {
            reject(new Error(task.error || 'Tarea fallida'));
          } else {
            retries++;
            if (retries >= maxRetries) {
              reject(new Error('Tiempo de espera agotado para la tarea'));
            } else {
              setTimeout(poll, interval);
            }
          }
        } catch (error) {
          reject(error);
        }
      };
      
      poll();
    });
  }
};
