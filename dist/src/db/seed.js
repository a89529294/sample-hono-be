import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { usersTable } from "./schema.js";
import { db } from "./index.js";
async function main() {
    const user = {
        name: "John",
        age: 30,
        email: "john@example.com",
    };
    await db.insert(usersTable).values(user);
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
