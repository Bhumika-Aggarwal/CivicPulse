import { pgTable, uuid, varchar, text, timestamp, pgEnum, doublePrecision } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { departments } from './departments.js';
import { complaintCategories } from './categories.js';

export const complaintStatusEnum = pgEnum('complaint_status', [
  'SUBMITTED',
  'ASSIGNED',
  'ACCEPTED',
  'ON_THE_WAY',
  'ARRIVED',
  'IN_PROGRESS',
  'SUBMITTED_FOR_VERIFICATION',
  'RESOLVED',
  'REJECTED',
  'REOPENED',
  'CANCELLED',
]);

export const complaintPriorityEnum = pgEnum('complaint_priority', [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
]);

export const complaints = pgTable('complaints', {
  id: uuid('id').defaultRandom().primaryKey(),
  complaintNumber: varchar('complaint_number', { length: 30 }).notNull().unique(),
  citizenId: uuid('citizen_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: uuid('category_id')
    .references(() => complaintCategories.id)
    .notNull(),
  departmentId: uuid('department_id')
    .references(() => departments.id)
    .notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description').notNull(),
  status: complaintStatusEnum('status').default('SUBMITTED').notNull(),
  priority: complaintPriorityEnum('priority').default('MEDIUM').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  addressText: text('address_text'),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const complaintMedia = pgTable('complaint_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  complaintId: uuid('complaint_id')
    .references(() => complaints.id, { onDelete: 'cascade' })
    .notNull(),
  uploadedBy: uuid('uploaded_by')
    .references(() => users.id)
    .notNull(),
  secureUrl: varchar('secure_url', { length: 500 }).notNull(),
  publicId: varchar('public_id', { length: 255 }).notNull(),
  format: varchar('format', { length: 20 }),
  bytes: doublePrecision('bytes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const complaintStatusHistory = pgTable('complaint_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  complaintId: uuid('complaint_id')
    .references(() => complaints.id, { onDelete: 'cascade' })
    .notNull(),
  fromStatus: varchar('from_status', { length: 50 }),
  toStatus: varchar('to_status', { length: 50 }).notNull(),
  changedBy: uuid('changed_by')
    .references(() => users.id)
    .notNull(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
