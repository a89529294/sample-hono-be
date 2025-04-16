import { t } from '../core.js';
import { loginProcedure, logoutProcedure, meProcedure } from './procedures.js';

export const authRouter = t.router({
  login: loginProcedure,
  logout: logoutProcedure,
  me: meProcedure,
});
