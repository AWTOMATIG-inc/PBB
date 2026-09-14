import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Factory,
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
import { BRANDS, generators } from "@/data/generators";

const BRAND_LOGOS: { name: string; file: string }[] = [
  ...BRANDS.map((brand) => ({ name: brand, file: brand })),
  { name: "Caterpillar (CAT)", file: "Caterpillar" },
  { name: "Doosan", file: "Doosan" },
];

const WHY_US = [
  {
    icon: Award,
    title: "All Major Brands",
    description:
      "John Deere, Cummins, Ricardo, Perkins, Volvo Penta, Deutz — plus Caterpillar and Doosan, all under one roof.",
  },
  {
    icon: Gauge,
    title: "Full Power Range",
    description:
      "98+ models spanning small standby units to 300+ kVA industrial generators.",
  },
  {
    icon: MapPin,
    title: "Two Locations",
    description: "Serving customers from both Dhaka and Chattogram.",
  },
  {
    icon: Workflow,
    title: "Full Lifecycle, One Partner",
    description:
      "Sell, buy, rental & service — no need to juggle multiple vendors.",
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
      "We purchase used generators in working condition — fair valuation, straightforward process.",
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
];

export default function Home() {
  const featuredModels = BRANDS.map((brand) =>
    generators.find((g) => g.brand === brand),
  ).filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
                <Zap className="size-4" />
                Bringing Energy to Your Doorstep
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                You Believe,{" "}
                <span className="text-brand-500">We Assure Trust</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-500">
                Power Bank Bangladesh is a trusted diesel generator dealer
                serving Dhaka and Chattogram — sell, buy, rental &amp; service
                across every major generator brand, from small standby units
                to industrial-scale power.
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
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/generator.png"
                alt="Power Bank Bangladesh generator"
                fill
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
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-ink-400">
            Brands We Carry
          </p>
          <div className="mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
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
              Why Power Bank Bangladesh
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
        </div>
      </section>

      {/* Featured models */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tight text-ink-900">
                Featured Models
              </h2>
              <p className="mt-3 text-ink-500">
                A sample from each brand — the full catalog has 98+ models to
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
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredModels.map((model) => (
              <div
                key={`${model.brand}-${model.model}`}
                className="rounded-2xl border border-ink-100 p-6 transition-colors hover:border-brand-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                      {model.brand}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-ink-900">
                      {model.model}
                    </h3>
                  </div>
                  <div className="rounded-xl bg-brand-50 p-2.5">
                    <Factory className="size-5 text-brand-500" />
                  </div>
                </div>
                <dl className="mt-4 flex flex-col gap-1.5 text-sm text-ink-500">
                  {model.standbyKva !== null && (
                    <div className="flex justify-between">
                      <dt>Standby Output</dt>
                      <dd className="font-medium text-ink-900">
                        {model.standbyKva} kVA
                      </dd>
                    </div>
                  )}
                  {model.engineModel && (
                    <div className="flex justify-between">
                      <dt>Engine</dt>
                      <dd className="font-medium text-ink-900">
                        {model.engineModel}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt>Power Band</dt>
                    <dd className="font-medium text-ink-900">
                      {model.kvaBand}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-ink-900">
              Our Services
            </h2>
            <p className="mt-3 text-ink-500">
              Whatever stage you&apos;re at with generator power, we handle
              it — start to finish.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
            our team will help you find the right fit.
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
