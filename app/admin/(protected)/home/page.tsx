import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSessionToken } from "@/lib/session";
import {
  listHomePlacements,
  listProducts,
  productImageUrl,
  type HomePlacementRecord,
} from "@/lib/products";
import { HOME_SECTION_LIMITS } from "@/lib/home-section-limits";
import HomePlacementManager from "@/components/admin/home-placement-manager";

export const metadata: Metadata = {
  title: "Home Page | Admin | Power Bank Bangladesh",
};

const bySortOrder = (a: HomePlacementRecord, b: HomePlacementRecord) => a.sortOrder - b.sortOrder;

export default async function AdminHomePage() {
  const token = await getAdminSessionToken();
  if (!token) redirect("/admin/login");

  const [placements, productsResult] = await Promise.all([
    listHomePlacements(token),
    listProducts(token, { perPage: 200 }),
  ]);

  const products = productsResult.items;
  const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
  const imageUrls = Object.fromEntries(products.map((p) => [p.id, productImageUrl(p)]));

  const activeSorted = products
    .filter((p) => p.isActive)
    .sort((a, b) => {
      const brandOrder = (a.expand?.brand?.sortOrder ?? 0) - (b.expand?.brand?.sortOrder ?? 0);
      return brandOrder !== 0 ? brandOrder : a.model.localeCompare(b.model);
    });

  const newProducts = placements.filter((p) => p.section === "new_products").sort(bySortOrder);
  const featuredModels = placements
    .filter((p) => p.section === "featured_models")
    .sort(bySortOrder);

  const placedProductIds = (list: HomePlacementRecord[]) => new Set(list.map((p) => p.product));
  const availableForNew = activeSorted.filter((p) => !placedProductIds(newProducts).has(p.id));
  const availableForFeatured = activeSorted.filter(
    (p) => !placedProductIds(featuredModels).has(p.id)
  );

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Home Page</h1>
        <p className="mt-1 text-sm text-ink-500">
          Choose and order which products appear in the Home page&apos;s New Products carousel
          and Featured Models section.
        </p>
      </div>

      <HomePlacementManager
        section="new_products"
        title="New Products"
        description={`Shown in the scrolling carousel on the Home page. Max ${HOME_SECTION_LIMITS.new_products} products.`}
        placements={newProducts}
        productsById={productsById}
        availableProducts={availableForNew}
        imageUrls={imageUrls}
      />

      <HomePlacementManager
        section="featured_models"
        title="Featured Models"
        description={`Shown as a static grid on the Home page. Max ${HOME_SECTION_LIMITS.featured_models} models.`}
        placements={featuredModels}
        productsById={productsById}
        availableProducts={availableForFeatured}
        imageUrls={imageUrls}
      />
    </div>
  );
}
