import { t } from 'trpc/core';
import { createUserForEmployeeProcedure, createUserWithRolesProcedure } from 'trpc/personnel-permission/procedures';

export const personnelPermissionRouter = t.router({
  createUserForEmployee: createUserForEmployeeProcedure,
  createUserWithRoles: createUserWithRolesProcedure,
});
