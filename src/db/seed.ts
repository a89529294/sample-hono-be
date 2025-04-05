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

  // Create roles
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

  // Create permissions
  const permissionIds = {
    createOrder: randomUUID(),
    readOrder: randomUUID(),
    updateOrder: randomUUID(),
    deleteOrder: randomUUID(),
    readUser: randomUUID(),
    updateUser: randomUUID(),
  };

  const permissions: (typeof permissionsTable.$inferInsert)[] = [
    {
      id: permissionIds.createOrder,

      name: "order:create",
    },
    {
      id: permissionIds.readOrder,

      name: "order:read",
    },
    {
      id: permissionIds.updateOrder,

      name: "order:update",
    },
    {
      id: permissionIds.deleteOrder,

      name: "order:delete",
    },
    {
      id: permissionIds.readUser,

      name: "user:read",
    },
    {
      id: permissionIds.updateUser,

      name: "user:update",
    },
  ];

  await db.insert(permissionsTable).values(permissions);
  console.log("Permissions created!");

  // Assign permissions to roles
  const rolePermissions: (typeof rolePermissionsTable.$inferInsert)[] = [
    // Admin has all permissions
    { roleId: adminRoleId, permissionId: permissionIds.createOrder },
    { roleId: adminRoleId, permissionId: permissionIds.readOrder },
    { roleId: adminRoleId, permissionId: permissionIds.updateOrder },
    { roleId: adminRoleId, permissionId: permissionIds.deleteOrder },
    { roleId: adminRoleId, permissionId: permissionIds.readUser },
    { roleId: adminRoleId, permissionId: permissionIds.updateUser },

    // Regular user has limited permissions
    { roleId: userRoleId, permissionId: permissionIds.readOrder },
    { roleId: userRoleId, permissionId: permissionIds.readUser },
  ];

  await db.insert(rolePermissionsTable).values(rolePermissions);
  console.log("Role permissions assigned!");

  // Create users
  const users: (typeof usersTable.$inferInsert)[] = [
    {
      id: randomUUID(),
      username: "john",
      passwordHash: "....",
      roleId: adminRoleId,
    },
    {
      id: randomUUID(),
      username: "amy",
      passwordHash: ".....",
      roleId: userRoleId,
    },
  ];

  await db.insert(usersTable).values(users);
  console.log("Users created!");
}

main();
