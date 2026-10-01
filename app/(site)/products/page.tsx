import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ProductsBrowser from "@/components/products-browser";
import BrandCarousel from "@/components/brand-carousel";
import { getPublicBrands, getPublicGenerators } from "@/lib/public-data";

export const metadata: Metadata = pageMetadata({
  title: "Diesel Generator Price in Bangladesh",
  description:
    "Browse Perkins, Cummins and Ricardo diesel generators in Bangladesh by brand and kVA rating. See prices or request a quotation on WhatsApp.",
  path: "/products",
});

export const revalidate = 300;

export default async function ProductsPage() {
  const [generators, brands] = await Promise.all([getPublicGenerators(), getPublicBrands()]);
  // Carousel slides are hand-made images; brands added later without one
  // are left out of the carousel but still listed below.
  const slides = brands
    .map((brand) => ({ brand, image: `/carousel/${brand.toLowerCase().replace(/\s+/g, "-")}.webp` }))
    .filter((slide) => existsSync(path.join(process.cwd(), "public", slide.image)));

  return (
    <div className="flex flex-1 flex-col bg-white">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Generator Models
          </h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            Diesel generators from Perkins, Cummins and Ricardo. Filter by brand,
            power band, alternator, controller or price to find the right fit.
          </p>
        </div>
      </section>

      {slides.length > 0 && (
        <section className="border-b border-ink-100">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <BrandCarousel slides={slides} />
          </div>
        </section>
      )}

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductsBrowser generators={generators} brands={brands} />
      </section>
    </div>
  );
}
