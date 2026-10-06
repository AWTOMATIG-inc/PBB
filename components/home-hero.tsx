"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Pause, Phone, Play } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/8801989474447";

const whatsappLink = (text: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;

type Slide = {
  tab: string;
  title: string;
  highlight: string;
  body: string;
  image: string;
  alt: string;
  cta: { label: string; href: string; external?: boolean };
};

const SLIDES: Slide[] = [
  {
    tab: "Sell",
    title: "Diesel generators,",
    highlight: "standby to 1500 kVA",
    body: "New and reconditioned units matched to your load and budget. Bring your existing generator and exchange it toward another, subject to inspection.",
    image: "/assets/flyer-uninterrupted-energy.webp",
    alt: "Open diesel generator under a stormy sky: Uninterrupted energy for every moment",
    cta: { label: "Browse Generators", href: "/products" },
  },
  {
    tab: "Rental",
    title: "Generator rental,",
    highlight: "short or long term",
    body: "Backup power for events, construction sites and standby needs, from Dhaka and Chattogram.",
    image: "/assets/flyer-perkins-construction.webp",
    alt: "Canopied Perkins generator in front of a building construction site",
    cta: {
      label: "Ask About Rental",
      href: whatsappLink("Hello, I'd like to ask about generator rental."),
      external: true,
    },
  },
  {
    tab: "Service",
    title: "Service and",
    highlight: "genuine spare parts",
    body: "Routine maintenance, repair and parts support for every major brand, so your generator keeps running.",
    image: "/assets/flyer-generator-service.webp",
    alt: "Technician beside a diesel generator: Service your generator to ensure its longevity",
    cta: {
      label: "Book a Service",
      href: whatsappLink("Hello, I need generator service / spare parts."),
      external: true,
    },
  },
  {
    tab: "Brands",
    title: "Perkins, Cummins",
    highlight: "and Ricardo",
    body: "Compare models by brand and power output, then request a quotation straight from the product.",
    image: "/assets/flyer-perkins-purple.webp",
    alt: "Large Perkins diesel generator with a 12 month warranty seal",
    cta: { label: "View All Models", href: "/products" },
  },
];

const SLIDE_MS = 5000;
const EASE = "ease-[cubic-bezier(0.16,1,0.3,1)]";

export default function HomeHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const next = () => setIndex((i) => (i + 1) % SLIDES.length);
  const halted = paused || hovered;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Power Bank Bangladesh services"
      className="relative overflow-hidden bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      {/* Orange block the card sits on (desktop) */}
      <div aria-hidden className="absolute inset-y-0 right-0 hidden w-[40%] bg-brand-500 lg:block" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pt-12 pb-14 sm:px-6 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:px-8 lg:py-24">
        {/* Copy */}
        <div className="min-w-0">
          <div className="grid">
            {SLIDES.map((slide, i) => {
              const active = i === index;
              const Heading = i === 0 ? "h1" : "h2";
              return (
                <div
                  key={slide.tab}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${SLIDES.length}: ${slide.tab}`}
                  aria-hidden={!active}
                  inert={!active}
                  className={`col-start-1 row-start-1 transition-[opacity,translate] motion-reduce:transition-none ${EASE} ${
                    active
                      ? "translate-y-0 opacity-100 delay-150 duration-700"
                      : "translate-y-3 opacity-0 duration-300"
                  }`}
                >
                  <Heading className="text-4xl font-bold tracking-tight text-balance text-ink-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
                    {slide.title} <span className="text-brand-500">{slide.highlight}</span>
                  </Heading>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-ink-500">{slide.body}</p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    {slide.cta.external ? (
                      <a
                        href={slide.cta.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                      >
                        <MessageCircle className="size-4" />
                        {slide.cta.label}
                      </a>
                    ) : (
                      <Link
                        href={slide.cta.href}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                      >
                        {slide.cta.label}
                        <ArrowRight className="size-4" />
                      </Link>
                    )}
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:border-brand-300 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                    >
                      <Phone className="size-4" />
                      Contact Us
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slide tabs: the active one fills over SLIDE_MS, then advances */}
          <div className="mt-10 flex items-end gap-4 sm:mt-12">
            <div className="grid flex-1 grid-cols-4 gap-3">
              {SLIDES.map((slide, i) => {
                const active = i === index;
                return (
                  <button
                    key={slide.tab}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${slide.tab}`}
                    aria-current={active}
                    className="group rounded-sm pt-1 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
                  >
                    <span
                      className={`block text-xs font-semibold tracking-wide uppercase transition-colors sm:text-sm ${
                        active ? "text-ink-900" : "text-ink-400 group-hover:text-ink-700"
                      }`}
                    >
                      {slide.tab}
                    </span>
                    <span className="mt-2 block h-[3px] overflow-hidden rounded-full bg-ink-100">
                      {active && (
                        <span
                          key={index}
                          onAnimationEnd={next}
                          className="block h-full origin-left animate-[hero-progress_linear_forwards] bg-brand-500 motion-reduce:animate-none"
                          style={{
                            animationDuration: `${SLIDE_MS}ms`,
                            animationPlayState: halted ? "paused" : "running",
                          }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors hover:border-brand-300 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 motion-safe:inline-flex"
            >
              {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="relative">
          {/* Orange band behind the card (mobile/tablet) */}
          <div aria-hidden className="absolute -inset-x-4 top-1/3 -bottom-14 bg-brand-500 sm:-inset-x-6 lg:hidden" />
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgb(99_44_8/0.45)] ring-1 ring-ink-950/5">
            {SLIDES.map((slide, i) => {
              const active = i === index;
              return (
                <div
                  key={slide.tab}
                  aria-hidden
                  className={`absolute inset-0 transition-[clip-path] motion-reduce:transition-none ${
                    active
                      ? `z-10 [clip-path:inset(0_0_0_0)] duration-1000 ${EASE}`
                      : "z-0 [clip-path:inset(0_0_0_100%)] delay-1000 duration-0"
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    priority={i === 0}
                    className={`object-cover transition-transform duration-[2000ms] ${EASE} ${active ? "scale-100" : "scale-110"}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
