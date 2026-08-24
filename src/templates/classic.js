// Template: CLASSIC
// Light, neutral, courier-standard. White card on grey, horizontal stepper with
// circular icon nodes, confident blue accent. The safe default for any business.
const { esc, fmtDate, icon, progress, doc, retryLink } = require("../format");

const STYLE = `
  :root{--brand:#1a56db;--bad:#ef4444;--ink:#1a1f2e;--muted:#9aa0ad;--line:#eef0f4;--bg:#f5f6f8}
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
  .ico{width:22px;height:22px}
  .wrap{max-width:480px;margin:0 auto;padding:28px 16px 40px}
  .brand{text-align:center;margin-bottom:18px}
  .logo{max-height:52px;object-fit:contain}
  .brand-name{font-weight:700;font-size:18px}
  .card{background:#fff;border-radius:18px;padding:24px 22px 26px;box-shadow:0 6px 24px rgba(20,28,45,.08),0 1px 2px rgba(20,28,45,.04)}
  .eyebrow{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:600}
  .order-no{font-size:26px;font-weight:800;margin:2px 0 12px;letter-spacing:-.5px}
  .badge{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:999px;font-weight:700;font-size:13px;background:var(--brand);color:#fff}
  .badge.bad{background:var(--bad)}
  .message{margin:14px 0 2px;color:#4b5563;font-size:14px}
  .stepper{position:relative;margin:30px 2px 6px}
  .track{position:absolute;top:21px;height:4px;background:#e7e9ef;border-radius:4px;z-index:0}
  .track-fill{height:100%;background:var(--brand);border-radius:4px}
  .track.bad .track-fill{background:var(--bad)}
  .nodes{display:flex;justify-content:space-between;position:relative;z-index:1}
  .node{display:flex;flex-direction:column;align-items:center;text-align:center;flex:1}
  .circle{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#eef0f4;color:#aeb4c0;box-shadow:0 0 0 4px #fff}
  .node.done .circle{background:var(--brand);color:#fff}
  .node.bad .circle{background:var(--bad);color:#fff}
  .node-label{font-weight:600;font-size:12.5px;margin-top:10px}
  .node-date{font-size:11px;color:var(--muted);margin-top:3px;line-height:1.35}
  .meta{display:flex;margin-top:24px;border-top:1px solid var(--line);padding-top:16px}
  .meta > div{flex:1}
  .meta .k{font-size:12px;color:var(--muted)}
  .meta .v{font-weight:600;font-size:14px;margin-top:2px}
  .foot{text-align:center;margin-top:20px;color:#aeb4c0;font-size:12px}
`;

const header = (biz) => (biz.logo ? `<img src="${esc(biz.logo)}" alt="${esc(biz.name)}" class="logo"/>` : `<div class="brand-name">${esc(biz.name)}</div>`);

const render = ({ biz, s }) => {
    const p = progress(s.steps);
    const nodes = s.steps
        .map((st) => `<div class="node ${st.done ? "done" : ""} ${st.bad ? "bad" : ""}"><div class="circle">${icon(st.icon)}</div><div class="node-label">${esc(st.label)}</div><div class="node-date">${st.at ? esc(fmtDate(st.at)) : "Pending"}</div></div>`)
        .join("");

    const body = `
      <div class="wrap">
        <div class="brand">${header(biz)}</div>
        <div class="card">
          <div class="eyebrow">Order</div>
          <div class="order-no">#${esc(s.order)}</div>
          <span class="badge ${s.cancelled ? "bad" : ""}">${esc(s.status)}</span>
          <p class="message">${esc(s.message)}</p>
          <div class="stepper">
            <div class="track${s.cancelled ? " bad" : ""}" style="left:${p.inset}%;right:${p.inset}%"><div class="track-fill" style="width:${p.fillPct}%"></div></div>
            <div class="nodes">${nodes}</div>
          </div>
          <div class="meta">
            <div><div class="k">Placed</div><div class="v">${esc(fmtDate(s.placed_at))}</div></div>
            <div><div class="k">Items</div><div class="v">${esc(s.item_count)}</div></div>
          </div>
        </div>
        <div class="foot">Powered by ${esc(biz.name)}</div>
      </div>`;
    return doc(`Track Order #${s.order}`, STYLE, body);
};

const renderNotFound = ({ biz }) =>
    doc(
        "Order not found",
        STYLE,
        `<div class="wrap"><div class="brand">${header(biz)}</div><div class="card"><div class="eyebrow">Tracking</div><div class="order-no">Order not found</div><p class="message">This tracking link is invalid or has expired.</p></div></div>`
    );

// Shown when the read failed rather than came back empty (see track-controller).
// Same shell as the not-found page, plus a way to retry.
const renderError = ({ biz, retry }) =>
    doc(
        "Order tracking unavailable",
        STYLE,
        `<div class="wrap"><div class="brand">${header(biz)}</div><div class="card"><div class="eyebrow">Tracking</div><div class="order-no">Temporarily unavailable</div><p class="message">We could not load this order just now. Please try again in a moment.</p>${retryLink(retry)}</div></div>`
    );

module.exports = { key: "classic", label: "Classic", description: "Neutral white card, blue accent, horizontal stepper. Safe for any business.", render, renderNotFound, renderError };
