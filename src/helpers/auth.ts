import { and, eq, inArray } from 'drizzle-orm';
import type { MiddlewareHandler } from 'hono';
import { db } from '../db/index.js';
import {
  departmentsTable,
  permissionsTable,
  roleDepartmentsTable,
  rolesTable,
  userDepartmentsTable,
  type SessionFromDb,
  type UserFromDb,
} from '../db/schema.js';
import { getCurrentSession } from '../db/session-api.js';

type User = Omit<UserFromDb, 'passwordHash' | 'created_at' | 'updated_at'> & {
  isAdmin: boolean;
};
type Session = SessionFromDb;

declare module 'hono' {
  interface ContextVariableMap {
    user: User;
    session: Session;
  }
}

/**
 * Get user roles based on user ID
 * @param userId - The user ID
 * @returns An array of role objects with id and name
 */
export async function getUserRoles(userId: string) {
  // Get all departments the user belongs to
  const userDepts = await db
    .select({ departmentId: userDepartmentsTable.departmentId })
    .from(userDepartmentsTable)
    .where(eq(userDepartmentsTable.userId, userId));

  if (userDepts.length === 0) {
    return [];
  }

  // Get all department IDs the user belongs to
  const userDeptIds = userDepts.map((dept) => dept.departmentId);

  // Get all roles associated with these departments
  const departmentRoles = await db
    .select({ roleId: roleDepartmentsTable.roleId })
    .from(roleDepartmentsTable)
    .where(inArray(roleDepartmentsTable.departmentId, userDeptIds));

  if (departmentRoles.length === 0) {
    return [];
  }

  // Get all role IDs from the user's departments
  const roleIds = departmentRoles.map((role) => role.roleId);

  // Get role details
  const roles = await db
    .select({
      id: rolesTable.id,
      name: rolesTable.name,
      chinese_name: rolesTable.chinese_name,
    })
    .from(rolesTable)
    .where(inArray(rolesTable.id, roleIds));

  return roles;
}

export async function isAdmin(userId: string) {
  // check for existense of admin dept
  const adminDept = await db
    .select()
    .from(departmentsTable)
    .where(eq(departmentsTable.name, 'Administration'))
    .limit(1);

  if (adminDept.length === 0) return false;

  const adminDeptId = adminDept[0].id;

  // Check if user belongs to the admin department
  const userInAdminDept = await db
    .select()
    .from(userDepartmentsTable)
    .where(and(eq(userDepartmentsTable.userId, userId), eq(userDepartmentsTable.departmentId, adminDeptId)))
    .limit(1);

  return userInAdminDept.length === 1;
}

/**
 * Authentication middleware
 * Extracts the session token from the request header,
 * validates it, and attaches the user and the session to the context
 */
export const authenticate: MiddlewareHandler = async (c, next) => {
  // Skip authentication for public routes
  if (c.req.path === '/' || c.req.path === '/login' || c.req.path === '/trpc/login') {
    return next();
  }

  const headerRecord = c.req.header();
  const authHeader = headerRecord.authorization;
  const sessionToken = authHeader?.split(' ')[1];

  if (!sessionToken) {
    return c.json(
      {
        error: 'Authentication required',
        message: 'Missing Authorization: Bearer <session_token>',
      },
      401,
    );
  }

  const { session, user } = await getCurrentSession(sessionToken);

  if (!session || !user) {
    return c.json(
      {
        error: 'Authentication failed',
        message: 'Invalid or expired session',
      },
      401,
    );
  }

  const isUserAdmin = await isAdmin(user.id);

  c.set('user', {
    ...user,
    isAdmin: isUserAdmin,
  });
  c.set('session', session as Session);

  await next();
};

/**
 * Checks if a user has a specific permission
 * @param userId - The user ID
 * @param permissionName - The permission to check for
 * @returns A boolean indicating whether the user has the permission
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  if (await isAdmin(userId)) return true;

  const roles = await getUserRoles(userId);

  // Get all role IDs from the user's departments
  const roleIds = roles.map((role) => role.id);

  // Check if any of these roles have the requested permission
  const permissionCheck = await db
    .select()
    .from(permissionsTable)
    .where(and(inArray(permissionsTable.roleId, roleIds), eq(permissionsTable.name, permissionName)))
    .limit(1);

  return permissionCheck.length > 0;
}
