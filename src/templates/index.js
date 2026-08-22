// Template registry.
// Each business picks ONE of these by key (`settings.tracker_template`). The data
// a template receives is always identical -- only the design and the static copy
// differ. Adding a sixth template = drop a file next to these, register it here,
// and add the same key to the picker in the admin app.
const classic = require("./classic");
const minimal = require("./minimal");
const midnight = require("./midnight");
const boutique = require("./boutique");
const vibrant = require("./vibrant");

const TEMPLATES = { classic, minimal, midnight, boutique, vibrant };
const DEFAULT_TEMPLATE = "classic";

// Unknown/blank keys fall back to the default, so a bad settings value can never
// take the page down.
const getTemplate = (key) => TEMPLATES[String(key || "").trim().toLowerCase()] || TEMPLATES[DEFAULT_TEMPLATE];

const listTemplates = () => Object.values(TEMPLATES).map((t) => ({ key: t.key, label: t.label, description: t.description }));

module.exports = { TEMPLATES, DEFAULT_TEMPLATE, getTemplate, listTemplates };
