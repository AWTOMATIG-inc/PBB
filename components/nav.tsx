"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Rise, Morph } from "cube-motion/react";

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

  // Close mobile drawer upon route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex shrink-0 items-center"
        >
          <Image
            src="/pbb-logo.png"
            alt="Power Bank Bangladesh"
            width={533}
            height={401}
            priority
            className="h-16 w-auto"
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
                className={`text-base font-medium transition-colors ${
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
          <Morph
            active={open}
            off={<Menu className="size-6" />}
            on={<X className="size-6" />}
          />
        </button>
      </div>

      {/* Mobile Drawer Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 top-20 z-40 bg-ink-950/40 backdrop-blur-xs transition-opacity duration-200 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Dropdown Overlay */}
      <div
        className={`absolute top-full inset-x-0 z-50 transform transition-all duration-200 ease-out md:hidden ${
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-2 opacity-0 pointer-events-none"
        }`}
      >
        <Rise
          as="nav"
          show={open}
          targets="children"
          className="flex flex-col gap-1 border-b border-ink-200 bg-white px-4 pb-6 pt-3 shadow-2xl"
        >
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
                className={`rounded-lg px-3.5 py-2.5 text-base font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-600 font-semibold"
                    : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <a
            href={`tel:${PRIMARY_PHONE.replace(/[^+\d]/g, "")}`}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-600"
          >
            <Phone className="size-4" />
            Call Us
          </a>
        </Rise>
      </div>
    </header>
  );
}
