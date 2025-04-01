import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { usersTable } from "./schema.js";
import { db } from "./index.js";

const envPath = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envPath });

async function main() {
  await db.delete(usersTable);

  const user1: typeof usersTable.$inferInsert = {
    name: "John",
    age: 30,
    email: "john@example.com",
  };
  const user2: typeof usersTable.$inferInsert = {
    name: "Amy",
    age: 30,
    email: "amy@example.com",
  };

  await db.insert(usersTable).values([user1, user2]);
  console.log("New user created!");

  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */

  // await db
  //   .update(usersTable)
  //   .set({
  //     age: 31,
  //   })
  //   .where(eq(usersTable.email, user.email));
  // console.log("User info updated!");

  // await db.delete(usersTable).where(eq(usersTable.email, user.email));
  // console.log("User deleted!");
}

main();
