// Transient-failure retry for the tracker's reads.
//
// This service shares one small Postgres with the admin API (max_connections is
// in the tens) and BOTH run on serverless, where every warm instance holds its
// pool open. So a scan can land at the exact moment there is no free connection
// slot, or on a pooled socket the network just reaped. Those failures clear in
// milliseconds -- retrying them is the difference between the customer seeing
// their order and seeing an error page. The admin API already does this in
// `utils/database.js`; this is the same idea, kept short because a customer is
// waiting on the response.

// Postgres SQLSTATEs and Node socket errnos that mean "try again", not "broken".
const TRANSIENT_CODES = new Set([
    "53300", // too_many_connections
    "53400", // configuration_limit_exceeded
    "57P01", // admin_shutdown
    "57P03", // cannot_connect_now
    "08000", // connection_exception
    "08001", // sqlclient_unable_to_establish_sqlconnection
    "08003", // connection_does_not_exist
    "08004", // sqlserver_rejected_establishment_of_sqlconnection
    "08006", // connection_failure
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "EPIPE",
]);

// node-postgres surfaces some of these as plain messages with no code.
const TRANSIENT_TEXT = /too many clients|Connection terminated|timeout exceeded when trying to connect|server closed the connection|Client has encountered a connection error/i;

const isTransient = (e) => !!e && (TRANSIENT_CODES.has(e.code) || TRANSIENT_TEXT.test(e.message || ""));

// Backoff between attempts. Worst case here is bounded by
// connectionTimeoutMillis (see db.js) x 3 attempts + these delays, which must
// stay under the serverless request limit.
const DELAYS = [150, 400];

const withRetry = async (run) => {
    for (let attempt = 0; ; attempt++) {
        try {
            return await run();
        } catch (e) {
            if (attempt >= DELAYS.length || !isTransient(e)) throw e;
            console.warn(`tracker: transient DB error (attempt ${attempt + 1}/${DELAYS.length + 1}), retrying in ${DELAYS[attempt]}ms:`, e.message);
            await new Promise((r) => setTimeout(r, DELAYS[attempt]));
        }
    }
};

module.exports = { withRetry, isTransient };
