import { Router } from 'express';
import {
  getCategories,
  createComplaint,
  getMyComplaints,
  getComplaintById,
} from './complaints.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export const complaintRouter = Router();

// Public routes
complaintRouter.get('/categories', getCategories);

// Authenticated citizen/authority routes
complaintRouter.post('/', authenticate, createComplaint);
complaintRouter.get('/mine', authenticate, getMyComplaints);
complaintRouter.get('/:id', authenticate, getComplaintById);
