"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronDown, SearchX, SlidersHorizontal, X } from "lucide-react";
import { morph } from "cube-motion";
import { Rise } from "cube-motion/react";
import { BRANDS, KVA_BANDS, type GeneratorModel } from "@/data/generators";
import ProductCard from "@/components/product-card";

const BAND_ORDER = KVA_BANDS.map((b) => b.value);
const PAGE_SIZE = 12;

function faceStyle(shown: boolean): CSSProperties {
  return {
    display: "inline-flex",
    whiteSpace: "nowrap",
    willChange: "opacity, filter, scale",
    ...(shown
      ? { position: "relative" }
      : { position: "absolute", inset: 0, opacity: 0 }),
  };
}

/**
 * Morphs a count between arbitrary values (not just two fixed states, so the
 * `Morph` component's boolean `active` doesn't fit). Ping-pongs the core
 * `morph()` call across two stacked faces, same layout convention the React
 * adapter uses internally for its own boolean Morph.
 */
function MorphCount({ value }: { value: number }) {
  const faceARef = useRef<HTMLSpanElement>(null);
  const faceBRef = useRef<HTMLSpanElement>(null);
  const [activeFace, setActiveFace] = useState<"a" | "b">("a");
  const previousValue = useRef<number | null>(null);

  useEffect(() => {
    if (previousValue.current === null) {
      if (faceARef.current) faceARef.current.textContent = String(value);
      previousValue.current = value;
      return;
    }
    if (value === previousValue.current) return;
    previousValue.current = value;
    const outgoing = activeFace === "a" ? faceARef.current : faceBRef.current;
    const incoming = activeFace === "a" ? faceBRef.current : faceARef.current;
    if (outgoing && incoming) {
      incoming.textContent = String(value);
      morph(outgoing, incoming);
    }
    setActiveFace((f) => (f === "a" ? "b" : "a"));
  }, [value, activeFace]);

  return (
    <span style={{ position: "relative", display: "inline-flex" }}>
      <span ref={faceARef} aria-hidden={activeFace !== "a"} style={faceStyle(activeFace === "a")} />
      <span ref={faceBRef} aria-hidden={activeFace !== "b"} style={faceStyle(activeFace === "b")} />
    </span>
  );
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-ink-100 py-5 first:pt-0 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-ink-900">{title}</span>
        <ChevronDown
          className={`size-4 text-ink-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <Rise show={open} targets="children" className="mt-4 flex flex-col gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-700"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="size-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-2 focus:ring-brand-300 focus:ring-offset-0"
            />
            {opt.label}
          </label>
        ))}
      </Rise>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function ProductsBrowser({
  generators,
}: {
  generators: GeneratorModel[];
}) {
  const [brands, setBrands] = useState<string[]>([]);
  const [bands, setBands] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const toggleBrand = (value: string) => {
    setBrands((prev) =>
      prev.includes(value) ? prev.filter((b) => b !== value) : [...prev, value]
    );
    setPage(1);
  };

  const toggleBand = (value: string) => {
    setBands((prev) =>
      prev.includes(value) ? prev.filter((b) => b !== value) : [...prev, value]
    );
    setPage(1);
  };

  const clearAll = () => {
    setBrands([]);
    setBands([]);
    setPage(1);
  };

  const filtered = useMemo(() => {
    return generators
      .filter((g) => brands.length === 0 || brands.includes(g.brand))
      .filter((g) => bands.length === 0 || bands.includes(g.kvaBand))
      .sort((a, b) => {
        const bandDiff =
          BAND_ORDER.indexOf(a.kvaBand) - BAND_ORDER.indexOf(b.kvaBand);
        if (bandDiff !== 0) return bandDiff;
        return (a.standbyKva ?? 0) - (b.standbyKva ?? 0);
      });
  }, [generators, brands, bands]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const activeCount = brands.length + bands.length;
  const hasFilters = activeCount > 0;

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  const filtersPanel = (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Filters
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Clear All
          </button>
        )}
      </div>
      <FilterGroup
        title="Brand"
        options={BRANDS.map((b) => ({ value: b, label: b }))}
        selected={brands}
        onToggle={toggleBrand}
      />
      <FilterGroup
        title="Power Band"
        options={KVA_BANDS.map((b) => ({ value: b.value, label: b.label }))}
        selected={bands}
        onToggle={toggleBand}
      />
    </>
  );

  return (
    <div className="lg:flex lg:items-start lg:gap-8">
      <button
        type="button"
        onClick={() => setMobileFiltersOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-ink-200 px-4 py-3 text-sm font-semibold text-ink-900 lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          Filters
          {hasFilters && (
            <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
              <MorphCount value={activeCount} />
            </span>
          )}
        </span>
        {mobileFiltersOpen ? (
          <X className="size-4 text-ink-400" />
        ) : (
          <ChevronDown className="size-4 text-ink-400" />
        )}
      </button>

      <Rise
        as="aside"
        show={mobileFiltersOpen}
        targets="children"
        className="mt-4 rounded-2xl border border-ink-100 bg-ink-50 p-6 lg:hidden"
      >
        {filtersPanel}
      </Rise>

      <aside className="hidden rounded-2xl border border-ink-100 bg-ink-50 p-6 lg:sticky lg:top-24 lg:block lg:w-72 lg:flex-shrink-0">
        {filtersPanel}
      </aside>

      <div className="mt-8 min-w-0 flex-1 lg:mt-0">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-500">
            Showing{" "}
            <span className="font-semibold text-ink-900">
              {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
              &ndash;{Math.min(currentPage * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of <span className="font-semibold text-ink-900">{filtered.length}</span>{" "}
            models
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink-200 py-16 text-center">
            <SearchX className="size-8 text-ink-300" />
            <p className="font-medium text-ink-700">
              No models match this combination of filters.
            </p>
            <p className="text-sm text-ink-400">
              Try a different brand or power band, or clear the filters.
            </p>
          </div>
        ) : (
          <>
            <Rise
              key={`${brands.join(",")}|${bands.join(",")}`}
              targets="children"
              className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {paged.map((model) => (
                <ProductCard key={`${model.brand}-${model.model}`} model={model} />
              ))}
            </Rise>

            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-1.5"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-700"
                >
                  Prev
                </button>
                {getPageNumbers(currentPage, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 text-sm text-ink-400"
                    >
                      &hellip;
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={`size-9 rounded-lg text-sm font-medium transition-colors ${
                        p === currentPage
                          ? "bg-brand-500 text-white"
                          : "text-ink-700 hover:bg-ink-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-ink-200 disabled:hover:text-ink-700"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
