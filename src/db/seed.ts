// import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import {
  usersTable,
  rolesTable,
  permissionsTable,
  rolePermissionsTable,
} from "./schema.js";
import { db } from "./index.js";
import { randomUUID } from "crypto";

// const envPath = `.env.${process.env.NODE_ENV}`;
// dotenv.config({ path: envPath });

async function main() {
  // Clean existing data
  await db.delete(rolePermissionsTable);
  await db.delete(usersTable);
  await db.delete(permissionsTable);
  await db.delete(rolesTable);

  // Create roles with predefined IDs
  const adminRoleId = randomUUID();
  const userRoleId = randomUUID();

  const roles: (typeof rolesTable.$inferInsert)[] = [
    {
      id: adminRoleId,
      name: "Admin",
      description: "Administrator with full access",
    },
    {
      id: userRoleId,
      name: "User",
      description: "Regular user with limited access",
    },
  ];

  await db.insert(rolesTable).values(roles);
  console.log("Roles created!");

  // Create permissions with predefined IDs
  const allAllPermId = randomUUID();
  const orderCreatePermId = randomUUID();
  const orderReadPermId = randomUUID();
  const orderUpdatePermId = randomUUID();
  const orderDeletePermId = randomUUID();
  const userCreatePermId = randomUUID();
  const userReadPermId = randomUUID();
  const userUpdatePermId = randomUUID();
  const userDeletePermId = randomUUID();

  const permissions: (typeof permissionsTable.$inferInsert)[] = [
    {
      id: allAllPermId,
      name: "all:all",
    },
    {
      id: orderCreatePermId,
      name: "order:create",
    },
    {
      id: orderReadPermId,
      name: "order:read",
    },
    {
      id: orderUpdatePermId,
      name: "order:update",
    },
    {
      id: orderDeletePermId,
      name: "order:delete",
    },
    {
      id: userCreatePermId,
      name: "user:create",
    },
    {
      id: userReadPermId,
      name: "user:read",
    },
    {
      id: userUpdatePermId,
      name: "user:update",
    },
    {
      id: userDeletePermId,
      name: "user:delete",
    },
  ];

  await db.insert(permissionsTable).values(permissions);
  console.log("Permissions created!");

  // Assign permissions to roles
  const rolePermissions: (typeof rolePermissionsTable.$inferInsert)[] = [
    // Admin has the all:all permission
    { roleId: adminRoleId, permissionId: allAllPermId },

    // Regular user has limited permissions
    { roleId: userRoleId, permissionId: orderReadPermId },
    { roleId: userRoleId, permissionId: userReadPermId },
  ];

  await db.insert(rolePermissionsTable).values(rolePermissions);
  console.log("Role permissions assigned!");

  // Create users
  const users: (typeof usersTable.$inferInsert)[] = [
    {
      username: "admin",
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$Gr/CF7ucnfCYIxW6BuJ+CQ$uQP2AY4I6DeuOjXfQRNn0LoR4mQBSQC/Xya+4diGKB8",
      roleId: adminRoleId,
    },
    {
      username: "user1",
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$T9cJGtEoYBtEEouLcqJduQ$PzZpQ54pwgLcknUz6Mw8+RjJQ2hOAof4eJUGgi1e4j8",
      roleId: userRoleId,
    },
  ];

  await db.insert(usersTable).values(users);
  console.log("Users created!");
}

main();
