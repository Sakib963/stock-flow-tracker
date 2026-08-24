// Shared rendering helpers used by EVERY tracker template.
// Nothing here decides how the page looks; that is each template's job. This file
// only owns escaping, date formatting, the icon set and the HTML skeleton so the
// five templates cannot drift on the things that must stay identical.

const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parse = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
};

const clock = (dt) => {
    let h = dt.getHours();
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")} ${ap}`;
};

// 22/08/2026 08:36 AM
const fmtDate = (d) => {
    const dt = parse(d);
    if (!dt) return "";
    return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()} ${clock(dt)}`;
};

// 22 Aug 2026, 08:36 AM
const fmtDateLong = (d) => {
    const dt = parse(d);
    if (!dt) return "";
    return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}, ${clock(dt)}`;
};

// Inline line-icons (no external assets). Sized by CSS, colored via currentColor.
const ICONS = {
    confirmed: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 13l2 2 4-4"/></svg>`,
    shipped: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4h13v11H1z"/><path d="M14 8h4l3 3v4h-7z"/><circle cx="5.5" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></svg>`,
    delivered: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/></svg>`,
    cancelled: `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6"/></svg>`,
};

const icon = (name) => ICONS[name] || "";

// Progress maths shared by the horizontal stepper layouts.
//   fillPct = how much of the connecting line is filled (0-100)
//   inset   = percent from each edge to the centre of the first/last node
const progress = (steps) => {
    const n = steps.length;
    const doneCount = steps.filter((x) => x.done).length;
    return { fillPct: n > 1 ? (Math.max(0, doneCount - 1) / (n - 1)) * 100 : 0, inset: 50 / n };
};

// The one HTML skeleton. `style` is the template's own stylesheet.
const doc = (title, style, body) =>
    `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex,nofollow"/><title>${esc(title)}</title><style>${style}</style></head><body>${body}</body></html>`;

// "Try again" control for the temporarily-unavailable page. One definition works
// in every template because it borrows the surrounding text colour, so it reads
// correctly on the light, dark and gradient cards alike. A plain link, so it
// still works with JS off.
const retryLink = (href) =>
    `<a href="${esc(href || "")}" style="display:inline-block;margin-top:18px;padding:10px 22px;border:1.5px solid currentColor;border-radius:999px;color:inherit;font-size:13px;font-weight:600;text-decoration:none;opacity:.75">Try again</a>`;

module.exports = { esc, fmtDate, fmtDateLong, icon, progress, doc, retryLink };
