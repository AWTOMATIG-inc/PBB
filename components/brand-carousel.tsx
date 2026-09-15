"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BRANDS } from "@/data/generators";

const slug = (brand: string) => brand.toLowerCase().replace(/\s+/g, "-");

export default function BrandCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => setIndex((i + BRANDS.length) % BRANDS.length);

  return (
    <div className="relative mt-8 w-full overflow-hidden rounded-xl border border-ink-100">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {BRANDS.map((brand) => (
          <div
            key={brand}
            className="relative flex aspect-video w-full shrink-0 items-end bg-ink-900 bg-cover bg-center"
            style={{ backgroundImage: `url(/carousel/${slug(brand)}.webp)` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/10 to-transparent" />
            <span className="relative px-6 py-6 text-lg font-semibold text-brand-400 sm:px-8 sm:text-xl">
              {brand}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Previous brand"
        className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-md transition-colors hover:text-brand-600"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Next brand"
        className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-md transition-colors hover:text-brand-600"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {BRANDS.map((brand, i) => (
          <button
            key={brand}
            type="button"
            aria-label={`Go to ${brand}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-brand-500" : "w-1.5 bg-ink-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
