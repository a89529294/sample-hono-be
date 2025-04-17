import { t } from 'trpc/core';
import { authRouter } from 'trpc/auth/router';
import { personnelPermissionRouter } from 'trpc/personnel-permission/router';

export const appRouter = t.router({
  auth: authRouter,
  personnelPermission: personnelPermissionRouter,
  // Add other routers here
});

type AppRouter = typeof appRouter;

export type TrpcTypes = {
  Router: AppRouter;
  User: AppRouter['auth']['login']['_def']['$types']['output']['user'];
};
