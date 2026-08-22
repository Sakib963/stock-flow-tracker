// Template: VIBRANT
// Friendly and energetic. Violet-to-pink gradient canvas, a big rounded white
// card that overlaps it, chunky pill stepper. Suits social-commerce, food,
// lifestyle and youth brands selling on Facebook/Instagram.
const { esc, fmtDate, icon, progress, doc } = require("../format");

const STYLE = `
  :root{--brand:#7c3aed;--brand-2:#ec4899;--bad:#e11d48;--ink:#1e1b2e;--muted:#8b87a3;--line:#efecf7}
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;background:#f7f5fd}
  .ico{width:21px;height:21px}
  .hero{background:linear-gradient(135deg,#7c3aed 0%,#a855f7 45%,#ec4899 100%);padding:34px 16px 84px;text-align:center}
  .logo{max-height:46px;object-fit:contain}
  .brand-name{color:#fff;font-weight:800;font-size:19px;letter-spacing:-.2px}
  .hero .k{color:rgba(255,255,255,.75);font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;margin-top:16px}
  .hero .order-no{color:#fff;font-size:32px;font-weight:900;letter-spacing:-1px;margin-top:4px}
  .wrap{max-width:480px;margin:-64px auto 0;padding:0 16px 44px}
  .card{background:#fff;border-radius:26px;padding:26px 22px 28px;box-shadow:0 18px 44px rgba(76,29,149,.16)}
  .badge{display:inline-flex;align-items:center;gap:7px;padding:9px 17px;border-radius:999px;font-weight:800;font-size:13px;color:#fff;background:linear-gradient(135deg,var(--brand),var(--brand-2))}
  .badge.bad{background:var(--bad)}
  .message{margin:15px 0 0;color:#6b6880;font-size:14.5px;line-height:1.55}
  .stepper{position:relative;margin:32px 2px 8px}
  .track{position:absolute;top:22px;height:6px;background:var(--line);border-radius:6px;z-index:0}
  .track-fill{height:100%;background:linear-gradient(90deg,var(--brand),var(--brand-2));border-radius:6px}
  .track.bad .track-fill{background:var(--bad)}
  .nodes{display:flex;justify-content:space-between;position:relative;z-index:1}
  .node{display:flex;flex-direction:column;align-items:center;text-align:center;flex:1}
  .circle{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#f4f1fb;color:#b9b3d1;box-shadow:0 0 0 5px #fff}
  .node.done .circle{background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#fff;box-shadow:0 0 0 5px #fff,0 8px 18px rgba(124,58,237,.32)}
  .node.bad .circle{background:var(--bad);color:#fff;box-shadow:0 0 0 5px #fff}
  .node-label{font-weight:700;font-size:12.5px;margin-top:11px}
  .node:not(.done) .node-label{color:var(--muted)}
  .node-date{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.4}
  .meta{display:flex;gap:12px;margin-top:26px}
  .meta > div{flex:1;background:#faf8ff;border-radius:16px;padding:13px 15px}
  .meta .k{font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .meta .v{font-weight:800;font-size:14px;margin-top:4px}
  .foot{text-align:center;margin-top:22px;color:#a9a4bd;font-size:12px;font-weight:600}
`;

const header = (biz) => (biz.logo ? `<img src="${esc(biz.logo)}" alt="${esc(biz.name)}" class="logo"/>` : `<div class="brand-name">${esc(biz.name)}</div>`);

const render = ({ biz, s }) => {
    const p = progress(s.steps);
    const nodes = s.steps
        .map((st) => `<div class="node ${st.done ? "done" : ""} ${st.bad ? "bad" : ""}"><div class="circle">${icon(st.icon)}</div><div class="node-label">${esc(st.label)}</div><div class="node-date">${st.at ? esc(fmtDate(st.at)) : "Pending"}</div></div>`)
        .join("");

    const body = `
      <div class="hero">
        ${header(biz)}
        <div class="k">Your order</div>
        <div class="order-no">#${esc(s.order)}</div>
      </div>
      <div class="wrap">
        <div class="card">
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
        `<div class="hero">${header(biz)}<div class="k">Tracking</div><div class="order-no">Not found</div></div><div class="wrap"><div class="card"><p class="message">This tracking link is invalid or has expired.</p></div></div>`
    );

module.exports = { key: "vibrant", label: "Vibrant", description: "Violet-to-pink gradient hero with an overlapping card. Playful, social-commerce ready.", render, renderNotFound };
