// LOCAL-ONLY template preview. Wired up in server.js and hard-gated to
// non-production, so a deployed tracker never exposes it. Lets you eyeball every
// template in every order state without minting real orders:
//   GET /preview                      -> index of all templates
//   GET /preview/:key?state=delivered -> one template (state: confirmed |
//                                        dispatched | delivered | cancelled |
//                                        notfound | error)
const { listTemplates, getTemplate, TEMPLATES } = require("./templates");

const SAMPLE_BIZ = { name: "Anaya Lifestyle", logo: "" };

const ago = (h) => new Date(Date.now() - h * 3600e3);

const STATES = {
    confirmed: () => ({
        status: "Confirmed",
        message: "Your order has been confirmed and is being prepared.",
        cancelled: false,
        placed_at: ago(6),
        dispatched_at: null,
        delivered_at: null,
        steps: [
            { label: "Confirmed", at: ago(6), done: true, icon: "confirmed" },
            { label: "Out for delivery", at: null, done: false, icon: "shipped" },
            { label: "Delivered", at: null, done: false, icon: "delivered" },
        ],
    }),
    dispatched: () => ({
        status: "Out for delivery",
        message: "Good news, your order is on the way.",
        cancelled: false,
        placed_at: ago(30),
        dispatched_at: ago(4),
        delivered_at: null,
        steps: [
            { label: "Confirmed", at: ago(30), done: true, icon: "confirmed" },
            { label: "Out for delivery", at: ago(4), done: true, icon: "shipped" },
            { label: "Delivered", at: null, done: false, icon: "delivered" },
        ],
    }),
    delivered: () => ({
        status: "Delivered",
        message: "Your order has been delivered. Thank you!",
        cancelled: false,
        placed_at: ago(52),
        dispatched_at: ago(26),
        delivered_at: ago(2),
        steps: [
            { label: "Confirmed", at: ago(52), done: true, icon: "confirmed" },
            { label: "Out for delivery", at: ago(26), done: true, icon: "shipped" },
            { label: "Delivered", at: ago(2), done: true, icon: "delivered" },
        ],
    }),
    cancelled: () => ({
        status: "Cancelled",
        message: "This order has been cancelled.",
        cancelled: true,
        placed_at: ago(20),
        dispatched_at: null,
        delivered_at: null,
        steps: [
            { label: "Confirmed", at: ago(20), done: true, icon: "confirmed" },
            { label: "Cancelled", at: ago(3), done: true, bad: true, icon: "cancelled" },
        ],
    }),
};

const sample = (state) => ({ order: "2608220017", item_count: 3, ...(STATES[state] || STATES.dispatched)() });

const index = (req, res) => {
    const rows = listTemplates()
        .map((t) => `<li><a href="/preview/${t.key}">${t.label}</a> <code>${t.key}</code><br/><small>${t.description}</small></li>`)
        .join("");
    return res
        .status(200)
        .send(
            `<!doctype html><meta charset="utf-8"><title>Tracker templates</title><style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 20px;line-height:1.5}li{margin-bottom:14px}code{background:#eee;padding:1px 5px;border-radius:4px;font-size:12px}small{color:#666}</style><h1>Tracker templates</h1><p>Append <code>?state=confirmed|dispatched|delivered|cancelled|notfound|error</code> to any link.</p><ul>${rows}</ul>`
        );
};

const one = (req, res) => {
    const key = String(req.params.key || "").toLowerCase();
    if (!TEMPLATES[key]) return res.status(404).send("Unknown template. Try /preview");
    const tpl = getTemplate(key);
    const biz = { ...SAMPLE_BIZ, template: key };
    const state = String(req.query.state || "dispatched").toLowerCase();
    if (state === "notfound") return res.status(200).send(tpl.renderNotFound({ biz }));
    // The page a customer gets when the read failed. Worth eyeballing per template:
    // it is the one state you cannot produce on demand in production.
    if (state === "error") return res.status(200).send(tpl.renderError({ biz, retry: req.originalUrl }));
    return res.status(200).send(tpl.render({ biz, s: sample(state) }));
};

module.exports = { index, one };
