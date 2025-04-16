import { t } from './core.js';
import { authRouter } from './auth/router.js';
import { personnelPermissionRouter } from './personnel-permission/router.js';

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
