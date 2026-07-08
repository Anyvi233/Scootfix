"use client";

/**
 * SkipNav — Accessibility skip-to-content link.
 * Invisible until focused by keyboard, allowing screen reader / keyboard-only
 * users to bypass the navigation and jump directly to main content.
 *
 * Place this as the FIRST element inside <body>.
 * Pair with <main id="main-content"> in your page layout.
 */
export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4 z-[9999]
        px-4 py-2 rounded-md
        bg-primary text-white text-sm font-semibold
        shadow-lg ring-2 ring-white
        focus:outline-none
        transition-transform
      "
    >
      Skip to main content
    </a>
  );
}
