// Read-only Postgres pool for the tracker.
// Use a DB role that can ONLY SELECT from `orders`, `order_items` and `settings`
// (see README). Supports either a single DATABASE_URL or discrete DB_* vars.
const { Pool } = require("pg");

const useSsl = process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false };

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, max: 3, ssl: useSsl, statement_timeout: 8000, query_timeout: 8000 })
    : new Pool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
          max: 3,
          ssl: useSsl,
          statement_timeout: 8000,
          query_timeout: 8000,
      });

pool.on("error", (err) => console.error("Tracker DB pool error:", err.message));

module.exports = pool;
