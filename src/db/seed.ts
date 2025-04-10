// import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import {
  usersTable,
  rolesTable,
  permissionsTable,
  sessionsTable,
  customersTable,
  projectsTable,
  contactsTable,
  projectContactsTable,
  departmentsTable,
  userDepartmentsTable,
  roleDepartmentsTable,
} from "./schema.js";
import { db } from "./index.js";
import { randomUUID } from "crypto";

// const envPath = `.env.${process.env.NODE_ENV}`;
// dotenv.config({ path: envPath });

async function main() {
  console.log("Starting database seed...");

  // Clean existing data in the correct order (respecting foreign key constraints)
  console.log("Cleaning existing data...");

  // First delete tables that reference other tables
  await db.delete(sessionsTable);
  await db.delete(projectContactsTable);
  await db.delete(projectsTable);
  await db.delete(contactsTable);
  await db.delete(customersTable);
  await db.delete(userDepartmentsTable);
  await db.delete(roleDepartmentsTable);
  await db.delete(usersTable);
  await db.delete(permissionsTable);
  await db.delete(departmentsTable);
  await db.delete(rolesTable);

  console.log("All tables cleaned!");

  // Create roles with predefined IDs
  const productionManagementRoleId = randomUUID();
  const personnelPermissionManagementRoleId = randomUUID();
  const basicInfoManagementRoleId = randomUUID();
  const storageManagementRoleId = randomUUID();

  const roles = [
    {
      id: productionManagementRoleId,
      name: "ProductionManagement",
      chinese_name: "生產管理",
    },
    {
      id: personnelPermissionManagementRoleId,
      name: "PersonnelPermissionManagement",
      chinese_name: "人事權限",
    },
    {
      id: basicInfoManagementRoleId,
      name: "BasicInfoManagement",
      chinese_name: "基本資料",
    },
    {
      id: storageManagementRoleId,
      name: "StorageManagement",
      chinese_name: "倉庫管理",
    },
  ];

  await db.insert(rolesTable).values(roles);
  console.log("Roles created!");

  // Create departments
  const hrDeptId = randomUUID();
  const financeDeptId = randomUUID();
  const marketingDeptId = randomUUID();
  const salesDeptId = randomUUID();
  const engineeringDeptId = randomUUID();
  const productDeptId = randomUUID();
  const operationsDeptId = randomUUID();
  const customerServiceDeptId = randomUUID();
  const researchDeptId = randomUUID();
  const legalDeptId = randomUUID();
  const adminDeptId = randomUUID();

  const departments = [
    {
      id: adminDeptId,
      name: "Administration",
    },
    {
      id: hrDeptId,
      name: "Human Resources",
    },
    {
      id: financeDeptId,
      name: "Finance",
    },
    {
      id: marketingDeptId,
      name: "Marketing",
    },
    {
      id: salesDeptId,
      name: "Sales",
    },
    {
      id: engineeringDeptId,
      name: "Engineering",
    },
    {
      id: productDeptId,
      name: "Product",
    },
    {
      id: operationsDeptId,
      name: "Operations",
    },
    {
      id: customerServiceDeptId,
      name: "Customer Service",
    },
    {
      id: researchDeptId,
      name: "Research & Development",
    },
    {
      id: legalDeptId,
      name: "Legal",
    },
  ];

  await db.insert(departmentsTable).values(departments);
  console.log("Departments created!");

  // Create role-department associations
  const roleDepartments = [
    // Production Management role in Engineering, Operations, and R&D departments
    {
      id: randomUUID(),
      roleId: productionManagementRoleId,
      departmentId: engineeringDeptId,
    },
    {
      id: randomUUID(),
      roleId: productionManagementRoleId,
      departmentId: operationsDeptId,
    },
    {
      id: randomUUID(),
      roleId: productionManagementRoleId,
      departmentId: researchDeptId,
    },

    // Personnel Management role in HR department
    {
      id: randomUUID(),
      roleId: personnelPermissionManagementRoleId,
      departmentId: hrDeptId,
    },

    // Basic Info Management role in multiple departments
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: hrDeptId,
    },
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: operationsDeptId,
    },
    {
      id: randomUUID(),
      roleId: basicInfoManagementRoleId,
      departmentId: productDeptId,
    },

    // Storage Management role in Operations department
    {
      id: randomUUID(),
      roleId: storageManagementRoleId,
      departmentId: operationsDeptId,
    },
  ];

  await db.insert(roleDepartmentsTable).values(roleDepartments);
  console.log("Role-Department associations created!");

  // Create permissions with roleId (now a one-to-many relationship)
  const permissions = [
    // Production Management permissions
    {
      id: randomUUID(),
      name: "production:create",
      roleId: productionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "production:read",
      roleId: productionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "production:update",
      roleId: productionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "production:delete",
      roleId: productionManagementRoleId,
    },

    // Personnel Permission Management permissions
    {
      id: randomUUID(),
      name: "personnelPermission:create",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "personnelPermission:read",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "personnelPermission:update",
      roleId: personnelPermissionManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "personnelPermission:delete",
      roleId: personnelPermissionManagementRoleId,
    },

    // Basic Info Management permissions
    {
      id: randomUUID(),
      name: "employee:create",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "employee:read",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "employee:update",
      roleId: basicInfoManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "employee:delete",
      roleId: basicInfoManagementRoleId,
    },

    // Storage Management permissions
    {
      id: randomUUID(),
      name: "storage:create",
      roleId: storageManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "storage:read",
      roleId: storageManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "storage:update",
      roleId: storageManagementRoleId,
    },
    {
      id: randomUUID(),
      name: "storage:delete",
      roleId: storageManagementRoleId,
    },
  ];

  await db.insert(permissionsTable).values(permissions);
  console.log("Permissions created!");

  // Create users
  const hrUserId = randomUUID();
  const financeUserId = randomUUID();
  const marketingUserId = randomUUID();
  const salesUserId = randomUUID();
  const engineeringUserId = randomUUID();
  const adminUserId = randomUUID();

  const users = [
    {
      id: adminUserId,
      account: "admin",
      name: "Administrator",
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$8gKO7uPcSTzd77IIArp0pw$CgAihf3UZY0tbFMNHq/Zf1HkmtBdG4j1Vpm9BuSqaEI",
    },
    {
      id: hrUserId,
      account: "hr",
      name: "HR Manager",
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$8gKO7uPcSTzd77IIArp0pw$CgAihf3UZY0tbFMNHq/Zf1HkmtBdG4j1Vpm9BuSqaEI",
    },
    {
      id: financeUserId,
      account: "finance",
      name: "Finance Manager",
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$8gKO7uPcSTzd77IIArp0pw$CgAihf3UZY0tbFMNHq/Zf1HkmtBdG4j1Vpm9BuSqaEI",
    },
    {
      id: marketingUserId,
      account: "marketing",
      name: "Marketing Manager",
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$8gKO7uPcSTzd77IIArp0pw$CgAihf3UZY0tbFMNHq/Zf1HkmtBdG4j1Vpm9BuSqaEI",
    },
    {
      id: salesUserId,
      account: "sales",
      name: "Sales Manager",
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$8gKO7uPcSTzd77IIArp0pw$CgAihf3UZY0tbFMNHq/Zf1HkmtBdG4j1Vpm9BuSqaEI",
    },
    {
      id: engineeringUserId,
      account: "engineering",
      name: "Engineering Manager",
      passwordHash:
        "$argon2id$v=19$m=19456,t=2,p=1$8gKO7uPcSTzd77IIArp0pw$CgAihf3UZY0tbFMNHq/Zf1HkmtBdG4j1Vpm9BuSqaEI",
    },
  ];

  await db.insert(usersTable).values(users);
  console.log("Users created!");

  // Create user-department associations
  const userDepartments = [
    {
      id: randomUUID(),
      userId: adminUserId,
      departmentId: adminDeptId,
    },
    {
      id: randomUUID(),
      userId: hrUserId,
      departmentId: hrDeptId,
    },
    {
      id: randomUUID(),
      userId: financeUserId,
      departmentId: financeDeptId,
    },
    {
      id: randomUUID(),
      userId: marketingUserId,
      departmentId: marketingDeptId,
    },
    {
      id: randomUUID(),
      userId: salesUserId,
      departmentId: salesDeptId,
    },
    {
      id: randomUUID(),
      userId: engineeringUserId,
      departmentId: engineeringDeptId,
    },
  ];

  await db.insert(userDepartmentsTable).values(userDepartments);
  console.log("User-Department associations created!");

  console.log("Database seed completed successfully!");
}

main();
