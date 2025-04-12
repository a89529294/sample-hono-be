import * as _trpc_server from '@trpc/server';
import * as _trpc_server_unstable_core_do_not_import from '@trpc/server/unstable-core-do-not-import';
import { Context } from 'hono';

interface UserResponse {
  id: string;
  account: string;
  name: string;
  roles: string[];
}
interface LoginResponse {
  success: boolean;
  message: string;
  sessionToken: string;
  user: UserResponse;
}
declare const appRouter: _trpc_server_unstable_core_do_not_import.BuiltRouter<
  {
    ctx: {
      c: Context;
    };
    meta: object;
    errorShape: _trpc_server_unstable_core_do_not_import.DefaultErrorShape;
    transformer: false;
  },
  _trpc_server_unstable_core_do_not_import.DecorateCreateRouterOptions<{
    login: _trpc_server.TRPCMutationProcedure<{
      input: {
        account: string;
        password: string;
      };
      output: LoginResponse;
    }>;
  }>
>;
type AppRouter = typeof appRouter;

export type { AppRouter };
