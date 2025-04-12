import * as _trpc_server from '@trpc/server';
import * as _trpc_server_unstable_core_do_not_import from '@trpc/server/unstable-core-do-not-import';
import { Context } from 'hono';

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
      output: {
        success: boolean;
        message: string;
        sessionToken: string;
        user: {
          account: string;
          id: string;
          name: string;
          roles: {
            id: string;
            name: string;
            chinese_name: string | null;
          }[];
        };
      };
    }>;
  }>
>;
type AppRouter = typeof appRouter;
declare namespace TrpcTypes {
  type Router = AppRouter;
  type User = AppRouter['login']['_def']['$types']['output']['user'];
}

export { TrpcTypes };
