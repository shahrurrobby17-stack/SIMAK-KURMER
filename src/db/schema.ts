import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const teachingSchedules = pgTable('teaching_schedules', {
  id: text('id').primaryKey(),
  uid: text('uid').notNull(),
  day: varchar('day', { length: 20 }).notNull(),
  time: varchar('time', { length: 50 }).notNull(),
  className: varchar('class_name', { length: 50 }).notNull(),
  subject: varchar('subject', { length: 150 }).notNull(),
  teacher: varchar('teacher', { length: 150 }).notNull(),
  room: varchar('room', { length: 50 }).notNull(),
  notes: text('notes'),
  schoolName: varchar('school_name', { length: 150 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
