import { relations } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import { pgEnum, pgTable, primaryKey, timestamp, uuid, varchar, boolean } from 'drizzle-orm/pg-core';

// Enums
export const projectStatusEnum = pgEnum('project_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const genderEnum = pgEnum('gender', ['male', 'female']);
export const appPermissionEnum = pgEnum('app_permission', [
  'man-production', // production management
  'ctr-gdstd', // GD-STD operations
  'monitor-weight', // real-time monitoring
]);

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

export const employeesTable = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  idNumber: varchar({ length: 20 }).notNull().unique(),
  chName: varchar({ length: 100 }).notNull(),
  enName: varchar({ length: 100 }),
  birthday: timestamp('birthday', { withTimezone: true, mode: 'date' }),
  gender: genderEnum().notNull(),
  marital_status: varchar({ length: 20 }),
  education: varchar({ length: 50 }),
  phone1: varchar({ length: 30 }).notNull(),
  email: varchar({ length: 100 }),
  residenceCounty: varchar({ length: 100 }),
  residenceDistrict: varchar({ length: 100 }),
  residenceAddress: varchar({ length: 255 }),
  mailingCounty: varchar({ length: 100 }),
  mailingDistrict: varchar({ length: 100 }),
  mailingAddress: varchar({ length: 255 }),
  ...timestamps,
});

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  account: varchar({ length: 255 }).notNull().unique(), // idNumber from employeesTable if user is linked to an employee
  name: varchar({ length: 255 }).notNull(), // chName from employeesTable
  employeeId: uuid('employee_id')
    .unique()
    .references(() => employeesTable.id),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  ...timestamps,
});

export const employeeDepartmentsTable = pgTable('employee_departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  employeeId: uuid('user_id')
    .notNull()
    .references(() => employeesTable.id),
  departmentId: uuid('department_id')
    .notNull()
    .references(() => departmentsTable.id),
  ...timestamps,
});

export const appUsersTable = pgTable('app_users', {
  id: uuid().primaryKey().defaultRandom(),
  account: varchar({ length: 255 }).notNull().unique(), // idNumber from employeesTable
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  employeeId: uuid('employee_id')
    .notNull()
    .unique()
    .references(() => employeesTable.id),
  ...timestamps,
});

export const appUserPermissions = pgTable('appuser_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  appUserId: uuid('app_user_id')
    .notNull()
    .references(() => appUsersTable.id),
  permission: appPermissionEnum('permission').notNull(),
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

export const userRolesTable = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id),
  roleId: uuid('role_id')
    .notNull()
    .references(() => rolesTable.id),
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
  status: projectStatusEnum().notNull().default('pending'),
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
  userRoles: many(userRolesTable),
}));

export const permissionsRelations = relations(permissionsTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [permissionsTable.roleId],
    references: [rolesTable.id],
  }),
}));

export const departmentsRelations = relations(departmentsTable, ({ many }) => ({
  userDepartments: many(employeeDepartmentsTable),
  roleDepartments: many(roleDepartmentsTable),
}));

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  sessions: many(sessionsTable),
  userRoles: many(userRolesTable),
  employee: one(employeesTable, {
    fields: [usersTable.employeeId],
    references: [employeesTable.id],
  }),
}));

export const appUsersRelations = relations(appUsersTable, ({ one }) => ({
  employee: one(employeesTable, {
    fields: [appUsersTable.employeeId],
    references: [employeesTable.id],
  }),
}));

export const employeeDepartmentsRelations = relations(employeeDepartmentsTable, ({ one }) => ({
  employee: one(employeesTable, {
    fields: [employeeDepartmentsTable.employeeId],
    references: [employeesTable.id],
  }),
  department: one(departmentsTable, {
    fields: [employeeDepartmentsTable.departmentId],
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

export const userRolesRelations = relations(userRolesTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [userRolesTable.roleId],
    references: [rolesTable.id],
  }),
  user: one(usersTable, {
    fields: [userRolesTable.userId],
    references: [usersTable.id],
  }),
}));

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

// --- App User Refresh Tokens ---
export const appUserRefreshTokensTable = pgTable('app_user_refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  appUserId: uuid('app_user_id')
    .notNull()
    .references(() => appUsersTable.id),
  expires_at: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
  ...timestamps,
});

export const appUserRefreshTokensRelations = relations(appUserRefreshTokensTable, ({ one }) => ({
  appUser: one(appUsersTable, {
    fields: [appUserRefreshTokensTable.appUserId],
    references: [appUsersTable.id],
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
export type EmployeeDepartmentFromDb = InferSelectModel<typeof employeeDepartmentsTable>;
export type RoleDepartmentFromDb = InferSelectModel<typeof roleDepartmentsTable>;
export type UserRoleFromDb = InferSelectModel<typeof userRolesTable>;
export type EmployeeFromDb = InferSelectModel<typeof employeesTable>;
export type AppUserRefreshTokenFromDb = InferSelectModel<typeof appUserRefreshTokensTable>;
