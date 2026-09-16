import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const PHONES = [
  "+88 (0) 1989 474 447",
  "+88 (0) 1625 181 403",
  "+88 (0) 1515 675401",
];

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/powerbankbangladesh",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M13.5 21v-7.5h2.5l.5-3h-3V8.5c0-.87.24-1.5 1.5-1.5H16.5V4.36c-.27-.036-1.2-.115-2.28-.115C11.99 4.25 10.5 5.6 10.5 8.2v2.3H8v3h2.5V21h3Z" />
      </svg>
    ),
  },
  {
    href: "https://www.instagram.com/powerbankbangladesh",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-4">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: "https://wa.me/8801989474447",
    label: "WhatsApp",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M12.02 3c-4.97 0-9 4.03-9 9 0 1.59.42 3.08 1.15 4.37L3 21l4.77-1.15A8.96 8.96 0 0 0 12.02 21c4.97 0 9-4.03 9-9s-4.03-9-9-9Zm5.2 12.73c-.22.62-1.28 1.17-1.77 1.22-.45.05-1.02.07-1.65-.1-.38-.11-.87-.28-1.5-.55-2.64-1.14-4.36-3.8-4.5-3.98-.13-.18-1.08-1.44-1.08-2.74 0-1.3.68-1.94.92-2.2.24-.26.53-.33.7-.33.18 0 .35 0 .5.01.16.01.38-.06.6.46.22.53.75 1.83.82 1.96.07.13.11.28.02.46-.09.18-.13.28-.26.43-.13.15-.27.34-.39.46-.13.13-.26.27-.11.53.15.26.67 1.1 1.43 1.79 1 .89 1.83 1.17 2.09 1.3.26.13.42.11.57-.07.15-.18.65-.76.83-1.02.18-.26.35-.22.6-.13.24.09 1.55.73 1.81.86.26.13.44.2.5.31.07.11.07.62-.15 1.24Z" />
      </svg>
    ),
  },
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
              All kinds of Generator: Sell, Buy, Rental &amp; Service.
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
                  Daulah Road, Chawkbazar, Chattogram
                </p>
              </div>
              <div className="flex items-center gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-8 items-center justify-center rounded-full bg-ink-800 text-ink-100 transition-colors hover:bg-brand-400 hover:text-ink-900"
                  >
                    {social.icon}
                  </a>
                ))}
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
