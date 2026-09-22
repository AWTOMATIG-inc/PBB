import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Cog,
  Gauge,
  Handshake,
  MapPin,
  Phone,
  RefreshCw,
  Repeat,
  Tag,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import { Reveal, Rise } from "cube-motion/react";
import { BRANDS } from "@/data/generators";
import { getPublicGenerators, getHomeSections } from "@/lib/public-data";
import ProductCard from "@/components/product-card";
import NewProductsCarousel from "@/components/new-products-carousel";

const BRAND_LOGOS: { name: string; file: string }[] = [
  ...BRANDS.map((brand) => ({ name: brand, file: brand })),
  { name: "Doosan", file: "Doosan" },
];

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
      "Never outgrow your supplier: 98+ models from small standby units to 300+ kVA industrial generators.",
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
      "No need to juggle multiple vendors: we sell, buy, rent, and service every unit ourselves.",
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
    title: "Buy",
    description:
      "We purchase used generators in working condition: fair valuation, straightforward process.",
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
  const generators = await getPublicGenerators();
  const { featuredModels, newProducts } = await getHomeSections(generators);

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Rise as="div" targets="children">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
                <Zap className="size-4" />
                Bringing Energy to Your Doorstep
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                You Believe,{" "}
                <span className="text-brand-500">We Assure Trust</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-500">
                From small standby units to industrial-scale power, we sell,
                buy, rent, and service every major generator brand out of
                Dhaka and Chattogram.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  Browse Generators
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:border-brand-300 hover:text-brand-600"
                >
                  <Phone className="size-4" />
                  Contact Us
                </Link>
              </div>
            </Rise>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-inset ring-ink-950/5">
              <Image
                src="/generator.png"
                alt="Power Bank Bangladesh generator"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-16 hover:[animation-play-state:paused]">
              {[...BRAND_LOGOS, ...BRAND_LOGOS].map((brand, index) => (
                <img
                  key={`${brand.name}-${index}`}
                  src={`/brands/${brand.file}.png`}
                  alt={brand.name}
                  className="h-10 w-auto shrink-0 object-contain sm:h-12"
                />
              ))}
            </div>
          </div>
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

      {/* Brand Partners: same BRAND_LOGOS marquee as "Brands We Carry" above. */}
      <section className="border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-center text-2xl font-semibold uppercase tracking-wide text-ink-400">
            Our Clients
          </p>
          <div className="mt-14 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-16 hover:[animation-play-state:paused]">
              {[...BRAND_LOGOS, ...BRAND_LOGOS].map((brand, index) => (
                <img
                  key={`partner-${brand.name}-${index}`}
                  src={`/brands/${brand.file}.png`}
                  alt={brand.name}
                  className="h-10 w-auto shrink-0 object-contain sm:h-12"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

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
