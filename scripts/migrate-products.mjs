// One-time (re-runnable) migration: import data/generators.json into PocketBase's
// `products` collection, creating `brands` and `power_bands` records as needed and
// wiring products to them via relations instead of free-text brand/kVA-band strings.
//
// Usage (PowerShell):
//   $env:POCKETBASE_ADMIN_EMAIL="you@example.com"; $env:POCKETBASE_ADMIN_PASSWORD="..."; npm run migrate:products
//
// Safe to re-run: brands/power bands are matched by name/value, products by
// (brand, model), so re-running updates existing records instead of duplicating them.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Missing POCKETBASE_ADMIN_EMAIL / POCKETBASE_ADMIN_PASSWORD env vars (superuser credentials)."
  );
  process.exit(1);
}

// Canonical brand order, matching data/generators.ts's BRANDS list.
const BRAND_ORDER = ["John Deere", "Cummins", "Ricardo", "Perkins", "Volvo Penta", "Deutz"];

// Matches data/generators.ts's KVA_BANDS labels and CLAUDE.md's banding definition.
const POWER_BAND_DEFS = [
  { value: "Small", label: "Small (<50 kVA)", minKva: 0, maxKva: 49 },
  { value: "Medium", label: "Medium (50-149 kVA)", minKva: 50, maxKva: 149 },
  { value: "Large", label: "Large (150-299 kVA)", minKva: 150, maxKva: 299 },
  { value: "Industrial", label: "Industrial (300+ kVA)", minKva: 300, maxKva: null },
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function pbFetch(token, endpoint, options = {}) {
  const res = await fetch(`${PB_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${options.method || "GET"} ${endpoint} -> ${res.status}: ${body}`);
  }
  return res.status === 204 ? null : res.json();
}

async function authenticate() {
  const data = await pbFetch(null, "/api/collections/_superusers/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  return data.token;
}

async function fetchAllRecords(token, collection) {
  const all = [];
  let page = 1;
  const perPage = 200;
  while (true) {
    const data = await pbFetch(
      token,
      `/api/collections/${collection}/records?page=${page}&perPage=${perPage}`
    );
    all.push(...data.items);
    if (data.items.length < perPage) break;
    page += 1;
  }
  return all;
}

async function upsertBrands(token, generators) {
  const existing = await fetchAllRecords(token, "brands");
  const byName = new Map(existing.map((b) => [b.name, b]));

  const usedBrands = new Set(generators.map((g) => g.brand));
  for (const brand of usedBrands) {
    if (!BRAND_ORDER.includes(brand)) {
      throw new Error(`Generator data references unknown brand "${brand}" — add it to BRAND_ORDER first.`);
    }
  }

  let created = 0;
  for (let i = 0; i < BRAND_ORDER.length; i++) {
    const name = BRAND_ORDER[i];
    if (!usedBrands.has(name) || byName.has(name)) continue;
    const record = await pbFetch(token, "/api/collections/brands/records", {
      method: "POST",
      body: JSON.stringify({
        name,
        slug: slugify(name),
        sortOrder: i,
      }),
    });
    byName.set(name, record);
    created += 1;
  }

  console.log(`Brands: ${created} created, ${byName.size - created} already existed.`);
  return byName;
}

async function upsertPowerBands(token) {
  const existing = await fetchAllRecords(token, "power_bands");
  const byValue = new Map(existing.map((b) => [b.value, b]));

  let created = 0;
  for (let i = 0; i < POWER_BAND_DEFS.length; i++) {
    const def = POWER_BAND_DEFS[i];
    if (byValue.has(def.value)) continue;
    const payload = { value: def.value, label: def.label, minKva: def.minKva, sortOrder: i };
    if (def.maxKva !== null) payload.maxKva = def.maxKva;
    const record = await pbFetch(token, "/api/collections/power_bands/records", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    byValue.set(def.value, record);
    created += 1;
  }

  console.log(`Power bands: ${created} created, ${byValue.size - created} already existed.`);
  return byValue;
}

function cleanPayload(payload) {
  const out = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue;
    out[key] = value;
  }
  return out;
}

async function upsertProducts(token, generators, brandsByName, powerBandsByValue) {
  const existing = await fetchAllRecords(token, "products");
  const byKey = new Map(existing.map((p) => [`${p.brand}::${p.model}`, p]));

  let created = 0;
  let updated = 0;

  for (let i = 0; i < generators.length; i++) {
    const g = generators[i];
    const brand = brandsByName.get(g.brand);
    const powerBand = powerBandsByValue.get(g.kvaBand);
    if (!brand) throw new Error(`No brand record for "${g.brand}" (model ${g.model})`);
    if (!powerBand) throw new Error(`No power band record for "${g.kvaBand}" (model ${g.model})`);

    const payload = cleanPayload({
      brand: brand.id,
      model: g.model,
      powerBand: powerBand.id,
      standbyKva: g.standbyKva,
      primeKva: g.primeKva,
      engineModel: g.engineModel,
      alternator: g.alternator,
      fuelTank: g.fuelTank === null ? null : String(g.fuelTank),
      weightKg: g.weightKg,
      specs: g.specs ?? {},
      notes: g.notes,
      isActive: true,
      sortOrder: i,
    });

    const key = `${brand.id}::${g.model}`;
    const existingRecord = byKey.get(key);
    if (existingRecord) {
      await pbFetch(token, `/api/collections/products/records/${existingRecord.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      updated += 1;
    } else {
      await pbFetch(token, "/api/collections/products/records", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      created += 1;
    }
  }

  console.log(`Products: ${created} created, ${updated} updated (${generators.length} total in source).`);
}

async function main() {
  const generatorsPath = path.join(__dirname, "..", "data", "generators.json");
  const generators = JSON.parse(readFileSync(generatorsPath, "utf-8"));

  console.log(`Loaded ${generators.length} generators from data/generators.json`);
  console.log(`Authenticating against ${PB_URL} ...`);
  const token = await authenticate();

  const brandsByName = await upsertBrands(token, generators);
  const powerBandsByValue = await upsertPowerBands(token);
  await upsertProducts(token, generators, brandsByName, powerBandsByValue);

  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
