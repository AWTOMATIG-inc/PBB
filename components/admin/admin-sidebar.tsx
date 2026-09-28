"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Package,
  SlidersHorizontal,
  Handshake,
  Home,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
} from "lucide-react";
import { logout } from "@/app/admin/actions";

const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/quotations", label: "Quotations", icon: FileText },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/filters", label: "Filters", icon: SlidersHorizontal },
  { href: "/admin/clients", label: "Clients", icon: Handshake },
  { href: "/admin/home", label: "Home Page", icon: Home },
];

export default function AdminSidebar({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapsed preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pbb_admin_sidebar_collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  // Close mobile drawer upon route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("pbb_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* ============================================================== */}
      {/* MOBILE TOP BAR (< md screens)                                  */}
      {/* ============================================================== */}
      <div className="fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-ink-800 bg-ink-950 px-4 md:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-ink-300 hover:bg-ink-800 hover:text-white"
            aria-label="Open Navigation Menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Power Bank BD</span>
            <span className="rounded bg-brand-500 px-1.5 py-0.2 text-[10px] font-bold uppercase text-white">
              Admin
            </span>
          </div>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded p-1.5 text-xs text-ink-400 hover:text-white"
            title="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </form>
      </div>

      {/* ============================================================== */}
      {/* MOBILE DRAWER BACKDROP & OVERLAY (< md screens)                */}
      {/* ============================================================== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ============================================================== */}
      {/* SIDEBAR NAVIGATION                                             */}
      {/* ============================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-ink-800 bg-ink-950 text-white transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-screen ${
          // Mobile open/close
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${
          // Desktop collapsed/expanded width
          collapsed ? "md:w-20" : "md:w-64"
        } w-64`}
      >
        {/* Sidebar Header & Brand */}
        <div className="flex h-16 items-center justify-between border-b border-ink-800 px-4">
          <Link
            href="/admin"
            className={`flex items-center gap-2.5 overflow-hidden transition-all ${
              collapsed ? "md:justify-center md:w-full" : ""
            }`}
            title="Power Bank Bangladesh Admin"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 font-bold text-white shadow-sm">
              <span className="text-xs">PBB</span>
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-bold text-white leading-tight">
                  Power Bank BD
                </span>
                <span className="text-[10px] font-medium tracking-wide uppercase text-brand-400">
                  Back-Office Admin
                </span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 text-ink-400 hover:bg-ink-800 hover:text-white md:hidden"
          >
            <X className="size-5" />
          </button>

          {/* Desktop collapse toggle in header when expanded */}
          {!collapsed && (
            <button
              type="button"
              onClick={toggleCollapsed}
              className="hidden md:flex items-center justify-center size-7 rounded-md text-ink-400 hover:bg-ink-800 hover:text-white transition-colors"
              title="Collapse Navigation"
              aria-label="Collapse Navigation"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}
        </div>

        {/* Collapsed state toggle rail (visible on desktop when collapsed) */}
        {collapsed && (
          <div className="hidden md:flex justify-center border-b border-ink-800 py-2">
            <button
              type="button"
              onClick={toggleCollapsed}
              className="flex items-center justify-center size-8 rounded-md text-ink-400 hover:bg-ink-800 hover:text-brand-400 transition-colors"
              title="Expand Navigation"
              aria-label="Expand Navigation"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        )}

        {/* Nav Links Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-brand-500 text-white font-semibold shadow-xs"
                    : "text-ink-300 hover:bg-ink-900 hover:text-white"
                } ${collapsed ? "md:justify-center md:px-0" : ""}`}
              >
                <Icon className="size-5 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}

          <div className="pt-3 my-2 border-t border-ink-800/80" />

          {/* Preview Public Website Link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={collapsed ? "View Live Website" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-400 hover:bg-ink-900 hover:text-white transition-all ${
              collapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <ExternalLink className="size-5 shrink-0" />
            {!collapsed && <span className="truncate">View Public Site</span>}
          </a>
        </div>

        {/* Sidebar Footer & User Profile */}
        <div className="border-t border-ink-800 p-3 bg-ink-950/80">
          {!collapsed ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 px-2 py-1">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink-800 text-ink-300">
                  <User className="size-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-semibold text-ink-200 truncate">
                    {email}
                  </span>
                  <span className="text-[10px] text-ink-500">Superuser</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-ink-900">
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-400 hover:bg-ink-900 hover:text-ink-200 transition-colors"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Collapse</span>
                </button>

                <form action={logout}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    title="Sign out of admin"
                  >
                    <LogOut className="size-3.5" />
                    <span>Sign out</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-1">
              <div
                className="flex size-8 items-center justify-center rounded-full bg-ink-800 text-ink-300"
                title={`Logged in as ${email}`}
              >
                <User className="size-4" />
              </div>

              <form action={logout}>
                <button
                  type="submit"
                  className="flex size-8 items-center justify-center rounded-md text-ink-400 hover:bg-red-500/15 hover:text-red-400 transition-colors"
                  title={`Sign out (${email})`}
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA                                              */}
      {/* ============================================================== */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
