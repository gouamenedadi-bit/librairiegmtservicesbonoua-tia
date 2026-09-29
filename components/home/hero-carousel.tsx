"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * The text/badge/CTA overlay is passed in as `children` from the (server)
 * homepage — this component only owns the image-cycling mechanics (real
 * category photos, not stock images), so the copy still goes through the
 * normal dict/translation path instead of being duplicated here.
 */
export function HeroCarousel({ images, children }: { images: string[]; children: React.ReactNode }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }
  function next() {
    setIndex((i) => (i + 1) % images.length);
  }

  return (
    <div className="relative overflow-hidden bg-brand-navy">
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          aria-hidden={i !== index}
        >
          <Image src={src} alt="" fill unoptimized priority={i === 0} className="object-cover" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-brand-navy/50" />

      <div className="relative">{children}</div>

      <button
        type="button"
        onClick={prev}
        aria-label="Image précédente"
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-2.5 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Image suivante"
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/15 p-2.5 text-white backdrop-blur transition hover:bg-white/30 sm:flex"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Aller à l'image ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
