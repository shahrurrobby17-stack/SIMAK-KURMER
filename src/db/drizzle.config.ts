import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const postgresUrl = process.env.POSTGRES_URL;

const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER;
const password = process.env.SQL_ADMIN_PASSWORD;

if (!postgresUrl && (!sqlHost || !sqlDbName || !user || !password)) {
  console.warn("Database credentials must be set in environment variables for migrations.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: postgresUrl ? {
    url: postgresUrl,
  } : {
    host: sqlHost as string,
    user: user as string,
    password: password as string,
    database: sqlDbName as string,
    ssl: false,
  },
  verbose: true,
});
