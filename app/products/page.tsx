import type { Metadata } from "next";
import ProductsBrowser from "@/components/products-browser";
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
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Generator Models
          </h1>
          <p className="mt-4 max-w-2xl text-ink-500">
            Every generator we sell, rent, and service — filter by brand or
            power band to compare specs. For pricing and availability,
            contact us directly.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductsBrowser generators={generators} />
      </section>
    </div>
  );
}
