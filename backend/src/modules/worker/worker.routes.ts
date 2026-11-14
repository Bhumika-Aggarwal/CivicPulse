import { Router } from 'express';
import { getWorkerTasks, acceptTask, updateTaskStatus } from './worker.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

export const workerRouter = Router();

workerRouter.use(authenticate);
workerRouter.use(authorize(['WORKER', 'ADMIN']));

workerRouter.get('/tasks', getWorkerTasks);
workerRouter.post('/tasks/:taskId/accept', acceptTask);
workerRouter.post('/tasks/:taskId/status', updateTaskStatus);
