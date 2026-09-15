import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Power Bank Bangladesh",
  description:
    "Reach Power Bank Bangladesh directly: phone, email, and our Dhaka and Chattogram locations. No forms, just a direct line to our team.",
};

const PHONES = [
  "+88 (0) 1989 474 447",
  "+88 (0) 1625 181 403",
  "+88 (0) 1515 675401",
];

const LOCATIONS = [
  {
    city: "Dhaka",
    address: "Kamalapur, Biruliya, Savar, Dhaka",
  },
  {
    city: "Chattogram",
    address:
      "Shop: 8, Subashati Chawk Arcade, 174/A, Nawab Siraj Ud Daulah Road, Chawkbazar, Chattagram",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header + quick contact */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <h1 className="text-5xl font-bold tracking-tight text-ink-900 sm:text-6xl lg:text-7xl">
                Get in touch
              </h1>
              <p className="mt-6 max-w-prose text-lg leading-8 text-ink-500">
                Call or email us directly, and our team will help you find
                the right generator, schedule a service visit, or answer a
                question. No contact form, no waiting on a callback.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="flex flex-col gap-6 border-t border-ink-200 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                <div>
                  <h2 className="text-sm font-semibold text-ink-900">
                    Call
                  </h2>
                  <div className="mt-3 flex flex-col gap-2">
                    {PHONES.map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                        className="flex items-center gap-2.5 text-base font-medium text-ink-700 transition-colors hover:text-brand-600"
                      >
                        <Phone className="size-4 shrink-0 text-brand-500" />
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-ink-900">
                    Email
                  </h2>
                  <a
                    href="mailto:powerbankbd23@gmail.com"
                    className="mt-3 flex items-center gap-2.5 text-base font-medium text-ink-700 transition-colors hover:text-brand-600"
                  >
                    <Mail className="size-4 shrink-0 text-brand-500" />
                    powerbankbd23@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="bg-ink-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-ink-900">
            Our locations
          </h2>
          <p className="mt-3 max-w-2xl text-ink-500">
            Visit either of our two locations, serving Dhaka and Chattogram.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-6 lg:grid-cols-2">
            {LOCATIONS.map((location) => (
              <div key={`${location.city}-header`} className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-brand-500" />
                <div>
                  <h3 className="text-lg font-semibold text-ink-900">
                    {location.city}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-ink-500">
                    {location.address}
                  </p>
                </div>
              </div>
            ))}
            {LOCATIONS.map((location) => (
              <div
                key={`${location.city}-map`}
                className="overflow-hidden rounded-2xl border border-ink-200"
              >
                <iframe
                  title={`Map to Power Bank Bangladesh, ${location.city}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    location.address,
                  )}&output=embed`}
                  className="h-80 w-full sm:h-96"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
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
                Not sure which generator you need?
              </h2>
              <p className="mt-3 text-ink-300">
                Browse our full catalog by brand and power range, or call us
                directly and we will help you match the right model.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 lg:shrink-0"
            >
              View Products
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
