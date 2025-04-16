import { and, eq, inArray } from 'drizzle-orm';
import type { MiddlewareHandler } from 'hono';
import { db } from '../db/index.js';
import {
  departmentsTable,
  employeesTable,
  employeeDepartmentsTable,
  permissionsTable,
  roleDepartmentsTable,
  rolesTable,
  userRolesTable,
  usersTable,
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
  // Get the user first to check for employeeId
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  if (user.length === 0) throw new Error(`User with id ${userId} does not exist`);

  const userObj = user[0];

  // Case 1: No employeeId, get roles from userRolesTable using join
  if (!userObj.employeeId) {
    const userRoles = await db
      .select({ id: rolesTable.id, name: rolesTable.name })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(eq(userRolesTable.userId, userId));
    return userRoles;
  }

  // Case 2: Has employeeId, get employee, then departments, then roles
  const employeeId = userObj.employeeId;
  const employee = await db.select().from(employeesTable).where(eq(employeesTable.id, employeeId)).limit(1);

  if (employee.length === 0) throw new Error(`Employee with id ${employeeId} does not exist`);

  // Get departments for the employee
  const employeeDepartments = await db
    .select({ departmentId: employeeDepartmentsTable.departmentId })
    .from(employeeDepartmentsTable)
    .where(eq(employeeDepartmentsTable.employeeId, employeeId));

  if (employeeDepartments.length === 0) return [];

  const deptIds = employeeDepartments.map((d) => d.departmentId);

  // Get roles for these departments via roleDepartmentsTable
  const roles = await db
    .select({ id: rolesTable.id, name: rolesTable.name })
    .from(roleDepartmentsTable)
    .innerJoin(rolesTable, eq(roleDepartmentsTable.roleId, rolesTable.id))
    .where(inArray(roleDepartmentsTable.departmentId, deptIds));

  return roles;
}

export async function isAdmin(userId: string) {
  // Check for existence of 'AdminManagement' role
  const adminRole = await db.select().from(rolesTable).where(eq(rolesTable.name, 'AdminManagement')).limit(1);

  if (adminRole.length === 0) return false;

  const adminRoleId = adminRole[0].id;

  // Check if user has the 'AdminManagement' role
  const userHasAdminRole = await db
    .select()
    .from(userRolesTable)
    .where(and(eq(userRolesTable.userId, userId), eq(userRolesTable.roleId, adminRoleId)))
    .limit(1);

  return userHasAdminRole.length === 1;
}

/**
 * Authentication middleware
 * Extracts the session token from the request header,
 * validates it, and attaches the user and the session to the context
 */
// export const authenticate: MiddlewareHandler = async (c, next) => {
//   // Skip authentication for public routes
//   if (c.req.path === '/' || c.req.path === '/trpc/login') {
//     return next();
//   }

//   const headerRecord = c.req.header();
//   const authHeader = headerRecord.authorization;
//   const sessionToken = authHeader?.split(' ')[1];

//   if (!sessionToken) {
//     return c.json(
//       {
//         error: 'Authentication required',
//         message: 'Missing Authorization: Bearer <session_token>',
//       },
//       401,
//     );
//   }

//   const { session, user } = await getCurrentSession(sessionToken);

//   if (!session || !user) {
//     return c.json(
//       {
//         error: 'Authentication failed',
//         message: 'Invalid or expired session',
//       },
//       401,
//     );
//   }

//   const isUserAdmin = await isAdmin(user.id);

//   c.set('user', {
//     ...user,
//     isAdmin: isUserAdmin,
//   });
//   c.set('session', session as Session);

//   await next();
// };

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

export function generatePassword(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
