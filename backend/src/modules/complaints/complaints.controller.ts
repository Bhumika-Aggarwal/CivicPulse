import { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { complaints, complaintMedia, complaintStatusHistory } from '../../db/schema/complaints.js';
import { complaintCategories } from '../../db/schema/categories.js';
import { departments } from '../../db/schema/departments.js';
import { createComplaintSchema } from './complaints.schema.js';
import { generateComplaintNumber } from './complaints.utils.js';
import { logger } from '../../config/logger.js';

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const list = await db
      .select({
        id: complaintCategories.id,
        name: complaintCategories.name,
        code: complaintCategories.code,
        description: complaintCategories.description,
        defaultDepartmentId: complaintCategories.defaultDepartmentId,
        departmentName: departments.name,
      })
      .from(complaintCategories)
      .innerJoin(departments, eq(complaintCategories.defaultDepartmentId, departments.id))
      .where(eq(complaintCategories.isActive, true));

    res.json({ success: true, data: list });
  } catch (error) {
    logger.error({ error }, 'Error fetching categories');
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch categories.' } });
  }
}

export async function createComplaint(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    return;
  }

  const parseResult = createComplaintSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid complaint input.', details: parseResult.error.errors },
    });
    return;
  }

  const { categoryId, title, description, latitude, longitude, addressText, priority, media } = parseResult.data;

  try {
    // 1. Verify category and find deterministic routing department
    const [category] = await db
      .select()
      .from(complaintCategories)
      .where(eq(complaintCategories.id, categoryId))
      .limit(1);

    if (!category || !category.isActive) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_CATEGORY', message: 'The selected category is not active or invalid.' },
      });
      return;
    }

    const departmentId = category.defaultDepartmentId;
    const complaintNumber = await generateComplaintNumber();

    // 2. Insert complaint record
    const [newComplaint] = await db
      .insert(complaints)
      .values({
        complaintNumber,
        citizenId: req.user.userId,
        categoryId,
        departmentId,
        title,
        description,
        latitude,
        longitude,
        addressText,
        priority,
        status: 'SUBMITTED',
      })
      .returning();

    // 3. Insert initial status history entry
    await db.insert(complaintStatusHistory).values({
      complaintId: newComplaint.id,
      fromStatus: null,
      toStatus: 'SUBMITTED',
      changedBy: req.user.userId,
      note: 'Complaint submitted by citizen.',
    });

    // 4. Attach media metadata if present
    if (media && media.length > 0) {
      for (const item of media) {
        await db.insert(complaintMedia).values({
          complaintId: newComplaint.id,
          uploadedBy: req.user.userId,
          secureUrl: item.secureUrl,
          publicId: item.publicId,
          format: item.format,
          bytes: item.bytes,
        });
      }
    }

    logger.info({ complaintId: newComplaint.id, complaintNumber }, 'New complaint created successfully');

    res.status(201).json({
      success: true,
      data: {
        complaint: newComplaint,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error creating complaint');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create complaint.' },
    });
  }
}

export async function getMyComplaints(req: Request, res: Response): Promise<void> {
  if (!req.user) {
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
        updatedAt: complaints.updatedAt,
        categoryName: complaintCategories.name,
        departmentName: departments.name,
      })
      .from(complaints)
      .innerJoin(complaintCategories, eq(complaints.categoryId, complaintCategories.id))
      .innerJoin(departments, eq(complaints.departmentId, departments.id))
      .where(eq(complaints.citizenId, req.user.userId))
      .orderBy(desc(complaints.createdAt));

    res.json({ success: true, data: list });
  } catch (error) {
    logger.error({ error }, 'Error fetching citizen complaints');
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch complaints.' } });
  }
}

export async function getComplaintById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const [complaint] = await db
      .select({
        id: complaints.id,
        complaintNumber: complaints.complaintNumber,
        citizenId: complaints.citizenId,
        title: complaints.title,
        description: complaints.description,
        status: complaints.status,
        priority: complaints.priority,
        latitude: complaints.latitude,
        longitude: complaints.longitude,
        addressText: complaints.addressText,
        createdAt: complaints.createdAt,
        resolvedAt: complaints.resolvedAt,
        categoryName: complaintCategories.name,
        departmentName: departments.name,
      })
      .from(complaints)
      .innerJoin(complaintCategories, eq(complaints.categoryId, complaintCategories.id))
      .innerJoin(departments, eq(complaints.departmentId, departments.id))
      .where(eq(complaints.id, id))
      .limit(1);

    if (!complaint) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Complaint not found.' } });
      return;
    }

    // Role-based privacy check: citizens can only view their own
    if (req.user?.role === 'CITIZEN' && complaint.citizenId !== req.user.userId) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
      return;
    }

    // Fetch media and status history
    const media = await db.select().from(complaintMedia).where(eq(complaintMedia.complaintId, id));
    const history = await db
      .select()
      .from(complaintStatusHistory)
      .where(eq(complaintStatusHistory.complaintId, id))
      .orderBy(desc(complaintStatusHistory.createdAt));

    res.json({
      success: true,
      data: {
        complaint,
        media,
        history,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Error fetching complaint details');
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch complaint details.' } });
  }
}
