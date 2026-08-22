// StockFlow public Order Tracker (single business).
// Resolves a tracking token to a minimal order status and hands it to a TEMPLATE
// for rendering, plus a matching JSON API. Reads ONLY: orders (by token),
// order_items (count), settings (name, logo, tracker_template). NO customer PII,
// NO prices. Everything the templates print is HTML-escaped.
//
// DESIGN LIVES IN TEMPLATES, NOT IN THE DB. `src/templates/*` holds a handful of
// complete, hand-built looks; the business picks one by key in Settings and that
// key is the ONLY design input read at runtime. The dynamic data below is the
// same for every template -- only the styling and the static copy differ.
const pool = require("./db");
const { getTemplate, DEFAULT_TEMPLATE } = require("./templates");

// The DB-backed identity: values that can change without a redeploy. Cached so we
// do not read settings on every request.
let _business = null;
let _businessAt = 0;
const BUSINESS_TTL = 10 * 60 * 1000;
async function getBusiness() {
    if (_business && Date.now() - _businessAt < BUSINESS_TTL) return _business;
    try {
        const r = await pool.query("SELECT name, logo_url, tracker_template FROM settings LIMIT 1");
        const row = r.rows[0] || {};
        _business = { name: row.name || "Order Tracking", logo: row.logo_url || "", template: row.tracker_template || DEFAULT_TEMPLATE };
        _businessAt = Date.now();
    } catch (e) {
        console.error("tracker: failed to read settings:", e.message);
        _business = _business || { name: "Order Tracking", logo: "", template: DEFAULT_TEMPLATE };
    }
    return _business;
}

// Shared data path: token -> normalized minimal status (or null).
async function fetchOrderStatus(token) {
    const result = await pool.query({
        text: `SELECT o.oid, o.invoice_no, o.status, o.created_on, o.dispatched_on, o.delivered_on, o.cancelled_on,
                      (SELECT COUNT(*)::int FROM order_items oi WHERE oi.order_oid = o.oid) AS item_count
                 FROM orders o WHERE o.tracking_token = $1 LIMIT 1`,
        values: [token],
    });
    if (!result.rows.length) return null;
    const o = result.rows[0];

    const cancelled = o.status === "Cancelled";
    let display = o.status;
    if (cancelled) display = "Cancelled";
    else if (o.status === "Returned" || o.status === "PartiallyReturned") display = "Returned";
    else if (o.delivered_on) display = "Delivered";
    else if (o.dispatched_on) display = "Out for delivery";
    else if (o.status === "Confirmed") display = "Confirmed";

    const steps = cancelled
        ? [
              { label: "Confirmed", at: o.created_on, done: true, icon: "confirmed" },
              { label: "Cancelled", at: o.cancelled_on, done: true, bad: true, icon: "cancelled" },
          ]
        : [
              { label: "Confirmed", at: o.created_on, done: true, icon: "confirmed" },
              { label: "Out for delivery", at: o.dispatched_on, done: !!o.dispatched_on, icon: "shipped" },
              { label: "Delivered", at: o.delivered_on, done: !!o.delivered_on, icon: "delivered" },
          ];

    return {
        order: o.invoice_no,
        status: display,
        message: statusMessage(display, cancelled),
        cancelled,
        placed_at: o.created_on,
        dispatched_at: o.dispatched_on,
        delivered_at: o.delivered_on,
        item_count: o.item_count,
        steps,
    };
}

function statusMessage(display, cancelled) {
    if (cancelled) return "This order has been cancelled.";
    if (display === "Delivered") return "Your order has been delivered. Thank you!";
    if (display === "Out for delivery") return "Good news, your order is on the way.";
    if (display === "Returned") return "This order has been returned.";
    return "Your order has been confirmed and is being prepared.";
}

// 1) Hosted page, rendered by the business's chosen template.
async function renderPage(req, res) {
    try {
        const biz = await getBusiness();
        const tpl = getTemplate(biz.template);

        const token = String(req.params.token || "").trim();
        if (!token) return res.status(404).send(tpl.renderNotFound({ biz }));
        const s = await fetchOrderStatus(token);
        if (!s) return res.status(404).send(tpl.renderNotFound({ biz }));

        return res.status(200).send(tpl.render({ biz, s }));
    } catch (e) {
        console.error("tracker: render error:", e.message);
        return res.status(500).send("<h1>Something went wrong. Please try again later.</h1>");
    }
}

// 2) Public JSON API (for a shop that renders its own page/URL).
async function getStatusJson(req, res) {
    try {
        const token = String(req.params.token || "").trim();
        if (!token) return res.status(404).json({ error: "not_found" });
        const s = await fetchOrderStatus(token);
        if (!s) return res.status(404).json({ error: "not_found" });
        const biz = await getBusiness();
        return res.status(200).json({
            order: s.order,
            status: s.status,
            message: s.message,
            cancelled: s.cancelled,
            placed_at: s.placed_at,
            dispatched_at: s.dispatched_at,
            delivered_at: s.delivered_at,
            item_count: s.item_count,
            timeline: s.steps.map((st) => ({ label: st.label, at: st.at, done: st.done, stage: st.icon })),
            business: { name: biz.name, logo: biz.logo || null, template: getTemplate(biz.template).key },
        });
    } catch (e) {
        console.error("tracker: json error:", e.message);
        return res.status(500).json({ error: "server_error" });
    }
}

module.exports = { renderPage, getStatusJson };
