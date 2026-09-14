# stock-flow-tracker: agent guide

The public order tracking page a QR code on a label or invoice points at. Its own repo and its own
deployment. The workspace guide (`../CLAUDE.md`) holds the business rules and writing style; this
file holds what is specific to the tracker. `README.md` describes setup, surfaces and templates.

## What must stay true

- **It never calls the admin API.** The admin backend is never exposed to the public. This service
  reads the database directly.
- **It only runs read-only `SELECT`s, as the `stockflow_tracker` role**, which is granted `SELECT` on
  `orders`, `order_items` and `settings` and nothing else. `DB_USER` must be that role in every
  environment, including the hosting dashboard: the admin account also works, which is exactly why a
  mistake there goes unnoticed. If a change needs another table, the grant is a migration in
  `stock-flow-documents`, decided first, never a switch to a stronger account.
- **It shows minimal data**: order number, status and timeline, dates, item count, business name and
  logo. **No customer name, phone, address or prices**, in the page or the JSON API.
- **It resolves only `orders.tracking_token`**, a random value minted when an order is confirmed,
  never an internal `oid`.
- Unknown tokens and failures render the template's not-found and error cards. A stale or unknown
  `settings.tracker_template` falls back to `classic`.
- The database allows 20 connections, shared with the API. Keep the pool small.

## Templates

A template exports `{ key, label, description, render, renderNotFound, renderError }`, is registered
in `src/templates/index.js`, and receives exactly the same data as every other template. Escaping,
dates, icons and the page skeleton live in `src/format.js` so the parts that must stay identical
cannot drift. The web app's Settings picker lists the same keys; that screen is not ported to
`feat/app-revamp` yet, so the list there is added when Settings is.

## Verify

`npm run dev`, then `http://localhost:4000/preview/<template>?state=confirmed|dispatched|delivered|cancelled|notfound|error`.
The preview route is hard-gated to non-production.
