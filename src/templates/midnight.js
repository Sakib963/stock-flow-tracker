// Template: MIDNIGHT
// Dark, high-contrast and modern. Near-black canvas, glass card, a glowing mint
// accent and an oversized order number. Suits tech, gadget, streetwear and
// anything that wants to feel premium-modern rather than friendly.
const { esc, fmtDate, icon, progress, doc, retryLink } = require("../format");

const STYLE = `
  :root{--brand:#4ade80;--glow:rgba(74,222,128,.35);--bad:#fb7185;--bg:#0b0d12;--card:#141822;--line:#242a38;--ink:#eef1f6;--muted:#8b94a7}
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;background-image:radial-gradient(900px 420px at 50% -140px,rgba(74,222,128,.13),transparent 70%)}
  .ico{width:20px;height:20px}
  .wrap{max-width:480px;margin:0 auto;padding:40px 16px 48px}
  .brand{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:26px}
  .logo{max-height:40px;object-fit:contain}
  .brand-name{font-weight:600;font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
  .card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px 22px 28px;box-shadow:0 24px 60px rgba(0,0,0,.5)}
  .eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:600}
  .order-no{font-size:38px;font-weight:800;letter-spacing:-1.2px;margin:4px 0 16px;line-height:1}
  .badge{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;font-weight:700;font-size:12.5px;background:rgba(74,222,128,.12);color:var(--brand);border:1px solid rgba(74,222,128,.3)}
  .badge.bad{background:rgba(251,113,133,.12);color:var(--bad);border-color:rgba(251,113,133,.3)}
  .pulse{width:7px;height:7px;border-radius:50%;background:currentColor;box-shadow:0 0 0 3px rgba(255,255,255,.08)}
  .message{margin:16px 0 0;color:var(--muted);font-size:14px;line-height:1.55}
  .stepper{position:relative;margin:34px 2px 8px}
  .track{position:absolute;top:19px;height:3px;background:var(--line);border-radius:3px;z-index:0}
  .track-fill{height:100%;background:var(--brand);border-radius:3px;box-shadow:0 0 12px var(--glow)}
  .track.bad .track-fill{background:var(--bad);box-shadow:none}
  .nodes{display:flex;justify-content:space-between;position:relative;z-index:1}
  .node{display:flex;flex-direction:column;align-items:center;text-align:center;flex:1}
  .circle{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:#1c2231;color:#5b6478;border:1px solid var(--line);box-shadow:0 0 0 5px var(--card)}
  .node.done .circle{background:var(--brand);color:#08130c;border-color:var(--brand);box-shadow:0 0 0 5px var(--card),0 0 18px var(--glow)}
  .node.bad .circle{background:var(--bad);color:#2a0a10;border-color:var(--bad);box-shadow:0 0 0 5px var(--card)}
  .node-label{font-weight:600;font-size:12px;margin-top:11px}
  .node:not(.done) .node-label{color:var(--muted)}
  .node-date{font-size:10.5px;color:#69728a;margin-top:4px;line-height:1.4}
  .meta{display:flex;margin-top:26px;border-top:1px solid var(--line);padding-top:18px}
  .meta > div{flex:1}
  .meta .k{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  .meta .v{font-weight:700;font-size:14px;margin-top:4px}
  .foot{text-align:center;margin-top:24px;color:#5b6478;font-size:11.5px;letter-spacing:.05em}
`;

const header = (biz) => `<div class="brand">${biz.logo ? `<img src="${esc(biz.logo)}" alt="${esc(biz.name)}" class="logo"/>` : `<div class="brand-name">${esc(biz.name)}</div>`}</div>`;

const render = ({ biz, s }) => {
    const p = progress(s.steps);
    const nodes = s.steps
        .map((st) => `<div class="node ${st.done ? "done" : ""} ${st.bad ? "bad" : ""}"><div class="circle">${icon(st.icon)}</div><div class="node-label">${esc(st.label)}</div><div class="node-date">${st.at ? esc(fmtDate(st.at)) : "Pending"}</div></div>`)
        .join("");

    const body = `
      <div class="wrap">
        ${header(biz)}
        <div class="card">
          <div class="eyebrow">Order</div>
          <div class="order-no">#${esc(s.order)}</div>
          <span class="badge ${s.cancelled ? "bad" : ""}"><span class="pulse"></span>${esc(s.status)}</span>
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
        <div class="foot">${esc(biz.name)}</div>
      </div>`;
    return doc(`Track Order #${s.order}`, STYLE, body);
};

const renderNotFound = ({ biz }) =>
    doc(
        "Order not found",
        STYLE,
        `<div class="wrap">${header(biz)}<div class="card"><div class="eyebrow">Tracking</div><div class="order-no">Not found</div><p class="message">This tracking link is invalid or has expired.</p></div></div>`
    );

// Shown when the read failed rather than came back empty (see track-controller).
// Same shell as the not-found page, plus a way to retry.
const renderError = ({ biz, retry }) =>
    doc(
        "Order tracking unavailable",
        STYLE,
        `<div class="wrap">${header(biz)}<div class="card"><div class="eyebrow">Tracking</div><div class="order-no">Unavailable</div><p class="message">We could not load this order just now. Please try again in a moment.</p>${retryLink(retry)}</div></div>`
    );

module.exports = { key: "midnight", label: "Midnight", description: "Dark glass card, mint glow, oversized order number. Modern and techy.", render, renderNotFound, renderError };
