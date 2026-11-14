import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { complaints } from './complaints.js';
import { users } from './users.js';

export const assignmentStatusEnum = pgEnum('assignment_status', [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
]);

export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  complaintId: uuid('complaint_id')
    .references(() => complaints.id, { onDelete: 'cascade' })
    .notNull(),
  workerId: uuid('worker_id')
    .references(() => users.id)
    .notNull(),
  assignedBy: uuid('assigned_by')
    .references(() => users.id)
    .notNull(),
  status: assignmentStatusEnum('status').default('PENDING').notNull(),
  reason: text('reason'),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientId: uuid('recipient_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  message: text('message').notNull(),
  resourceType: varchar('resource_type', { length: 50 }),
  resourceId: uuid('resource_id'),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
