"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const PRIMARY_PHONE = "+88 (0) 1989 474 447";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center"
        >
          <Image
            src="/logo.png"
            alt="Power Bank Bangladesh"
            width={533}
            height={401}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-brand-600"
                    : "text-ink-700 hover:text-brand-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <a
          href={`tel:${PRIMARY_PHONE.replace(/[^+\d]/g, "")}`}
          className="hidden shrink-0 items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 md:inline-flex"
        >
          <Phone className="size-4" />
          Call Us
        </a>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="inline-flex items-center justify-center rounded-md p-2 text-ink-900 md:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-md px-3 py-2.5 text-base font-medium ${
                    active
                      ? "bg-brand-50 text-brand-600"
                      : "text-ink-700 hover:bg-ink-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href={`tel:${PRIMARY_PHONE.replace(/[^+\d]/g, "")}`}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Phone className="size-4" />
              Call Us
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
