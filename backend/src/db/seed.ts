import { db } from './client.js';
import { departments } from './schema/departments.js';
import { complaintCategories } from './schema/categories.js';
import { users } from './schema/users.js';
import { hashPassword } from '../modules/auth/auth.utils.js';
import { logger } from '../config/logger.js';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  logger.info('🌱 Starting database seed...');

  try {
    // 1. Seed Municipal Departments
    const deptData = [
      {
        name: 'Roads & Infrastructure',
        code: 'DEPT_ROADS',
        description: 'Road damage, potholes, bridges, pavements, and roadside barriers',
      },
      {
        name: 'Public Health & Sanitation',
        code: 'DEPT_SANITATION',
        description: 'Garbage accumulation, street cleaning, open drains, and bio-waste',
      },
      {
        name: 'Water Supply & Sewerage',
        code: 'DEPT_WATER',
        description: 'Pipeline leakage, water contamination, sewage overflow, and pump failure',
      },
      {
        name: 'Electrical & Lighting',
        code: 'DEPT_ELECTRICAL',
        description: 'Non-functional streetlights, exposed cables, transformer spark, and blackout',
      },
      {
        name: 'Traffic & Road Safety',
        code: 'DEPT_TRAFFIC',
        description: 'Broken traffic signals, illegal parking bottlenecks, road signs, and blind spots',
      },
    ];

    const insertedDepts: Record<string, string> = {};

    for (const d of deptData) {
      const existing = await db
        .select()
        .from(departments)
        .where(eq(departments.code, d.code))
        .limit(1);

      if (existing.length === 0) {
        const [inserted] = await db.insert(departments).values(d).returning({ id: departments.id, code: departments.code });
        insertedDepts[inserted.code] = inserted.id;
      } else {
        insertedDepts[existing[0].code] = existing[0].id;
      }
    }

    // 2. Seed Standard Complaint Categories
    const categoriesData = [
      {
        name: 'Pothole & Road Damage',
        code: 'CAT_POTHOLE',
        description: 'Deep road potholes, broken asphalt, or sinkholes',
        defaultDeptCode: 'DEPT_ROADS',
      },
      {
        name: 'Garbage Dump Overflow',
        code: 'CAT_GARBAGE',
        description: 'Unattended public waste bins or unauthorized trash piles',
        defaultDeptCode: 'DEPT_SANITATION',
      },
      {
        name: 'Water Pipe Leakage',
        code: 'CAT_WATER_LEAK',
        description: 'Burst municipal water pipes or high-pressure water loss',
        defaultDeptCode: 'DEPT_WATER',
      },
      {
        name: 'Streetlight Failure',
        code: 'CAT_STREETLIGHT',
        description: 'Dark streets due to burnt-out bulbs or cut electrical supply',
        defaultDeptCode: 'DEPT_ELECTRICAL',
      },
      {
        name: 'Traffic Signal Non-Functional',
        code: 'CAT_TRAFFIC_SIGNAL',
        description: 'Stuck or blackout intersection traffic lights causing gridlock',
        defaultDeptCode: 'DEPT_TRAFFIC',
      },
    ];

    for (const c of categoriesData) {
      const existing = await db
        .select()
        .from(complaintCategories)
        .where(eq(complaintCategories.code, c.code))
        .limit(1);

      if (existing.length === 0) {
        const deptId = insertedDepts[c.defaultDeptCode];
        if (deptId) {
          await db.insert(complaintCategories).values({
            name: c.name,
            code: c.code,
            description: c.description,
            defaultDepartmentId: deptId,
          });
        }
      }
    }

    // 3. Seed Default System Administrator
    const adminEmail = 'admin@civicpulse.local';
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existingAdmin.length === 0) {
      const passwordHash = await hashPassword('AdminCivicPulse123!');
      await db.insert(users).values({
        fullName: 'City Administrator',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      });
      logger.info('Created default administrator: admin@civicpulse.local (Pass: AdminCivicPulse123!)');
    }

    logger.info('Database seeded successfully.');
  } catch (error) {
    logger.error({ error }, 'Database seed error');
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}
