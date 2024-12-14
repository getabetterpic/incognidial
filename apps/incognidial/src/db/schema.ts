import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
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
    resourceId: varchar('resource_id', { length: 255 })
      .notNull()
      .$defaultFn(() => KSUID.randomSync().string),
    email: varchar({ length: 255 }),
    disabledAt: timestamp('disabled_at'),
    ...withTimestamps(),
  },
  (t) => [
    {
      users_phone_number: unique().on(t.phoneNumber),
      users_resource_id: unique().on(t.resourceId),
    },
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
  (t) => [
    {
      phone_number_idx: index().on(t.phoneNumber),
      unique_resource_id: unique().on(t.resourceId),
      unique_network_id: unique().on(t.networkId),
    },
  ]
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
    {
      virtual_number_idx: index().on(t.virtualNumberId),
      check_duration: check('duration_check', sql`${t.durationSeconds} >= 0`),
    },
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
  (t) => [
    {
      virtual_number_idx: index().on(t.virtualNumberId),
    },
  ]
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
  (t) => [
    {
      virtual_number_idx: index().on(t.virtualNumberId),
    },
  ]
);
