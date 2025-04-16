import { t } from '../core.js';
import {
  createUserForEmployeeProcedure,
  createUserWithRolesProcedure,
} from './procedures.js';

export const personnelPermissionRouter = t.router({
  createUserForEmployee: createUserForEmployeeProcedure,
  createUserWithRoles: createUserWithRolesProcedure,
});
