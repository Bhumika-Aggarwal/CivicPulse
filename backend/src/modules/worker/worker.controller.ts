import { Request, Response } from 'express';
import { eq, desc, and } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { complaints, complaintStatusHistory } from '../../db/schema/complaints.js';
import { assignments, notifications } from '../../db/schema/assignments.js';
import { complaintCategories } from '../../db/schema/categories.js';
import { departments } from '../../db/schema/departments.js';
import { logger } from '../../config/logger.js';

export async function getWorkerTasks(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    return;
  }

  try {
    const tasks = await db
      .select({
        assignmentId: assignments.id,
        assignmentStatus: assignments.status,
        assignedAt: assignments.assignedAt,
        acceptedAt: assignments.acceptedAt,
        complaintId: complaints.id,
        complaintNumber: complaints.complaintNumber,
        title: complaints.title,
        description: complaints.description,
        complaintStatus: complaints.status,
        priority: complaints.priority,
        latitude: complaints.latitude,
        longitude: complaints.longitude,
        addressText: complaints.addressText,
        categoryName: complaintCategories.name,
        departmentName: departments.name,
      })
      .from(assignments)
      .innerJoin(complaints, eq(assignments.complaintId, complaints.id))
      .innerJoin(complaintCategories, eq(complaints.categoryId, complaintCategories.id))
      .innerJoin(departments, eq(complaints.departmentId, departments.id))
      .where(eq(assignments.workerId, req.user.userId))
      .orderBy(desc(assignments.assignedAt));

    res.json({ success: true, data: tasks });
  } catch (error) {
    logger.error({ error }, 'Error fetching worker tasks');
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch tasks.' } });
  }
}

export async function acceptTask(req: Request, res: Response): Promise<void> {
  const { taskId } = req.params;
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    return;
  }

  try {
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.id, taskId), eq(assignments.workerId, req.user.userId)))
      .limit(1);

    if (!assignment) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assigned task not found.' } });
      return;
    }

    // Update assignment to ACCEPTED
    await db
      .update(assignments)
      .set({ status: 'ACCEPTED', acceptedAt: new Date() })
      .where(eq(assignments.id, taskId));

    // Update complaint to ACCEPTED
    await db
      .update(complaints)
      .set({ status: 'ACCEPTED', updatedAt: new Date() })
      .where(eq(complaints.id, assignment.complaintId));

    // Status history
    await db.insert(complaintStatusHistory).values({
      complaintId: assignment.complaintId,
      fromStatus: 'ASSIGNED',
      toStatus: 'ACCEPTED',
      changedBy: req.user.userId,
      note: 'Field worker accepted task assignment.',
    });

    res.json({ success: true, data: { message: 'Task accepted.' } });
  } catch (error) {
    logger.error({ error }, 'Error accepting task');
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to accept task.' } });
  }
}

export async function updateTaskStatus(req: Request, res: Response): Promise<void> {
  const { taskId } = req.params;
  const { toStatus, note } = req.body;

  const validTransitions = ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'];
  if (!validTransitions.includes(toStatus)) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_TRANSITION', message: `Permitted transitions: ${validTransitions.join(', ')}` },
    });
    return;
  }

  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    return;
  }

  try {
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.id, taskId), eq(assignments.workerId, req.user.userId)))
      .limit(1);

    if (!assignment) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assigned task not found.' } });
      return;
    }

    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, assignment.complaintId))
      .limit(1);

    // Update complaint status
    await db
      .update(complaints)
      .set({ status: toStatus as any, updatedAt: new Date() })
      .where(eq(complaints.id, assignment.complaintId));

    // Record timeline audit
    await db.insert(complaintStatusHistory).values({
      complaintId: assignment.complaintId,
      fromStatus: complaint.status,
      toStatus,
      changedBy: req.user.userId,
      note: note || `Worker moved status to ${toStatus}`,
    });

    // Notify citizen about progress
    await db.insert(notifications).values({
      recipientId: complaint.citizenId,
      type: 'STATUS_UPDATED',
      title: 'Complaint Status Update',
      message: `Your complaint ${complaint.complaintNumber} is now ${toStatus.replace(/_/g, ' ')}.`,
      resourceType: 'complaint',
      resourceId: complaint.id,
    });

    res.json({ success: true, data: { status: toStatus, message: 'Status updated successfully.' } });
  } catch (error) {
    logger.error({ error }, 'Error updating task status');
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update task status.' } });
  }
}
