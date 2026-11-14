import { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { complaints, complaintStatusHistory } from '../../db/schema/complaints.js';
import { assignments, notifications } from '../../db/schema/assignments.js';
import { users } from '../../db/schema/users.js';
import { departments } from '../../db/schema/departments.js';
import { complaintCategories } from '../../db/schema/categories.js';
import { logger } from '../../config/logger.js';

export async function getDepartmentComplaints(req: Request, res: Response): Promise<void> {
  const supervisor = req.user;
  if (!supervisor) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    return;
  }

  try {
    const list = await db
      .select({
        id: complaints.id,
        complaintNumber: complaints.complaintNumber,
        title: complaints.title,
        description: complaints.description,
        status: complaints.status,
        priority: complaints.priority,
        latitude: complaints.latitude,
        longitude: complaints.longitude,
        addressText: complaints.addressText,
        createdAt: complaints.createdAt,
        categoryName: complaintCategories.name,
        departmentName: departments.name,
        citizenName: users.fullName,
      })
      .from(complaints)
      .innerJoin(complaintCategories, eq(complaints.categoryId, complaintCategories.id))
      .innerJoin(departments, eq(complaints.departmentId, departments.id))
      .innerJoin(users, eq(complaints.citizenId, users.id))
      .orderBy(desc(complaints.createdAt));

    res.json({ success: true, data: list });
  } catch (error) {
    logger.error({ error }, 'Error fetching authority complaints');
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch complaints.' } });
  }
}

export async function getDepartmentWorkers(_req: Request, res: Response): Promise<void> {
  try {
    const workers = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        departmentId: users.departmentId,
      })
      .from(users)
      .where(eq(users.role, 'WORKER'));

    res.json({ success: true, data: workers });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch workers.' } });
  }
}

export async function assignWorker(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { workerId, reason } = req.body;

  if (!req.user || !workerId) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'workerId is required' } });
    return;
  }

  try {
    // 1. Verify complaint exists
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
    if (!complaint) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found.' } });
      return;
    }

    // 2. Create new assignment record
    const [newAssignment] = await db
      .insert(assignments)
      .values({
        complaintId: id,
        workerId,
        assignedBy: req.user.userId,
        status: 'PENDING',
        reason: reason || 'Assigned by supervisor for resolution.',
      })
      .returning();

    // 3. Update complaint status to ASSIGNED
    await db
      .update(complaints)
      .set({ status: 'ASSIGNED', updatedAt: new Date() })
      .where(eq(complaints.id, id));

    // 4. Log status history
    await db.insert(complaintStatusHistory).values({
      complaintId: id,
      fromStatus: complaint.status,
      toStatus: 'ASSIGNED',
      changedBy: req.user.userId,
      note: reason ? `Worker assigned: ${reason}` : 'Worker assigned by supervisor.',
    });

    // 5. Create in-app notification for the worker
    await db.insert(notifications).values({
      recipientId: workerId,
      type: 'TASK_ASSIGNED',
      title: 'New Field Task Assigned',
      message: `You have been assigned complaint ${complaint.complaintNumber}: ${complaint.title}`,
      resourceType: 'complaint',
      resourceId: complaint.id,
    });

    res.json({
      success: true,
      data: {
        assignment: newAssignment,
        message: 'Worker assigned successfully.',
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error assigning worker');
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to assign worker.' } });
  }
}
