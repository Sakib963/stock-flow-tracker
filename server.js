// StockFlow public Order Tracker.
// A standalone, read-only service that resolves a tracking token to a minimal
// order status. It is intentionally SEPARATE from the admin app and API: it never
// calls the admin backend and only ever runs SELECTs against a read-only DB role.
//
// Two public surfaces (one shared read path):
//   GET /:token           -> hosted HTML tracking page, drawn by the business's
//                            chosen template (see src/templates)
//   GET /api/track/:token  -> public JSON (CORS open) so a shop can build its own page
require("dotenv").config();
const express = require("express");
const { renderPage, getStatusJson } = require("./src/track-controller");
const rateLimit = require("./src/rate-limit");

const app = express();
app.disable("x-powered-by");

const TOKEN = ":token([A-Za-z0-9]{12,64})";

// Public JSON API is read-only order status by token, so any origin may call it.
const jsonCors = (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).end();
    return next();
};

// Local-only template gallery. NEVER served in production (Vercel sets NODE_ENV).
if (process.env.NODE_ENV !== "production") {
    const preview = require("./src/preview");
    app.get("/preview", preview.index);
    app.get("/preview/:key", preview.one);
}

// Health / landing.
app.get("/", (req, res) => res.status(200).send("StockFlow order tracking. Scan the QR on your order to view its status."));
app.get("/favicon.ico", (req, res) => res.status(204).end());

// JSON API (for shops using their own front-end/URL).
app.options(`/api/track/${TOKEN}`, jsonCors);
app.get(`/api/track/${TOKEN}`, jsonCors, rateLimit, getStatusJson);

// Hosted HTML page. The token constraint keeps random paths off the DB.
app.get(`/${TOKEN}`, rateLimit, renderPage);

// Everything else: generic not-found (no hint about the app).
app.use((req, res) => res.status(404).send("Not found"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`StockFlow tracker listening on port ${PORT}`));

// For serverless (Vercel) deployment.
module.exports = app;
