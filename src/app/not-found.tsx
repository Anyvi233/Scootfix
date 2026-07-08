import Link from "next/link";
import { FiArrowRight, FiHome, FiSearch, FiAlertTriangle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Page Not Found | ScootFix",
  description: "The page you are looking for does not exist. Browse our genuine EV spare parts and accessories.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      {/* Visual Indicator */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-danger/10 blur-xl pointer-events-none scale-150" />
        <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center text-danger border border-danger/20 relative z-10">
          <FiAlertTriangle size={36} />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-display font-extrabold text-text-primary mb-4 leading-tight">
        404 — Page Not Found
      </h1>

      {/* Description */}
      <p className="text-text-secondary text-base max-w-md mb-8 leading-relaxed">
        We couldn't find the page you're looking for. It might have been moved, deleted, or the URL might be incorrect.
      </p>

      {/* Search form or suggestions */}
      <div className="w-full max-w-md mb-8">
        <form action="/shop" method="GET" className="relative flex items-center">
          <input
            type="text"
            name="search"
            placeholder="Search genuine EV parts..."
            className="w-full h-12 pl-4 pr-12 rounded-lg border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            aria-label="Search EV parts"
          />
          <button
            type="submit"
            className="absolute right-4 text-text-muted hover:text-primary transition-colors"
            aria-label="Submit search"
          >
            <FiSearch size={18} />
          </button>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/">
          <Button variant="primary" size="lg" leftIcon={<FiHome size={18} />} className="shadow-glow h-12 px-6">
            Go to Home
          </Button>
        </Link>
        <Link href="/shop">
          <Button variant="outline" size="lg" rightIcon={<FiArrowRight size={18} />} className="h-12 px-6">
            Browse Shop
          </Button>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="mt-12 pt-8 border-t border-border w-full max-w-md">
        <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Popular Sections</p>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/categories" className="text-text-secondary hover:text-primary transition-colors">
            Shop by Category
          </Link>
        </div>
      </div>
    </div>
  );
}
