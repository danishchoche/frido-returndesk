import { Pool } from "pg";

const sslEnabled = process.env.DB_SSL === "true";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(sslEnabled
    ? {
        ssl: {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
        },
      }
    : {}),
});

export default pool;
