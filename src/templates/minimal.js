// Template: MINIMAL
// Editorial and quiet. Pure white, hairline rules, generous whitespace, a
// monospace order number and a VERTICAL timeline. No colour except ink and one
// muted grey. Suits studios, stationery, specialty and premium-plain brands.
const { esc, fmtDateLong, doc, retryLink } = require("../format");

const STYLE = `
  :root{--ink:#101114;--muted:#8b8f98;--line:#e6e7ea;--bad:#b4231f}
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#fff;color:var(--ink);-webkit-font-smoothing:antialiased}
  .wrap{max-width:440px;margin:0 auto;padding:56px 24px 64px}
  .brand{display:flex;align-items:center;gap:10px;padding-bottom:22px;border-bottom:1px solid var(--line)}
  .logo{max-height:30px;object-fit:contain}
  .brand-name{font-size:13px;font-weight:600;letter-spacing:.16em;text-transform:uppercase}
  .k{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);font-weight:600}
  .order-no{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:34px;font-weight:500;letter-spacing:-.02em;margin:8px 0 0}
  .head{padding:34px 0 26px;border-bottom:1px solid var(--line)}
  .status{font-size:20px;font-weight:600;margin:26px 0 6px;letter-spacing:-.01em}
  .status.bad{color:var(--bad)}
  .message{color:var(--muted);font-size:14px;line-height:1.6;margin:0}
  .line{margin:32px 0 0;padding:0;list-style:none}
  .step{position:relative;padding:0 0 26px 26px}
  .step:last-child{padding-bottom:0}
  .step:before{content:'';position:absolute;left:3px;top:16px;bottom:-4px;width:1px;background:var(--line)}
  .step:last-child:before{display:none}
  .step.done:before{background:var(--ink)}
  .dot{position:absolute;left:0;top:5px;width:7px;height:7px;border-radius:50%;border:1px solid var(--line);background:#fff}
  .step.done .dot{background:var(--ink);border-color:var(--ink)}
  .step.bad .dot{background:var(--bad);border-color:var(--bad)}
  .step-label{font-size:14.5px;font-weight:600;line-height:1.2}
  .step:not(.done) .step-label{color:var(--muted);font-weight:500}
  .step-date{font-size:12px;color:var(--muted);margin-top:5px}
  .meta{display:flex;gap:34px;margin-top:38px;padding-top:22px;border-top:1px solid var(--line)}
  .meta .v{font-size:14px;margin-top:6px}
  .foot{margin-top:44px;font-size:11px;color:var(--muted);letter-spacing:.06em}
`;

const header = (biz) => `<div class="brand">${biz.logo ? `<img src="${esc(biz.logo)}" alt="${esc(biz.name)}" class="logo"/>` : ""}<div class="brand-name">${esc(biz.name)}</div></div>`;

const render = ({ biz, s }) => {
    const steps = s.steps
        .map(
            (st) =>
                `<li class="step ${st.done ? "done" : ""} ${st.bad ? "bad" : ""}"><span class="dot"></span><div class="step-label">${esc(st.label)}</div><div class="step-date">${st.at ? esc(fmtDateLong(st.at)) : "Awaiting update"}</div></li>`
        )
        .join("");

    const body = `
      <div class="wrap">
        ${header(biz)}
        <div class="head">
          <div class="k">Order</div>
          <div class="order-no">${esc(s.order)}</div>
        </div>
        <div class="status ${s.cancelled ? "bad" : ""}">${esc(s.status)}</div>
        <p class="message">${esc(s.message)}</p>
        <ul class="line">${steps}</ul>
        <div class="meta">
          <div><div class="k">Placed</div><div class="v">${esc(fmtDateLong(s.placed_at))}</div></div>
          <div><div class="k">Items</div><div class="v">${esc(s.item_count)}</div></div>
        </div>
        <div class="foot">${esc(biz.name)}</div>
      </div>`;
    return doc(`Track Order ${s.order}`, STYLE, body);
};

const renderNotFound = ({ biz }) =>
    doc(
        "Order not found",
        STYLE,
        `<div class="wrap">${header(biz)}<div class="head"><div class="k">Tracking</div><div class="order-no">Not found</div></div><p class="message">This tracking link is invalid or has expired.</p></div>`
    );

// Shown when the read failed rather than came back empty (see track-controller).
// Same shell as the not-found page, plus a way to retry.
const renderError = ({ biz, retry }) =>
    doc(
        "Order tracking unavailable",
        STYLE,
        `<div class="wrap">${header(biz)}<div class="head"><div class="k">Tracking</div><div class="order-no">Unavailable</div></div><p class="message">We could not load this order just now. Please try again in a moment.</p>${retryLink(retry)}</div>`
    );

module.exports = { key: "minimal", label: "Minimal", description: "Editorial black-and-white, hairline rules, vertical timeline. Premium and quiet.", render, renderNotFound, renderError };
