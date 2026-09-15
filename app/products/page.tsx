import type { Metadata } from "next";
import ProductsBrowser from "@/components/products-browser";
import BrandCarousel from "@/components/brand-carousel";
import { generators } from "@/data/generators";

export const metadata: Metadata = {
  title: "Generator Models | Power Bank Bangladesh",
  description:
    "Browse 98+ diesel generator models from John Deere, Cummins, Ricardo, Perkins, Volvo Penta, and Deutz. Filter by brand and power output to find the right fit.",
};

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
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
