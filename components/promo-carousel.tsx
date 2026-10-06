"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Client flyers have text baked in, so they are shown whole (contain), never cropped.
export default function PromoCarousel({
  slides,
}: {
  slides: { image: string; alt: string }[];
}) {
  const [index, setIndex] = useState(0);

  const goTo = (i: number) => setIndex((i + slides.length) % slides.length);

  return (
    <div
      aria-roledescription="carousel"
      aria-label="Power Bank Bangladesh offers"
      className="relative mt-8 w-full overflow-hidden rounded-xl border border-ink-100 bg-ink-950"
    >
      <div
        className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map(({ image, alt }, i) => (
          <div
            key={image}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            aria-hidden={i !== index}
            className="relative aspect-video w-full shrink-0"
          >
            <Image
              src={image}
              alt={alt}
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              priority={i === 0}
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-md transition-colors hover:text-brand-600"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-md transition-colors hover:text-brand-600"
      >
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map(({ image }, i) => (
          <button
            key={image}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
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
