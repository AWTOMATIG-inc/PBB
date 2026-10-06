import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import ProductsBrowser from "@/components/products-browser";
import { Droplets, ShieldCheck, Snowflake, Truck } from "lucide-react";
import PromoCarousel from "@/components/promo-carousel";
import { getPublicBrands, getPublicGenerators } from "@/lib/public-data";

export const metadata: Metadata = pageMetadata({
  title: "Diesel Generator Price in Bangladesh",
  description:
    "Browse Perkins, Cummins and Ricardo diesel generators in Bangladesh by brand and kVA rating. See prices or request a quotation on WhatsApp.",
  path: "/products",
});

export const revalidate = 300;

const PROMO_SLIDES = [
  {
    image: "/assets/flyer-generator-night-site.webp",
    alt: "Open diesel generator at a night site: All kind of diesel generator, sell, rental and service",
  },
  {
    image: "/assets/banner-generator-service.webp",
    alt: "Technician beside a diesel generator: Service your generator, best service",
  },
  {
    image: "/assets/flyer-canopy-generators.webp",
    alt: "Row of canopied generators: Low maintenance, 24/7 support, home servicing anywhere in Bangladesh",
  },
];

// What the client hands over with every generator sale.
const INCLUDED = [
  { icon: Droplets, title: "Lube oil and filters", body: "Lube oil, lube oil filter (diesel filter) and air filter" },
  { icon: Snowflake, title: "Coolant liquid", body: "Supplied with the generator" },
  { icon: Truck, title: "Delivery and installation", body: "Delivered and installed at your site" },
  { icon: ShieldCheck, title: "1 year warranty", body: "Included with every purchase" },
];

export default async function ProductsPage() {
  const [generators, brands] = await Promise.all([getPublicGenerators(), getPublicBrands()]);

  return (
    <div className="flex flex-1 flex-col bg-white">
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pt-12 pb-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Generator Models
            </h1>
            <p className="mt-3 max-w-xl text-ink-500">
              Diesel generators from Perkins, Cummins and Ricardo. Filter by brand,
              power band, alternator, controller or price to find the right fit.
            </p>
          </div>

          <div className="rounded-xl border border-ink-100 bg-ink-50/60 p-5 sm:p-6">
            <h2 className="text-xs font-semibold tracking-wide text-brand-600 uppercase">
              With every generator
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {INCLUDED.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
                    <Icon className="size-4.5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">{title}</p>
                    <p className="mt-0.5 text-sm leading-5 text-ink-500">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-ink-100">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <PromoCarousel slides={PROMO_SLIDES} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProductsBrowser generators={generators} brands={brands} />
      </section>
    </div>
  );
}
