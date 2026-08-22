// Template: BOUTIQUE
// Warm and editorial. Cream paper, serif headings, terracotta accent, a soft
// card and a vertical timeline with ringed dots. Suits fashion, jewellery,
// beauty, home decor and hand-made brands.
const { esc, fmtDateLong, doc } = require("../format");

const STYLE = `
  :root{--brand:#b4614b;--soft:#f0dcd3;--bad:#a33a3a;--bg:#faf6f1;--card:#fffdfb;--ink:#2c2622;--muted:#8d817a;--line:#ece2da}
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased}
  .wrap{max-width:460px;margin:0 auto;padding:44px 20px 52px}
  .brand{text-align:center;margin-bottom:26px}
  .logo{max-height:46px;object-fit:contain}
  .brand-name{font-family:Georgia,'Times New Roman',Times,serif;font-size:22px;letter-spacing:.04em}
  .rule{width:34px;height:1px;background:var(--brand);margin:14px auto 0;opacity:.55}
  .card{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:34px 30px 32px;box-shadow:0 10px 40px rgba(89,63,48,.07)}
  .k{font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
  .order-no{font-family:Georgia,'Times New Roman',Times,serif;font-size:30px;margin:6px 0 0;letter-spacing:.01em}
  .badge{display:inline-block;margin-top:18px;padding:6px 15px;border-radius:2px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;background:var(--soft);color:var(--brand)}
  .badge.bad{background:#f3dede;color:var(--bad)}
  .message{font-family:Georgia,'Times New Roman',Times,serif;font-size:16px;line-height:1.65;color:#5f544d;margin:18px 0 0;font-style:italic}
  .line{margin:32px 0 0;padding:0;list-style:none}
  .step{position:relative;padding:0 0 28px 30px}
  .step:last-child{padding-bottom:0}
  .step:before{content:'';position:absolute;left:6px;top:18px;bottom:-2px;width:1px;background:var(--line)}
  .step:last-child:before{display:none}
  .step.done:before{background:var(--soft)}
  .dot{position:absolute;left:0;top:4px;width:13px;height:13px;border-radius:50%;background:var(--card);border:1px solid var(--line)}
  .step.done .dot{border-color:var(--brand);box-shadow:inset 0 0 0 3px var(--card),inset 0 0 0 9px var(--brand)}
  .step.bad .dot{border-color:var(--bad);box-shadow:inset 0 0 0 3px var(--card),inset 0 0 0 9px var(--bad)}
  .step-label{font-family:Georgia,'Times New Roman',Times,serif;font-size:16px;line-height:1.25}
  .step:not(.done) .step-label{color:var(--muted)}
  .step-date{font-size:11.5px;color:var(--muted);margin-top:5px;letter-spacing:.03em}
  .meta{display:flex;gap:30px;margin-top:34px;padding-top:22px;border-top:1px solid var(--line)}
  .meta .v{font-family:Georgia,'Times New Roman',Times,serif;font-size:15px;margin-top:6px}
  .foot{text-align:center;margin-top:28px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#a89a91}
`;

const header = (biz) => `<div class="brand">${biz.logo ? `<img src="${esc(biz.logo)}" alt="${esc(biz.name)}" class="logo"/>` : `<div class="brand-name">${esc(biz.name)}</div>`}<div class="rule"></div></div>`;

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
        <div class="card">
          <div class="k">Order</div>
          <div class="order-no">No. ${esc(s.order)}</div>
          <div><span class="badge ${s.cancelled ? "bad" : ""}">${esc(s.status)}</span></div>
          <p class="message">${esc(s.message)}</p>
          <ul class="line">${steps}</ul>
          <div class="meta">
            <div><div class="k">Placed</div><div class="v">${esc(fmtDateLong(s.placed_at))}</div></div>
            <div><div class="k">Items</div><div class="v">${esc(s.item_count)}</div></div>
          </div>
        </div>
        <div class="foot">${esc(biz.name)}</div>
      </div>`;
    return doc(`Track Order ${s.order}`, STYLE, body);
};

const renderNotFound = ({ biz }) =>
    doc(
        "Order not found",
        STYLE,
        `<div class="wrap">${header(biz)}<div class="card"><div class="k">Tracking</div><div class="order-no">Not found</div><p class="message">This tracking link is invalid or has expired.</p></div></div>`
    );

module.exports = { key: "boutique", label: "Boutique", description: "Cream paper, serif headings, terracotta accent, vertical timeline. Warm and elegant.", render, renderNotFound };
