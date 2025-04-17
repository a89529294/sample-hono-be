import { t } from 'trpc/core';
import { loginProcedure, logoutProcedure, meProcedure } from 'trpc/auth/procedures';

export const authRouter = t.router({
  login: loginProcedure,
  logout: logoutProcedure,
  me: meProcedure,
});
