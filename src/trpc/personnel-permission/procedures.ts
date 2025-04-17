import { z } from 'zod';
import { protectedProcedure } from '../core.js';
import { TRPCError } from '@trpc/server';
import { db } from 'db/index';
import { usersTable, userRolesTable, employeesTable, rolesTable } from 'db/schema';
import { hashPassword } from 'db/password';
import { eq, inArray } from 'drizzle-orm';
import { generatePassword } from 'helpers/auth';

export const createUserForEmployeeProcedure = protectedProcedure
  .input(
    z.object({
      employeeId: z.string().uuid(),
    }),
  )
  .mutation(async ({ input }) => {
    // check if employee exist
    const employees = await db.select().from(employeesTable).where(eq(employeesTable.id, input.employeeId));

    if (employees.length === 0) throw new TRPCError({ code: 'CONFLICT', message: 'Employee does not exist' });

    // Check if employeeId has already been used
    const userWithTheSameEmpId = await db.select().from(usersTable).where(eq(usersTable.employeeId, input.employeeId));

    if (userWithTheSameEmpId.length) throw new TRPCError({ code: 'CONFLICT', message: 'Employee already has user' });

    const employee = employees[0];

    const generatedPassword = generatePassword();
    const passwordHash = await hashPassword(generatedPassword);

    const user = await db
      .insert(usersTable)
      .values({
        account: employee.idNumber,
        name: employee.chName,
        employeeId: input.employeeId,
        passwordHash,
      })
      .returning();
    return user[0];
  });

export const createUserWithRolesProcedure = protectedProcedure
  .input(
    z.object({
      account: z.string().min(1),
      name: z.string().min(1),
      roleIds: z.array(z.string().uuid()).min(1),
    }),
  )
  .mutation(async ({ input }) => {
    const password = generatePassword();
    const passwordHash = await hashPassword(password);

    // Validate all roleIds exist
    const roles = await db.select({ id: rolesTable.id }).from(rolesTable).where(inArray(rolesTable.id, input.roleIds));
    if (roles.length !== input.roleIds.length) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'One or more roleIds do not exist' });
    }

    const user = await db
      .insert(usersTable)
      .values({
        account: input.account,
        name: input.name,
        employeeId: null,
        passwordHash,
      })
      .returning();

    const userId = user[0].id;
    await Promise.all(input.roleIds.map((roleId) => db.insert(userRolesTable).values({ userId, roleId })));

    return user[0];
  });
