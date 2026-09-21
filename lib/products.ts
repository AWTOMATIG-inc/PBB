// Admin data layer for the `products` / `brands` / `power_bands` PocketBase
// collections. Talks to PocketBase's REST API directly with the superuser
// token from the admin session cookie (same no-SDK convention as lib/pocketbase.ts
// and scripts/migrate-products.mjs).

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

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
  fuelTank: string;
  weightKg: number | null;
  specs: Record<string, string | number | null>;
  notes: string;
  image: string;
  isActive: boolean;
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
  return `${POCKETBASE_URL}/api/files/products/${product.id}/${product.image}`;
}

export function brandLogoUrl(brand: Pick<BrandRecord, "id" | "logo">) {
  if (!brand.logo) return null;
  return `${POCKETBASE_URL}/api/files/brands/${brand.id}/${brand.logo}`;
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
