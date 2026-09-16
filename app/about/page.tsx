import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Cog,
  Handshake,
  MapPin,
  Phone,
  Repeat,
  Tag,
  Wrench,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Power Bank Bangladesh",
  description:
    "Power Bank Bangladesh is a diesel generator dealer serving Dhaka and Chattogram: sell, buy, rental and service across every major generator brand.",
};

const ALL_BRANDS = [
  "John Deere",
  "Cummins Power Generation",
  "Ricardo",
  "Perkins",
  "Volvo Penta",
  "Deutz",
  "Caterpillar",
  "Doosan",
];

const SERVICES = [
  {
    icon: Tag,
    title: "Sell",
    description:
      "We sell new and reconditioned diesel generators across every major brand we carry. Tell us your power requirement and site conditions, and we help you match a model by kVA output, fuel efficiency, and budget rather than pushing a one-size-fits-all unit.",
  },
  {
    icon: Handshake,
    title: "Buy",
    description:
      "Already have a generator you no longer need? We buy used units in working condition. Our team inspects the machine, gives a fair valuation based on its condition and hours run, and handles the transaction directly.",
  },
  {
    icon: Repeat,
    title: "Rental",
    description:
      "Need power for a fixed period rather than owning a unit outright? We rent generators for events, construction sites, factory shutdowns, and temporary or emergency standby power, with flexible short- and long-term terms.",
  },
  {
    icon: Wrench,
    title: "Service",
    description:
      "Generators need regular upkeep to stay reliable. We provide routine maintenance, diagnostics, and repair using genuine parts across the brands we support, whether the unit was bought new, rented, or already owned before coming to us.",
  },
  {
    icon: Cog,
    title: "Spare Parts",
    description:
      "Beyond full service visits, we stock and supply genuine spare parts across all major brands, for customers who service their own equipment or need a specific part quickly rather than scheduling a full service call.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header / company story */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <h1 className="text-5xl font-bold tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">
                Power Bank Bangladesh
              </h1>
              <p className="mt-4 text-lg font-medium italic text-brand-600">
                You Believe, We Assure Trust
              </p>

              <div className="mt-8 max-w-prose space-y-5 text-lg leading-8 text-ink-500">
                <p>
                  From compact standby units to industrial installations
                  above 300 kVA, Power Bank Bangladesh covers the complete
                  lifecycle of generator ownership: sell, buy, rental, and
                  service, for homes, businesses, and industrial sites across
                  Bangladesh.
                </p>
                <p>
                  &ldquo;Bringing Energy to Your Doorstep&rdquo; is more than
                  a tagline. With locations serving both Dhaka and
                  Chattogram, and one team handling a generator from purchase
                  through years of servicing, you&apos;re not left
                  coordinating between a seller, a mechanic, and a parts
                  supplier separately.
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {ALL_BRANDS.map((brand) => (
                  <span
                    key={brand}
                    className="rounded-full border border-ink-200 px-4 py-1.5 text-sm font-medium text-ink-700"
                  >
                    {brand}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 text-sm text-ink-500 sm:flex-row sm:items-center sm:gap-8">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-brand-500" />
                  Dhaka &amp; Chattogram
                </div>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-brand-700"
                >
                  Full location details &amp; contact info
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src="/generator.png"
                  alt="Power Bank Bangladesh diesel generator"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services, explained in depth */}
      <section className="bg-ink-50">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900">
            What We Do
          </h2>
          <p className="mt-3 max-w-2xl text-ink-500">
            Five ways we work with customers, from a first purchase through
            years of ongoing upkeep.
          </p>

          <div className="mt-12 divide-y divide-ink-200 border-t border-ink-200">
            {SERVICES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col gap-3 py-8 sm:flex-row sm:gap-10"
              >
                <div className="sm:w-52 sm:shrink-0">
                  <Icon className="size-6 text-brand-500" />
                  <h3 className="mt-3 text-xl font-bold text-ink-900">
                    {title}
                  </h3>
                </div>
                <p className="leading-7 text-ink-500 sm:flex-1">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-ink-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to work with us?
              </h2>
              <p className="mt-3 text-ink-300">
                Tell us your power requirement and site conditions, and
                we&apos;ll match you to a model. No contact form, just a call
                or email straight to our team.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row lg:shrink-0">
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
                <Phone className="size-4" />
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
