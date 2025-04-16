import * as _trpc_server from '@trpc/server';
import * as _trpc_server_unstable_core_do_not_import from '@trpc/server/unstable-core-do-not-import';
import * as hono from 'hono';

declare const appRouter: _trpc_server_unstable_core_do_not_import.BuiltRouter<
  {
    ctx: {
      c: hono.Context;
    };
    meta: object;
    errorShape: _trpc_server_unstable_core_do_not_import.DefaultErrorShape;
    transformer: false;
  },
  _trpc_server_unstable_core_do_not_import.DecorateCreateRouterOptions<{
    auth: _trpc_server_unstable_core_do_not_import.BuiltRouter<
      {
        ctx: {
          c: hono.Context;
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
              isAdmin: boolean;
              roles: {
                id: string;
                name: string;
              }[];
            };
          };
        }>;
        logout: _trpc_server.TRPCMutationProcedure<{
          input: void;
          output: {
            success: string;
          };
        }>;
        me: _trpc_server.TRPCMutationProcedure<{
          input: void;
          output: {
            account: string;
            id: string;
            name: string;
            isAdmin: boolean;
            roles: {
              id: string;
              name: string;
            }[];
          };
        }>;
      }>
    >;
    personnelPermission: _trpc_server_unstable_core_do_not_import.BuiltRouter<
      {
        ctx: {
          c: hono.Context;
        };
        meta: object;
        errorShape: _trpc_server_unstable_core_do_not_import.DefaultErrorShape;
        transformer: false;
      },
      _trpc_server_unstable_core_do_not_import.DecorateCreateRouterOptions<{
        createUserForEmployee: _trpc_server.TRPCMutationProcedure<{
          input: {
            employeeId: string;
          };
          output: {
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            account: string;
            employeeId: string | null;
            passwordHash: string;
          };
        }>;
        createUserWithRoles: _trpc_server.TRPCMutationProcedure<{
          input: {
            name: string;
            account: string;
            roleIds: string[];
          };
          output: {
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            account: string;
            employeeId: string | null;
            passwordHash: string;
          };
        }>;
      }>
    >;
  }>
>;
type AppRouter = typeof appRouter;
type TrpcTypes = {
  Router: AppRouter;
  User: AppRouter['auth']['login']['_def']['$types']['output']['user'];
};

export type { TrpcTypes };
