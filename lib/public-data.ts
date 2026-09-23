// Public (unauthenticated) data layer for the live site's Products/Home
// pages. Reads the same PocketBase collections as lib/products.ts (admin)
// but without a superuser token: brands/power_bands/products/home_placements
// all have public listRule/viewRule (see pocketbase/pb_migrations). Uses
// Next.js's fetch-level ISR caching instead of lib/products.ts's
// `cache: "no-store"` — admin always wants fresh data, public pages can be
// a few minutes stale so PocketBase is only hit on revalidation, not per
// visitor (task 8's architecture decision, see memory.md).

import { BRANDS, type Brand, type GeneratorModel, type KvaBand } from "@/data/generators";
import { clientLogoUrl } from "@/lib/products";

const POCKETBASE_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const REVALIDATE_SECONDS = 300;

type PBProduct = {
  id: string;
  model: string;
  standbyKva: number;
  primeKva: number;
  engineModel: string;
  alternator: string;
  fuelTank: string;
  weightKg: number;
  specs: Record<string, string | number | null>;
  notes: string;
  isActive: boolean;
  // Absent until the pricing migration (1789554845) has run on this instance.
  price?: number;
  currency?: string;
  showPrice?: boolean;
  expand?: {
    brand?: { name: string };
    powerBand?: { value: string };
  };
};

function pbPublicFetch(path: string) {
  return fetch(`${POCKETBASE_URL}${path}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
}

/**
 * PocketBase stores unset number fields as 0, not null (confirmed against
 * live data: Ricardo's standbyKva/primeKva and several Cummins weightKg
 * come back as 0 where the source brochure had no value, since the admin
 * form omits empty numeric fields rather than sending null). ProductCard's
 * fallback to specs.ratedOutputKwKva depends on these being `null`, and no
 * real generator has a 0 kVA rating or 0 kg weight, so 0 is treated as
 * "unset" here.
 */
function zeroToNull(n: number): number | null {
  return n || null;
}

/**
 * Price is public only when an admin enabled "Show price" AND entered a
 * non-zero amount (unset numbers come back as 0, see zeroToNull). Anything
 * else hides the price block entirely and the card shows "Request Quotation".
 */
function toPublicPrice(p: PBProduct): GeneratorModel["price"] {
  if (!p.showPrice || !p.price) return undefined;
  return { amount: p.price, currency: p.currency || "BDT" };
}

function toGeneratorModel(p: PBProduct): GeneratorModel | null {
  const brand = p.expand?.brand?.name;
  const kvaBand = p.expand?.powerBand?.value;
  if (!brand || !kvaBand) return null;
  return {
    brand: brand as Brand,
    model: p.model,
    standbyKva: zeroToNull(p.standbyKva),
    primeKva: zeroToNull(p.primeKva),
    engineModel: p.engineModel || null,
    alternator: p.alternator || null,
    fuelTank: p.fuelTank || null,
    weightKg: zeroToNull(p.weightKg),
    kvaBand: kvaBand as KvaBand,
    specs: p.specs ?? {},
    notes: p.notes || undefined,
    price: toPublicPrice(p),
  };
}

export async function getPublicGenerators(): Promise<GeneratorModel[]> {
  const params = new URLSearchParams({
    perPage: "500",
    sort: "sortOrder,model",
    expand: "brand,powerBand",
    filter: "isActive = true",
  });
  const res = await pbPublicFetch(`/api/collections/products/records?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load products from PocketBase (${res.status})`);
  }
  const data = await res.json();
  return (data.items as PBProduct[])
    .map(toGeneratorModel)
    .filter((g): g is GeneratorModel => g !== null);
}

export type PublicClient = { name: string; logoUrl: string | null };

/**
 * Home's "Our Clients" marquee (PBB-03a). The collection's public listRule
 * already hides inactive clients; featured narrows it to the marquee set.
 * Returns [] instead of throwing when the collection is missing (clients
 * migration not applied yet), so Home still renders, just without the
 * section.
 */
export async function getFeaturedClients(): Promise<PublicClient[]> {
  const params = new URLSearchParams({
    perPage: "200",
    sort: "sortOrder,name",
    filter: "featured = true",
  });
  const res = await pbPublicFetch(`/api/collections/clients/records?${params.toString()}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items as { id: string; name: string; logo: string }[]).map((c) => ({
    name: c.name,
    logoUrl: clientLogoUrl(c),
  }));
}

export type HomeSection = "new_products" | "featured_models";

type PBHomePlacement = {
  section: HomeSection;
  expand?: { product?: PBProduct };
};

async function getHomePlacements(): Promise<Record<HomeSection, GeneratorModel[]>> {
  const params = new URLSearchParams({
    perPage: "200",
    sort: "section,sortOrder",
    expand: "product,product.brand,product.powerBand",
  });
  const res = await pbPublicFetch(
    `/api/collections/home_placements/records?${params.toString()}`
  );
  if (!res.ok) {
    throw new Error(`Failed to load home placements from PocketBase (${res.status})`);
  }
  const data = await res.json();
  const bySection: Record<HomeSection, GeneratorModel[]> = {
    new_products: [],
    featured_models: [],
  };
  for (const placement of data.items as PBHomePlacement[]) {
    const product = placement.expand?.product;
    if (!product || product.isActive === false) continue;
    const model = toGeneratorModel(product);
    if (model) bySection[placement.section].push(model);
  }
  return bySection;
}

/**
 * Home page's "New Products" / "Featured Models" sections. Prefers
 * admin-curated `home_placements` (task 13's admin/home CRUD); a section
 * with no curation yet falls back to the original "N per brand" selection
 * so the page never ships empty before someone visits /admin/home.
 */
export async function getHomeSections(
  generators: GeneratorModel[]
): Promise<{ featuredModels: GeneratorModel[]; newProducts: GeneratorModel[] }> {
  const placements = await getHomePlacements();

  const featuredModels =
    placements.featured_models.length > 0
      ? placements.featured_models
      : BRANDS.map((brand) => generators.find((g) => g.brand === brand)).filter(
          (g): g is GeneratorModel => Boolean(g)
        );

  const newProducts =
    placements.new_products.length > 0
      ? placements.new_products
      : BRANDS.flatMap((brand) => generators.filter((g) => g.brand === brand).slice(0, 2));

  return { featuredModels, newProducts };
}
