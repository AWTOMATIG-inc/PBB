// Admin data layer for the `products` / `brands` / `power_bands` PocketBase
// collections. Talks to PocketBase's REST API directly with the superuser
// token from the admin session cookie (same no-SDK convention as lib/pocketbase.ts
// and scripts/migrate-products.mjs).

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

// Separate from POCKETBASE_URL: that one is server-to-server only (e.g.
// http://127.0.0.1:8091 on the VPS) and unreachable from a visitor's
// browser. File URLs end up in <img src>, so they need a publicly
// reachable base — proxied through Nginx in production, same host as
// POCKETBASE_URL in local dev where the browser and PocketBase share a
// machine.
const PB_FILES_URL =
  process.env.NEXT_PUBLIC_PB_FILES_URL || `${POCKETBASE_URL}/api/files`;

export type BrandRecord = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  sortOrder: number;
};

export type PowerBandRecord = {
  id: string;
  value: string;
  label: string;
  minKva: number;
  maxKva?: number;
  sortOrder: number;
};

export type ProductRecord = {
  id: string;
  brand: string;
  model: string;
  powerBand: string;
  standbyKva: number | null;
  primeKva: number | null;
  engineModel: string;
  alternator: string;
  // Relation ids; absent until migration 1789554847 has run on this instance.
  alternatorMake?: string;
  controller?: string;
  fuelTank: string;
  weightKg: number | null;
  specs: Record<string, string | number | null>;
  notes: string;
  image: string;
  isActive: boolean;
  // Optional pricing (PBB-09/10). Unset price comes back as 0, unset
  // currency as "" (treated as BDT).
  price: number;
  currency: "" | "BDT" | "USD";
  showPrice: boolean;
  // Legacy manual ordering from the original catalog import — no longer
  // editable in the admin (see ProductSort), kept only as a tie-breaker for
  // records that predate the `created` field below.
  sortOrder: number;
  // Empty string for records created before this field was added (PocketBase
  // doesn't backfill autodate fields), which sorts before any real timestamp.
  created: string;
  expand?: {
    brand?: BrandRecord;
    powerBand?: PowerBandRecord;
  };
};

/**
 * Admin product list ordering. Single source of truth for what each option
 * means, mapped to a PocketBase `sort` query string — change the mapping
 * here if the desired ordering ever needs to change, nowhere else.
 */
export type ProductSort = "newest" | "oldest" | "model" | "brand";

const PRODUCT_SORT_MAP: Record<ProductSort, string> = {
  newest: "-created,sortOrder,model",
  oldest: "created,sortOrder,model",
  model: "model,brand.name",
  brand: "brand.name,model",
};

function pbAuthedFetch(token: string, path: string, init: RequestInit = {}) {
  return fetch(`${POCKETBASE_URL}${path}`, {
    ...init,
    headers: { Authorization: token, ...init.headers },
    cache: "no-store",
  });
}

export function productImageUrl(product: Pick<ProductRecord, "id" | "image">) {
  if (!product.image) return null;
  return `${PB_FILES_URL}/products/${product.id}/${product.image}`;
}

export function brandLogoUrl(brand: Pick<BrandRecord, "id" | "logo">) {
  if (!brand.logo) return null;
  return `${PB_FILES_URL}/brands/${brand.id}/${brand.logo}`;
}

export async function listBrands(token: string): Promise<BrandRecord[]> {
  const res = await pbAuthedFetch(
    token,
    "/api/collections/brands/records?perPage=200&sort=sortOrder"
  );
  if (!res.ok) throw new Error("Failed to load brands");
  return (await res.json()).items;
}

export async function listPowerBands(token: string): Promise<PowerBandRecord[]> {
  const res = await pbAuthedFetch(
    token,
    "/api/collections/power_bands/records?perPage=200&sort=sortOrder"
  );
  if (!res.ok) throw new Error("Failed to load power bands");
  return (await res.json()).items;
}

export async function listProducts(
  token: string,
  {
    page = 1,
    perPage = 20,
    search = "",
    sort = "newest",
  }: { page?: number; perPage?: number; search?: string; sort?: ProductSort } = {}
): Promise<{ items: ProductRecord[]; totalPages: number; totalItems: number; page: number }> {
  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    sort: PRODUCT_SORT_MAP[sort],
    expand: "brand,powerBand",
  });
  const q = search.trim();
  if (q) {
    const safe = q.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    params.set("filter", `model ~ "${safe}"`);
  }

  const res = await pbAuthedFetch(token, `/api/collections/products/records?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load products");
  const data = await res.json();
  return { items: data.items, totalPages: data.totalPages, totalItems: data.totalItems, page: data.page };
}

export async function getProduct(token: string, id: string): Promise<ProductRecord | null> {
  const res = await pbAuthedFetch(
    token,
    `/api/collections/products/records/${id}?expand=brand,powerBand`
  );
  if (!res.ok) return null;
  return res.json();
}

export function createProduct(token: string, body: FormData) {
  return pbAuthedFetch(token, "/api/collections/products/records", { method: "POST", body });
}

export function updateProduct(token: string, id: string, body: FormData) {
  return pbAuthedFetch(token, `/api/collections/products/records/${id}`, { method: "PATCH", body });
}

export function deleteProduct(token: string, id: string) {
  return pbAuthedFetch(token, `/api/collections/products/records/${id}`, { method: "DELETE" });
}

export function createBrand(token: string, body: FormData) {
  return pbAuthedFetch(token, "/api/collections/brands/records", { method: "POST", body });
}

export function updateBrand(token: string, id: string, body: FormData) {
  return pbAuthedFetch(token, `/api/collections/brands/records/${id}`, { method: "PATCH", body });
}

export function deleteBrand(token: string, id: string) {
  return pbAuthedFetch(token, `/api/collections/brands/records/${id}`, { method: "DELETE" });
}

export function createPowerBand(token: string, body: FormData) {
  return pbAuthedFetch(token, "/api/collections/power_bands/records", { method: "POST", body });
}

export function updatePowerBand(token: string, id: string, body: FormData) {
  return pbAuthedFetch(token, `/api/collections/power_bands/records/${id}`, {
    method: "PATCH",
    body,
  });
}

export function deletePowerBand(token: string, id: string) {
  return pbAuthedFetch(token, `/api/collections/power_bands/records/${id}`, { method: "DELETE" });
}

// PBB-03a: approved clients for Home's "Our Clients" marquee.
export type ClientRecord = {
  id: string;
  name: string;
  logo: string;
  sortOrder: number;
  featured: boolean;
  isActive: boolean;
};

export function clientLogoUrl(client: Pick<ClientRecord, "id" | "logo">) {
  if (!client.logo) return null;
  return `${PB_FILES_URL}/clients/${client.id}/${client.logo}`;
}

export async function listClients(token: string): Promise<ClientRecord[]> {
  const res = await pbAuthedFetch(
    token,
    "/api/collections/clients/records?perPage=200&sort=sortOrder,name"
  );
  if (!res.ok) throw new Error("Failed to load clients");
  return (await res.json()).items;
}

export function createClient(token: string, body: FormData) {
  return pbAuthedFetch(token, "/api/collections/clients/records", { method: "POST", body });
}

export function updateClient(token: string, id: string, body: FormData) {
  return pbAuthedFetch(token, `/api/collections/clients/records/${id}`, { method: "PATCH", body });
}

export function deleteClient(token: string, id: string) {
  return pbAuthedFetch(token, `/api/collections/clients/records/${id}`, { method: "DELETE" });
}

// Name-only option lists managed on /admin/filters and linked from products.
export type OptionListRecord = { id: string; name: string };

export const OPTION_LISTS = {
  alternator_makes: { productField: "alternatorMake", label: "alternator make" },
  controllers: { productField: "controller", label: "controller" },
} as const;

export type OptionList = keyof typeof OPTION_LISTS;

export async function listOptions(token: string, list: OptionList): Promise<OptionListRecord[]> {
  const res = await pbAuthedFetch(token, `/api/collections/${list}/records?perPage=200&sort=name`);
  if (!res.ok) throw new Error(`Failed to load ${OPTION_LISTS[list].label}s`);
  return (await res.json()).items;
}

export function createOption(token: string, list: OptionList, body: FormData) {
  return pbAuthedFetch(token, `/api/collections/${list}/records`, { method: "POST", body });
}

export function updateOption(token: string, list: OptionList, id: string, body: FormData) {
  return pbAuthedFetch(token, `/api/collections/${list}/records/${id}`, { method: "PATCH", body });
}

export function deleteOption(token: string, list: OptionList, id: string) {
  return pbAuthedFetch(token, `/api/collections/${list}/records/${id}`, { method: "DELETE" });
}

/** Product count per option id, for every option list, in one request. */
export async function getOptionUsage(token: string): Promise<Record<OptionList, Record<string, number>>> {
  const fields = Object.values(OPTION_LISTS).map((l) => l.productField);
  const res = await pbAuthedFetch(
    token,
    `/api/collections/products/records?perPage=1000&fields=${fields.join(",")}`
  );
  if (!res.ok) throw new Error("Failed to load product usage");
  const items: Record<string, string | undefined>[] = (await res.json()).items;

  const usage = {} as Record<OptionList, Record<string, number>>;
  for (const [list, { productField }] of Object.entries(OPTION_LISTS)) {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const id = item[productField];
      if (id) counts[id] = (counts[id] ?? 0) + 1;
    }
    usage[list as OptionList] = counts;
  }
  return usage;
}

/**
 * PocketBase silently clears an optional relation when its target is deleted,
 * so deletes are guarded by this count instead of relying on the database.
 */
export async function countProductsUsingOption(
  token: string,
  list: OptionList,
  id: string
): Promise<number> {
  const params = new URLSearchParams({
    perPage: "1",
    fields: "id",
    filter: `${OPTION_LISTS[list].productField} = "${id.replace(/[^a-z0-9]/gi, "")}"`,
  });
  const res = await pbAuthedFetch(token, `/api/collections/products/records?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to check which products use this option");
  return (await res.json()).totalItems;
}

export type HomeSection = "new_products" | "featured_models";

export type HomePlacementRecord = {
  id: string;
  section: HomeSection;
  product: string;
  sortOrder: number;
};

export async function listHomePlacements(token: string): Promise<HomePlacementRecord[]> {
  const res = await pbAuthedFetch(
    token,
    "/api/collections/home_placements/records?perPage=200&sort=section,sortOrder"
  );
  if (!res.ok) throw new Error("Failed to load home placements");
  return (await res.json()).items;
}

export function createHomePlacement(token: string, body: FormData) {
  return pbAuthedFetch(token, "/api/collections/home_placements/records", {
    method: "POST",
    body,
  });
}

export function updateHomePlacement(token: string, id: string, body: FormData) {
  return pbAuthedFetch(token, `/api/collections/home_placements/records/${id}`, {
    method: "PATCH",
    body,
  });
}

export function deleteHomePlacement(token: string, id: string) {
  return pbAuthedFetch(token, `/api/collections/home_placements/records/${id}`, {
    method: "DELETE",
  });
}
