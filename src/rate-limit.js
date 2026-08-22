// Lightweight in-memory fixed-window rate limiter (per IP). No external dependency.
// Note: per-instance on serverless, which is fine as a basic abuse guard.
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 60;
const hits = new Map();

module.exports = function rateLimit(req, res, next) {
    const ip = (req.headers["x-forwarded-for"] || req.ip || "unknown").toString().split(",")[0].trim();
    const now = Date.now();

    // Lazily evict stale entries so the map cannot grow unbounded.
    if (hits.size > 5000) {
        for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k);
    }

    const entry = hits.get(ip);
    if (!entry || now - entry.start > WINDOW_MS) {
        hits.set(ip, { start: now, count: 1 });
        return next();
    }
    entry.count += 1;
    if (entry.count > MAX_PER_WINDOW) {
        return res.status(429).send("Too many requests. Please try again in a minute.");
    }
    return next();
};
