"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "cube-motion/react";
import type { GeneratorModel } from "@/data/generators";
import ProductCard from "@/components/product-card";

export default function NewProductsCarousel({
  models,
}: {
  models: GeneratorModel[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setCanScrollPrev(track.scrollLeft > 10);
    setCanScrollNext(
      track.scrollLeft + track.clientWidth < track.scrollWidth - 10,
    );

    // Calculate which card is closest to the center
    const cards = track.querySelectorAll<HTMLElement>("[data-card]");
    if (cards.length > 0) {
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;

      cards.forEach((card, idx) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(trackCenter - cardCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });
      setActiveIndex(closestIdx);
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  const scrollToCard = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>("[data-card]");
    const targetIdx = Math.max(0, Math.min(index, cards.length - 1));
    const card = cards[targetIdx];
    if (!card) return;

    // Center the target card smoothly
    const targetLeft = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left: targetLeft, behavior: "smooth" });
  };

  return (
    <div className="relative mt-12">
      {/* Carousel Track with bleed on mobile for centered peek */}
      <Reveal
        as="div"
        targets="children"
        ref={trackRef}
        onScroll={updateScrollState}
        className="flex snap-x snap-mandatory gap-4 sm:gap-6 overflow-x-auto scroll-smooth -mx-4 px-[12%] sm:mx-0 sm:px-0 pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {models.map((model) => (
          <div
            key={`${model.brand}-${model.model}`}
            data-card
            className="w-[76vw] sm:w-[45%] lg:w-[31%] max-w-sm sm:max-w-none shrink-0 snap-center sm:snap-start transition-transform duration-200"
          >
            <ProductCard model={model} />
          </div>
        ))}
      </Reveal>

      {/* Desktop Floating Arrows */}
      <button
        type="button"
        onClick={() => scrollToCard(activeIndex - 1)}
        disabled={!canScrollPrev}
        aria-label="Previous models"
        className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 size-11 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 shadow-md transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollToCard(activeIndex + 1)}
        disabled={!canScrollNext}
        aria-label="Next models"
        className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 size-11 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-700 shadow-md transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Mobile Floating Arrows (positioned in gutters without overlapping center card) */}
      <button
        type="button"
        onClick={() => scrollToCard(activeIndex - 1)}
        disabled={!canScrollPrev}
        aria-label="Previous card"
        className="sm:hidden absolute left-1 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-full border border-ink-200/80 bg-white/95 backdrop-blur-xs text-ink-700 shadow-md transition-all hover:text-brand-600 disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronLeft className="size-4.5" />
      </button>
      <button
        type="button"
        onClick={() => scrollToCard(activeIndex + 1)}
        disabled={!canScrollNext}
        aria-label="Next card"
        className="sm:hidden absolute right-1 top-1/2 -translate-y-1/2 z-20 flex size-9 items-center justify-center rounded-full border border-ink-200/80 bg-white/95 backdrop-blur-xs text-ink-700 shadow-md transition-all hover:text-brand-600 disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronRight className="size-4.5" />
      </button>

      {/* Mobile Pagination Dots */}
      <div className="mt-3 flex items-center justify-center gap-1.5 sm:hidden">
        {models.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollToCard(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex
                ? "w-6 bg-brand-500"
                : "w-1.5 bg-ink-200 hover:bg-ink-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
