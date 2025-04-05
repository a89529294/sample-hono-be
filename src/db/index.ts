import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const envPath = `.env.${process.env.NODE_ENV}`;
dotenv.config({ path: envPath });

// You can specify any property from the node-postgres connection options
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
export const db = drizzle({ client: pool });
