"use client";

import React, { useRef, useState, useEffect } from "react";

interface InfiniteLogoSliderProps {
  items: React.ReactNode[];
  speed?: number; // duration in seconds
  reverse?: boolean;
  className?: string;
  gapClassName?: string;
}

export default function InfiniteLogoSlider({
  items,
  speed = 30,
  reverse = false,
  className = "",
  gapClassName = "gap-12 sm:gap-16 pr-12 sm:pr-16",
}: InfiniteLogoSliderProps) {
  if (!items || items.length === 0) return null;

  // Ensure enough items to span extra-large / 4K displays smoothly without empty gaps
  const minItems = 12;
  const multiplier = Math.max(1, Math.ceil(minItems / items.length));
  const fullList: React.ReactNode[] = [];
  for (let m = 0; m < multiplier; m++) {
    fullList.push(...items);
  }

  return (
    <div
      className={`relative w-full overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <div
        className="flex w-max items-center animate-infinite-slide hover:[animation-play-state:paused] active:[animation-play-state:paused]"
        style={{
          animationDuration: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {/* Track 1 */}
        <div className={`flex shrink-0 items-center ${gapClassName}`}>
          {fullList.map((item, idx) => (
            <div key={`track1-${idx}`} className="shrink-0 flex items-center">
              {item}
            </div>
          ))}
        </div>

        {/* Track 2 (Clone for mathematically seamless infinite loop) */}
        <div
          className={`flex shrink-0 items-center ${gapClassName}`}
          aria-hidden="true"
        >
          {fullList.map((item, idx) => (
            <div key={`track2-${idx}`} className="shrink-0 flex items-center">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
