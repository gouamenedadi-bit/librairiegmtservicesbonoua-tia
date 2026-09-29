"use client";

import { Mail } from "lucide-react";

// lucide-react dropped brand/social icons (Facebook, Twitter/X, LinkedIn) —
// small inline marks instead of pulling in a whole extra icon package for 3 glyphs.
function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}
function TwitterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2h3.2l-7 8 8.2 12h-6.4l-5-6.6L5 22H1.8l7.5-8.6L1.5 2h6.6l4.5 6 6.3-6Zm-1.1 18h1.8L7.3 4H5.4l12.4 16Z" />
    </svg>
  );
}
function LinkedinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-.95 1.85-1.95 3.8-1.95 4.06 0 4.8 2.67 4.8 6.14V21h-4v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
    </svg>
  );
}

/**
 * Reads the URL from the browser at click time rather than a server-provided
 * absolute URL — robust regardless of NEXT_PUBLIC_SITE_URL/deployment status,
 * since it always reflects wherever the page is actually being viewed from.
 */
export function ShareButtons({ title }: { title: string }) {
  function open(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  function share(kind: "facebook" | "twitter" | "linkedin" | "email") {
    const url = window.location.href;
    if (kind === "facebook") return open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    if (kind === "twitter")
      return open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`);
    if (kind === "linkedin")
      return open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
  }

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-black/50 transition hover:border-brand-navy hover:text-brand-navy";

  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label="Facebook" onClick={() => share("facebook")} className={buttonClass}>
        <FacebookIcon />
      </button>
      <button type="button" aria-label="Twitter" onClick={() => share("twitter")} className={buttonClass}>
        <TwitterIcon />
      </button>
      <button type="button" aria-label="LinkedIn" onClick={() => share("linkedin")} className={buttonClass}>
        <LinkedinIcon />
      </button>
      <button type="button" aria-label="Email" onClick={() => share("email")} className={buttonClass}>
        <Mail size={14} />
      </button>
    </div>
  );
}
