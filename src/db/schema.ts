import { relations } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { pgEnum, pgTable, primaryKey, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// Enums
export const projectStatusEnum = pgEnum('project_status', ['pending', 'in_progress', 'completed', 'cancelled']);

const timestamps = {
  created_at: timestamp({ withTimezone: true, mode: 'date' }).notNull().defaultNow(),
  updated_at: timestamp({ withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
const timestampsWithDeletedAt = {
  ...timestamps,
  deleted_at: timestamp({ withTimezone: true, mode: 'date' }),
};

export const rolesTable = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull().unique(),
  chinese_name: varchar({ length: 255 }),
  ...timestamps,
});

export const permissionsTable = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull().unique(),
  // Permission string like "order:create", "order:read", etc.
  roleId: uuid('role_id')
    .notNull()
    .references(() => rolesTable.id),
  ...timestamps,
});

export const departmentsTable = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  ...timestamps,
});

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  account: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  // users with no password cannot login to erp
  passwordHash: varchar({ length: 255 }),
  ...timestamps,
});

export const userDepartmentsTable = pgTable('user_departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id),
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departmentsTable.id),
  ...timestamps,
});

export const roleDepartmentsTable = pgTable('role_departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id')
    .notNull()
    .references(() => rolesTable.id),
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departmentsTable.id),
  ...timestamps,
});

export const sessionsTable = pgTable('sessions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
    mode: 'date',
  }).notNull(),
});

export const customersTable = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerNumber: varchar({ length: 50 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  nickname: varchar({ length: 100 }).notNull(),
  category: varchar({ length: 100 }),
  principal: varchar({ length: 100 }),
  taxDeductionCategory: varchar({ length: 100 }),
  taxId: varchar({ length: 50 }).notNull(),
  phone: varchar({ length: 50 }).notNull(),
  fax: varchar({ length: 50 }),
  county: varchar({ length: 100 }),
  district: varchar({ length: 100 }),
  address: varchar({ length: 100 }),
  invoiceCounty: varchar({ length: 100 }),
  invoiceDistrict: varchar({ length: 100 }),
  invoiceAddress: varchar({ length: 100 }),
  ...timestampsWithDeletedAt,
});

export const projectsTable = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectNumber: varchar({ length: 50 }).notNull(),
  status: projectStatusEnum('status').notNull().default('pending'),
  name: varchar({ length: 255 }).notNull(),
  county: varchar({ length: 100 }).notNull(),
  district: varchar({ length: 100 }).notNull(),
  address: varchar({ length: 100 }).notNull(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customersTable.id),
  ...timestampsWithDeletedAt,
});

export const contactsTable = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar({ length: 100 }).notNull(),
  enName: varchar({ length: 100 }),
  phone: varchar({ length: 50 }).notNull(),
  lineId: varchar({ length: 100 }),
  weChatId: varchar({ length: 100 }),
  memo: varchar({ length: 500 }),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customersTable.id),
  ...timestamps,
});

export const projectContactsTable = pgTable('project_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projectsTable.id),
  contactId: uuid('contact_id')
    .notNull()
    .references(() => contactsTable.id),
  ...timestamps,
});

export const customersRelations = relations(customersTable, ({ many }) => ({
  projects: many(projectsTable),
  contacts: many(contactsTable),
}));

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  customer: one(customersTable, {
    fields: [projectsTable.customerId],
    references: [customersTable.id],
  }),
  projectContacts: many(projectContactsTable),
}));

export const contactsRelations = relations(contactsTable, ({ one, many }) => ({
  customer: one(customersTable, {
    fields: [contactsTable.customerId],
    references: [customersTable.id],
  }),
  projectContacts: many(projectContactsTable),
}));

export const projectContactsRelations = relations(projectContactsTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [projectContactsTable.projectId],
    references: [projectsTable.id],
  }),
  contact: one(contactsTable, {
    fields: [projectContactsTable.contactId],
    references: [contactsTable.id],
  }),
}));

export const rolesRelations = relations(rolesTable, ({ many }) => ({
  permissions: many(permissionsTable),
  roleDepartments: many(roleDepartmentsTable),
}));

export const permissionsRelations = relations(permissionsTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [permissionsTable.roleId],
    references: [rolesTable.id],
  }),
}));

export const departmentsRelations = relations(departmentsTable, ({ many }) => ({
  userDepartments: many(userDepartmentsTable),
  roleDepartments: many(roleDepartmentsTable),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  userDepartments: many(userDepartmentsTable),
  sessions: many(sessionsTable),
}));

export const userDepartmentsRelations = relations(userDepartmentsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userDepartmentsTable.userId],
    references: [usersTable.id],
  }),
  department: one(departmentsTable, {
    fields: [userDepartmentsTable.departmentId],
    references: [departmentsTable.id],
  }),
}));

export const roleDepartmentsRelations = relations(roleDepartmentsTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [roleDepartmentsTable.roleId],
    references: [rolesTable.id],
  }),
  department: one(departmentsTable, {
    fields: [roleDepartmentsTable.departmentId],
    references: [departmentsTable.id],
  }),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

// Type definitions for database models
export type RoleFromDb = InferSelectModel<typeof rolesTable>;
export type PermissionFromDb = InferSelectModel<typeof permissionsTable>;
export type UserFromDb = InferSelectModel<typeof usersTable>;
export type SessionFromDb = InferSelectModel<typeof sessionsTable>;
export type CustomerFromDb = InferSelectModel<typeof customersTable>;
export type ProjectFromDb = InferSelectModel<typeof projectsTable>;
export type ContactFromDb = InferSelectModel<typeof contactsTable>;
export type ProjectContactFromDb = InferSelectModel<typeof projectContactsTable>;
export type DepartmentFromDb = InferSelectModel<typeof departmentsTable>;
export type UserDepartmentFromDb = InferSelectModel<typeof userDepartmentsTable>;
export type RoleDepartmentFromDb = InferSelectModel<typeof roleDepartmentsTable>;
