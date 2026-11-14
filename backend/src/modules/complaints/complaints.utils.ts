import { db } from '../../db/client.js';
import { sql } from 'drizzle-orm';
import { complaints } from '../../db/schema/complaints.js';

export async function generateComplaintNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();

  try {
    // Count complaints for this year to create sequential human-readable identifier
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(complaints)
      .where(sql`EXTRACT(YEAR FROM ${complaints.createdAt}) = ${currentYear}`);

    const count = Number(countResult[0]?.count || 0) + 1;
    const padded = String(count).padStart(5, '0');
    return `CP-${currentYear}-${padded}`;
  } catch {
    // Fallback in case of offline / test mode
    const random = Math.floor(10000 + Math.random() * 90000);
    return `CP-${currentYear}-${random}`;
  }
}
