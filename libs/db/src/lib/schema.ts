import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import KSUID from 'ksuid';

function withTimestamps() {
  return {
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').$onUpdateFn(() => new Date()),
  };
}

export const users = pgTable(
  'users',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }),
    phoneNumber: varchar('phone_number', { length: 255 }).notNull(),
    email: varchar({ length: 255 }),
    password: varchar('password_digest', { length: 255 }).notNull(),
    resourceId: varchar('resource_id', { length: 255 })
      .notNull()
      .$defaultFn(() => KSUID.randomSync().string),
    disabledAt: timestamp('disabled_at'),
    confirmedAt: timestamp('confirmed_at'),
    ...withTimestamps(),
  },
  (t) => [
    uniqueIndex().on(t.phoneNumber),
    uniqueIndex().on(t.resourceId),
    uniqueIndex().on(t.phoneNumber, t.email),
  ]
);

export const virtualNumbers = pgTable(
  'virtual_numbers',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id').references(() => users.id),
    phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
    networkId: varchar('network_id', { length: 255 }).notNull(),
    resourceId: varchar('resource_id', { length: 255 }).$defaultFn(
      () => KSUID.randomSync().string
    ),
    countryCode: varchar('country_code', { length: 3 }),
    areaCode: varchar('area_code', { length: 10 }),
    forwardingEnabled: boolean('forwarding_enabled').default(true),
    ...withTimestamps(),
  },
  (t) => [uniqueIndex().on(t.networkId), uniqueIndex().on(t.resourceId)]
);

export const callLogs = pgTable(
  'call_logs',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    virtualNumberId: integer('virtual_number_id')
      .notNull()
      .references(() => virtualNumbers.id),
    incomingNumber: varchar('incoming_number', { length: 50 }).notNull(),
    startTime: timestamp('start_time').notNull(),
    durationSeconds: integer().notNull(),
    status: varchar({ length: 50 }),
    ...withTimestamps(),
  },
  (t) => [
    index().on(t.virtualNumberId),
    check('call_logs_duration_check', sql`${t.durationSeconds} >= 0`),
  ]
);

export const textLogs = pgTable(
  'text_logs',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    virtualNumberId: integer('virtual_number_id')
      .notNull()
      .references(() => virtualNumbers.id),
    incomingNumber: varchar('incoming_number', { length: 50 }).notNull(),
    content: text().notNull(),
    receivedAt: timestamp().notNull(),
    multimedia: boolean().default(false),
    status: varchar({ length: 50 }),
    ...withTimestamps(),
  },
  (t) => [index().on(t.virtualNumberId)]
);

export const usageMetrics = pgTable(
  'usage_metrics',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    virtualNumberId: integer().references(() => virtualNumbers.id),
    forwardedCalls: integer('forwarded_calls').default(0),
    forwardedTexts: integer('forwarded_texts').default(0),
    ...withTimestamps(),
  },
  (t) => [index().on(t.virtualNumberId)]
);
