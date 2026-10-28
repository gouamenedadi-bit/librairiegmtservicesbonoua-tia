"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

export type Slide = { src: string; alt: string; href: string };

const INTERVAL_MS = 4000;
const SLIDE_MS = 700;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Real product photos sliding right → left, one at a time. The first slide
 * is repeated at the end of the strip so the loop always moves the same
 * direction: once that copy is on screen, the strip jumps back to the real
 * first slide with the transition switched off, which looks identical.
 *
 * Only the first photo loads eagerly; the rest lazy-load. Auto-play is
 * skipped entirely for visitors who asked their device for reduced motion,
 * and pauses while the pointer or keyboard focus is on the slider.
 */
export function PhotoSlider({ slides, startDelayMs = 0 }: { slides: Slide[]; startDelayMs?: number }) {
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);

  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    let intervalId: ReturnType<typeof setInterval> | undefined;
    // Offsetting each slider's start keeps the two book pages from turning
    // at the exact same moment.
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        setAnimate(true);
        setIndex((i) => i + 1);
      }, INTERVAL_MS);
    }, startDelayMs);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [paused, reducedMotion, slides.length, startDelayMs]);

  function handleTransitionEnd() {
    if (index === slides.length) {
      setAnimate(false);
      setIndex(0);
    }
  }

  const strip = [...slides, slides[0]];
  const activeDot = index % slides.length;

  return (
    <div
      className="relative"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl bg-white">
        <div
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)` : "none",
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {strip.map((slide, i) => {
            const isClone = i === slides.length;
            return (
              <Link
                key={isClone ? `${slide.src}-clone` : slide.src}
                href={slide.href}
                aria-hidden={isClone || i !== index}
                tabIndex={isClone || i !== index ? -1 : 0}
                className="relative block aspect-[16/10] w-full shrink-0 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-navy sm:aspect-[4/3]"
              >
                <Image
                  src={slide.src}
                  alt={isClone ? "" : slide.alt}
                  fill
                  unoptimized
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                  sizes="(min-width: 640px) 40vw, 100vw"
                  className="object-cover object-[50%_65%]"
                />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => {
              setAnimate(true);
              setIndex(i);
            }}
            aria-label={slide.alt}
            aria-current={i === activeDot}
            className={`h-1.5 rounded-full bg-current transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy ${i === activeDot ? "w-5 opacity-90" : "w-1.5 opacity-35 hover:opacity-60"}`}
          />
        ))}
      </div>
    </div>
  );
}
