import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const PHONES = [
  "+88 (0) 1989 474 447",
  "+88 (0) 1625 181 403",
  "+88 (0) 1515 675401",
];

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-ink-50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-white">
              Power Bank Bangladesh
            </p>
            <p className="mt-2 text-sm font-medium text-brand-400">
              You Believe, We Assure Trust
            </p>
            <p className="mt-4 text-sm text-ink-300">
              All kinds of Generator — Sell, Buy, Rental &amp; Service.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ink-300">
              Quick Links
            </p>
            <nav className="mt-4 flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-100 transition-colors hover:text-brand-400"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ink-300">
              Contact
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {PHONES.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phone.replace(/[^+\d]/g, "")}`}
                  className="flex items-center gap-2 text-sm text-ink-100 transition-colors hover:text-brand-400"
                >
                  <Phone className="size-4 shrink-0 text-brand-400" />
                  {phone}
                </a>
              ))}
              <a
                href="mailto:powerbankbd23@gmail.com"
                className="flex items-center gap-2 text-sm text-ink-100 transition-colors hover:text-brand-400"
              >
                <Mail className="size-4 shrink-0 text-brand-400" />
                powerbankbd23@gmail.com
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-ink-300">
              Locations
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <p className="text-sm text-ink-100">
                  Kamalapur, Biruliya, Savar, Dhaka
                </p>
              </div>
              <div className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-400" />
                <p className="text-sm text-ink-100">
                  Shop: 8, Subashati Chawk Arcade, 174/A, Nawab Siraj Ud
                  Daulah Road, Chawkbazar, Chattagram
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-ink-800 pt-6 text-center text-xs text-ink-400">
          © {year} Power Bank Bangladesh. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
