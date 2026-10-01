import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Cog,
  Gauge,
  Handshake,
  MapPin,
  RefreshCw,
  Repeat,
  Tag,
  Workflow,
  Wrench,
} from "lucide-react";
import { Reveal } from "cube-motion/react";
import { getFeaturedClients, getPublicGenerators, getHomeSections } from "@/lib/public-data";
import ProductCard from "@/components/product-card";
import NewProductsCarousel from "@/components/new-products-carousel";
import InfiniteLogoSlider from "@/components/infinite-logo-slider";
import HomeHero from "@/components/home-hero";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Generator Sell, Rental & Service in Bangladesh | Power Bank Bangladesh",
    description:
      "Diesel generator dealer in Dhaka and Chattogram. Sell, exchange, rental, service and spare parts for Perkins, Cummins, Ricardo and all major brands. Get a quotation on WhatsApp.",
    path: "/",
  }),
  title: { absolute: "Generator Sell, Rental & Service in Bangladesh | Power Bank Bangladesh" },
};

// Logo marquee covers every brand PBB services, not just the ones listed
// on /products (brands with "Show on website" on in the dashboard).
const BRAND_LOGOS: { name: string; file: string }[] = [
  "John Deere",
  "Cummins",
  "Ricardo",
  "Perkins",
  "Volvo Penta",
  "Deutz",
  "Doosan",
].map((brand) => ({ name: brand, file: brand }));

const WHY_US = [
  {
    icon: Award,
    title: "All Major Brands",
    description:
      "One supplier for every major brand: John Deere, Cummins, Ricardo, Perkins, Volvo Penta, Deutz, Caterpillar, and Doosan.",
  },
  {
    icon: Gauge,
    title: "Full Power Range",
    description:
      "Never outgrow your supplier: 98+ models from small standby units up to 1500 kVA heavy industrial generators.",
  },
  {
    icon: MapPin,
    title: "Two Locations",
    description:
      "Local sales and service whether you're based in Dhaka or Chattogram.",
  },
  {
    icon: Workflow,
    title: "Full Lifecycle, One Partner",
    description:
      "No need to juggle multiple vendors: we sell, exchange, rent, and service every unit ourselves.",
  },
];

const SERVICES = [
  {
    icon: Tag,
    title: "Sell",
    description:
      "New and reconditioned diesel generators across all major brands, matched to your load and budget.",
  },
  {
    icon: Handshake,
    title: "Exchange",
    description:
      "Existing generator assessed and exchanged toward another unit, subject to inspection and valuation.",
  },
  {
    icon: Repeat,
    title: "Rental",
    description:
      "Short- and long-term generator rental for events, construction sites, and standby backup power.",
  },
  {
    icon: Wrench,
    title: "Service",
    description:
      "Routine maintenance, repair, and genuine parts support to keep your generator running reliably.",
  },
  {
    icon: Cog,
    title: "Spare Parts",
    description:
      "Genuine spare parts across all major brands, sourced and supplied to keep your generator running.",
  },
];

export const revalidate = 300;

export default async function Home() {
  const [generators, clients] = await Promise.all([getPublicGenerators(), getFeaturedClients()]);
  const { featuredModels, newProducts } = await getHomeSections(generators);

  return (
    <div className="flex flex-1 flex-col">
      <HomeHero />

      {/* Brand strip (Infinite Carousel Slider) */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <InfiniteLogoSlider
            speed={28}
            items={BRAND_LOGOS.map((brand) => (
              <img
                key={brand.name}
                src={`/brands/${brand.file}.png`}
                alt={brand.name}
                className="h-10 w-auto shrink-0 object-contain opacity-85 transition-opacity hover:opacity-100 sm:h-12"
              />
            ))}
          />
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-ink-900">
              One Partner for Every Generator Need
            </h2>
          </div>
          <Reveal
            as="div"
            targets="children"
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {WHY_US.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="inline-flex items-center justify-center rounded-xl bg-brand-50 p-3">
                  <Icon className="size-6 text-brand-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">
                  {description}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* New products */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-ink-900">
                New Products
              </h2>
              <p className="mt-3 text-ink-500">
                Two models from each brand, ready to browse: scroll through
                or view the full catalog.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View All Models
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <NewProductsCarousel models={newProducts} />
        </div>
      </section>

      {/* Featured models */}
      <section className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-ink-900">
                Featured Models
              </h2>
              <p className="mt-3 text-ink-500">
                A sample from each brand. The full catalog has 98+ models to
                compare by brand and power output.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View All Models
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <Reveal
            as="div"
            targets="children"
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {featuredModels.map((model) => (
              <ProductCard key={`${model.brand}-${model.model}`} model={model} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-ink-900">
              Our Services
            </h2>
            <p className="mt-3 text-ink-500">
              From first purchase to years of upkeep, one team handles it
              all.
            </p>
          </div>
          <Reveal
            as="div"
            targets="children"
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {SERVICES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="inline-flex items-center justify-center rounded-xl bg-brand-50 p-3">
                  <Icon className="size-6 text-brand-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-500">
                  {description}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Our Clients (Infinite Carousel Slider) */}
      {clients.length > 0 && (
        <section className="border-t border-ink-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-center text-xl font-bold uppercase tracking-wider text-ink-400 sm:text-2xl">
              Our Clients
            </p>
            <div className="mt-10">
              <InfiniteLogoSlider
                speed={32}
                items={clients.map((client) =>
                  client.logoUrl ? (
                    <img
                      key={`client-${client.name}`}
                      src={client.logoUrl}
                      alt={client.name}
                      className="h-10 w-auto shrink-0 object-contain opacity-80 transition-opacity hover:opacity-100 sm:h-12"
                    />
                  ) : (
                    <span
                      key={`client-${client.name}`}
                      className="shrink-0 whitespace-nowrap text-lg font-semibold text-ink-600 opacity-80 hover:opacity-100 sm:text-xl"
                    >
                      {client.name}
                    </span>
                  )
                )}
              />
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-ink-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
          <RefreshCw className="size-8 text-brand-400" />
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Need a Generator Solution?
          </h2>
          <p className="max-w-xl text-ink-300">
            Browse our full catalog of 98+ models, or reach out directly and
            our team will help you find the right fit. No contact form, just
            a call or email straight to us.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              View Products
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-brand-400 hover:text-brand-400"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
