import type { Metadata } from "next";
import ProductsBrowser from "@/components/products-browser";
import BrandCarousel from "@/components/brand-carousel";
import { getPublicGenerators } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Generator Models | Power Bank Bangladesh",
  description:
    "Browse 98+ diesel generator models from John Deere, Cummins, Ricardo, Perkins, Volvo Penta, and Deutz. Filter by brand and power output to find the right fit.",
};

export const revalidate = 300;

export default async function ProductsPage() {
  const generators = await getPublicGenerators();

  return (
    <div className="flex flex-1 flex-col bg-white">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Generator Models
          </h1>
          <p className="mt-3 max-w-2xl text-ink-500">
            98+ diesel generators across eight major brands. Filter by brand,
            power band, alternator, controller or price to find the right fit.
          </p>
        </div>
      </section>

      <section className="border-b border-ink-100">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <BrandCarousel />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductsBrowser generators={generators} />
      </section>
    </div>
  );
}
