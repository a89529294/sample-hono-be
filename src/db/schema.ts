import type { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  primaryKey,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  created_at: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updated_at: timestamp({ withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const rolesTable = pgTable("roles", {
  id: uuid("id").primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  description: varchar({ length: 255 }),
  ...timestamps,
});

export const permissionsTable = pgTable("permissions", {
  id: uuid("id").primaryKey(),
  name: varchar({ length: 100 }).notNull().unique(),
  // Permission string like "order:create", "order:read", etc.
  ...timestamps,
});

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey(),
  username: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
  roleId: uuid("role_id")
    .notNull()
    .references(() => rolesTable.id),
  ...timestamps,
});

export const sessionsTable = pgTable("sessions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

// Role-Permission many-to-many relationship table
export const rolePermissionsTable = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => rolesTable.id),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permissionsTable.id),
  },
  (table) => {
    return [primaryKey({ columns: [table.roleId, table.permissionId] })];
  }
);

export type User = InferSelectModel<typeof usersTable>;
export type Session = InferSelectModel<typeof sessionsTable>;
