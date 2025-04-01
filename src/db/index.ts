import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

const envPath = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envPath });

// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
  },
});
