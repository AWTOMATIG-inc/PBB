"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Handshake, Home, LayoutDashboard, LogOut, Package, SlidersHorizontal } from "lucide-react";
import { logout } from "@/app/admin/actions";

const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/filters", label: "Filters", icon: SlidersHorizontal },
  { href: "/admin/clients", label: "Clients", icon: Handshake },
  { href: "/admin/home", label: "Home Page", icon: Home },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-ink-800 bg-ink-900 text-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-base font-bold text-white">
              Power Bank Bangladesh
            </span>
            <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
              Admin
            </span>
          </Link>

          <nav className="hidden items-center gap-6 sm:flex">
            {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    active ? "text-brand-400" : "text-ink-200 hover:text-white"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-ink-300 sm:inline">{email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-200 transition-colors hover:bg-ink-800 hover:text-white"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
