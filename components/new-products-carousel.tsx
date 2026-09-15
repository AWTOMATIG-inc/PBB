"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { GeneratorModel } from "@/data/generators";
import ProductCard from "@/components/product-card";

export default function NewProductsCarousel({
  models,
}: {
  models: GeneratorModel[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanScrollPrev(track.scrollLeft > 4);
    setCanScrollNext(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
    );
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const gap = 24;
    const step = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <div className="relative mt-12">
      <div
        ref={trackRef}
        onScroll={updateScrollState}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {models.map((model) => (
          <div
            key={`${model.brand}-${model.model}`}
            data-card
            className="w-[85%] shrink-0 snap-start sm:w-[45%] lg:w-[31%]"
          >
            <ProductCard model={model} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        disabled={!canScrollPrev}
        aria-label="Previous models"
        className="absolute left-2 top-[38%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-700 shadow-md transition-colors hover:text-brand-600 disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        disabled={!canScrollNext}
        aria-label="Next models"
        className="absolute right-2 top-[38%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-100 bg-white text-ink-700 shadow-md transition-colors hover:text-brand-600 disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
