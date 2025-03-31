import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
console.log(process.env.NODE_ENV);
// You can specify any property from the node-postgres connection options
export const db = drizzle({
    connection: {
        connectionString: process.env.DATABASE_URL,
    },
});
