import { Router } from 'express';
import { getDepartmentComplaints, getDepartmentWorkers, assignWorker } from './authority.controller.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

export const authorityRouter = Router();

authorityRouter.use(authenticate);
authorityRouter.use(authorize(['SUPERVISOR', 'ADMIN']));

authorityRouter.get('/complaints', getDepartmentComplaints);
authorityRouter.get('/workers', getDepartmentWorkers);
authorityRouter.post('/complaints/:id/assign', assignWorker);
