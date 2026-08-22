# StockFlow Tracker

A tiny, standalone public page that shows an order's status from a tracking token
(the QR on an order label/invoice points here). It is deliberately **separate** from
the StockFlow admin app and API:

- It **never** calls the admin backend, so the backend is never exposed publicly.
- It only ever runs **read-only SELECTs** against a scoped DB role.
- It shows **minimal** data: order number, status + timeline, dates, item count, and
  the business name/logo (read from the `settings` company info). **No** customer
  phone/address/name and **no** prices.
- The **design** comes from one of several hand-built templates, chosen per business
  (see [Templates](#templates)).

## How a token is created
The admin backend mints a random `orders.tracking_token` when an order is
**Confirmed** (never the internal id). This service resolves that token to a status.

## Setup

1. Create a **read-only** DB role limited to the three tables this app reads:

   ```sql
   CREATE ROLE stockflow_tracker WITH LOGIN PASSWORD 'choose-a-strong-password';
   GRANT CONNECT ON DATABASE defaultdb TO stockflow_tracker;
   GRANT USAGE ON SCHEMA public TO stockflow_tracker;
   GRANT SELECT ON orders, order_items, settings TO stockflow_tracker;
   -- Explicitly nothing else. No INSERT/UPDATE/DELETE, no other tables.
   ```

2. Copy `.env.example` to `.env` and fill in the read-only credentials.

3. Install and run:

   ```bash
   npm install
   npm run dev      # nodemon, auto-restarts on changes (recommended while developing)
   # or
   npm start        # plain node
   ```

4. Open `http://localhost:4000/<token>` with a real confirmed order's `tracking_token`.

## Deploy
Deploy as its own project (e.g. its own Vercel project) on its own domain such as
`track.yourshop.com`. `vercel.json` routes everything to `server.js`. Set the same
`.env` variables as project environment variables. Keep this deployment separate
from the admin app/API.

## Surfaces
- **Hosted page:** `GET https://track.yourshop.com/<tracking_token>` - the branded HTML
  page. This is the URL encoded into the order QR (label + invoice).
- **JSON API:** `GET https://track.yourshop.com/api/track/<tracking_token>` - the same
  minimal status as JSON (CORS open), so a shop can render tracking on **their own
  website/URL** while calling this one service. Example response:
  ```json
  {
    "order": "2608130001",
    "status": "Out for delivery",
    "cancelled": false,
    "placed_at": "2026-08-13T02:36:00.000Z",
    "dispatched_at": "2026-08-13T03:14:00.000Z",
    "delivered_at": null,
    "item_count": 1,
    "message": "Good news, your order is on the way.",
    "timeline": [ { "label": "Out for delivery", "at": "...", "done": true, "stage": "shipped" } ],
    "business": { "name": "...", "logo": "...", "template": "classic" }
  }
  ```

## Templates
The design is **not** fetched from the database; it is one of several COMPLETE,
hand-built pages in `src/templates/`. Every template receives exactly the same order
data and only the styling and the static copy differ, so a business picks a look
without changing what customers can see.

| key | look |
| --- | --- |
| `classic` | Neutral white card, blue accent, horizontal stepper. Safe for any business. |
| `minimal` | Editorial black and white, hairline rules, vertical timeline. |
| `midnight` | Dark glass card, mint glow, oversized order number. |
| `boutique` | Cream paper, serif headings, terracotta accent, vertical timeline. |
| `vibrant` | Violet-to-pink gradient hero with an overlapping card. |

The business picks one in the admin app (**Settings -> Tracking Page**), which stores
the key in `settings.tracker_template`. A blank or unknown key falls back to
`classic`, so a stale value can never take the page down.

**Preview them locally** (the route is hard-gated to non-production, so a deployed
tracker never exposes it):

```
http://localhost:4000/preview
http://localhost:4000/preview/midnight?state=delivered
```

`state` accepts `confirmed`, `dispatched`, `delivered`, `cancelled` and `notfound`.

### Adding a template
1. Copy an existing file in `src/templates/` and restyle it. A template exports
   `{ key, label, description, render({ biz, s }), renderNotFound({ biz }) }`.
2. Register it in `src/templates/index.js`.
3. Add the same entry to `core/constants/tracker-templates.ts` in `stock-flow-web`
   so it shows up in the Settings picker.

Escaping, date formatting, the icon set and the HTML skeleton live in `src/format.js`
so templates cannot drift on the parts that must stay identical.

## Single business
This tracker serves ONE StockFlow business. The only values read from the single
`settings` row are the ones that can change **without** a redeploy: the business
**name**, **logo** and the chosen **template key**. There is no tenant concept here by
design.

## Guarantees / limits
- Read-only role means a compromise of this service cannot modify data.
- Token routes are constrained to token-shaped paths and rate-limited per IP.
- Responses are minimal: no customer PII, no prices.
