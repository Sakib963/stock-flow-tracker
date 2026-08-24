// Read-only Postgres pool for the tracker.
// Use a DB role that can ONLY SELECT from `orders`, `order_items` and `settings`
// (see README). Supports either a single DATABASE_URL or discrete DB_* vars.
//
// Sizing note: this database is small (max_connections in the tens) and is shared
// with the admin API, and both deploy to serverless where each warm instance keeps
// its own pool. So the tracker deliberately takes the smallest footprint it can --
// a request runs two tiny indexed SELECTs, one after the other, so `max: 2` is
// already headroom -- and fails fast on connect so `withRetry` (src/retry.js) can
// take another swing instead of the customer getting an error page.
const { Pool } = require("pg");

const useSsl = process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false };

const shared = {
    max: 2,
    idleTimeoutMillis: 10000, // hand slots back quickly; other instances need them
    connectionTimeoutMillis: 2500, // fail fast rather than hanging the request
    allowExitOnIdle: true, // let an idle serverless instance wind down
    keepAlive: true, // stop NAT/idle reaping killing pooled sockets
    keepAliveInitialDelayMillis: 10000,
    statement_timeout: 8000,
    query_timeout: 8000,
    ssl: useSsl,
};

const pool = process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL, ...shared })
    : new Pool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
          ...shared,
      });

// An error on an IDLE client must never take the process down; the next query
// just gets a fresh connection.
pool.on("error", (err) => console.error("Tracker DB pool error:", err.message));

module.exports = pool;
