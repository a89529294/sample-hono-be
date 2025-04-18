import * as _trpc_server from '@trpc/server';
import { InferSelectModel } from 'drizzle-orm';
import * as drizzle_orm_pg_core from 'drizzle-orm/pg-core';
import * as _trpc_server_unstable_core_do_not_import from '@trpc/server/unstable-core-do-not-import';
import * as hono from 'hono';

declare const rolesTable: drizzle_orm_pg_core.PgTableWithColumns<{
  name: 'roles';
  schema: undefined;
  columns: {
    created_at: drizzle_orm_pg_core.PgColumn<
      {
        name: 'created_at';
        tableName: 'roles';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    updated_at: drizzle_orm_pg_core.PgColumn<
      {
        name: 'updated_at';
        tableName: 'roles';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    id: drizzle_orm_pg_core.PgColumn<
      {
        name: 'id';
        tableName: 'roles';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {}
    >;
    name: drizzle_orm_pg_core.PgColumn<
      {
        name: 'name';
        tableName: 'roles';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 100;
      }
    >;
    chinese_name: drizzle_orm_pg_core.PgColumn<
      {
        name: 'chinese_name';
        tableName: 'roles';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        identity: undefined;
        generated: undefined;
      },
      {},
      {
        length: 255;
      }
    >;
  };
  dialect: 'pg';
}>;
type RoleFromDb = InferSelectModel<typeof rolesTable>;

type Role = Pick<RoleFromDb, 'id' | 'name'>;

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
              roles: Role[];
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
            roles: Role[];
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
        getAppUserByPermission: _trpc_server.TRPCQueryProcedure<{
          input: {
            permission: 'man-production' | 'ctr-gdstd' | 'monitor-weight';
          };
          output: {
            created_at: Date;
            updated_at: Date;
            id: string;
            account: string;
            passwordHash: string;
            employeeId: string;
          }[];
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
