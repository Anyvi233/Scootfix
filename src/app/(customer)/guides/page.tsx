import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES, GUIDE_CATEGORIES, GuideCategory } from "@/lib/guides-data";

export const metadata: Metadata = {
  title: "EV Scooter Guides — Installation & Maintenance | ScootFix",
  description:
    "Step-by-step installation guides and maintenance tips for EV scooter parts. Learn how to install batteries, brakes, controllers, and keep your scooter running perfectly.",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "bg-success/10 text-success border-success/20",
  Intermediate: "bg-warning/10 text-warning border-warning/20",
  Advanced: "bg-danger/10 text-danger border-danger/20",
};

export default function GuidesPage() {
  const installGuides = GUIDES.filter((g) => g.category === "installation");
  const maintGuides = GUIDES.filter((g) => g.category === "maintenance");

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 max-w-6xl">
      {/* Hero Header */}
      <div className="text-center mb-16">
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">
          Knowledge Base
        </p>
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-text-primary leading-tight mb-4">
          EV Scooter Guides
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
          Expert installation walkthroughs and maintenance routines to get the most out of every part you buy from ScootFix.
        </p>
      </div>

      {/* Category sections */}
      {(["installation", "maintenance"] as GuideCategory[]).map((cat) => {
        const { label, description, emoji } = GUIDE_CATEGORIES[cat];
        const guides = cat === "installation" ? installGuides : maintGuides;

        return (
          <section key={cat} className="mb-20">
            {/* Category header */}
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-2xl">
                {emoji}
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-text-primary">{label}</h2>
                <p className="text-text-secondary text-sm mt-0.5">{description}</p>
              </div>
            </div>

            {/* Guide cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group block bg-surface border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {guide.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[guide.difficulty]}`}
                      >
                        {guide.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-display font-bold text-lg text-text-primary mb-1 group-hover:text-primary transition-colors leading-tight">
                    {guide.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {guide.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {guide.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 bg-surface-elevated border border-border rounded-full text-text-muted font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-text-muted text-xs shrink-0 ml-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {guide.readTime} read
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* CTA Banner */}
      <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <h3 className="text-xl font-display font-bold text-text-primary mb-2">
          Need a specific part for your guide?
        </h3>
        <p className="text-text-secondary text-sm mb-6">
          Browse our full catalog of genuine EV scooter components — batteries, brakes, controllers, and more.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm"
        >
          Shop EV Parts →
        </Link>
      </div>
    </div>
  );
}
