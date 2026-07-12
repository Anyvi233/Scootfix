import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, GUIDE_CATEGORIES } from "@/lib/guides-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return { title: "Guide Not Found | ScootFix" };
  return {
    title: `${guide.title} | ScootFix Guides`,
    description: guide.description,
  };
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: "bg-success/10 text-success border-success/20",
  Intermediate: "bg-warning/10 text-warning border-warning/20",
  Advanced: "bg-danger/10 text-danger border-danger/20",
};

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) notFound();

  const category = GUIDE_CATEGORIES[guide.category];
  const relatedGuides = GUIDES.filter(
    (g) => g.category === guide.category && g.slug !== guide.slug
  ).slice(0, 2);

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-text-muted mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-primary transition-colors">Guides</Link>
        <span>/</span>
        <span className="text-text-secondary font-medium truncate max-w-[200px]">{guide.title}</span>
      </nav>

      {/* Article Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{guide.icon}</span>
          <span className="text-xs font-bold uppercase tracking-widest text-primary px-2.5 py-1 bg-primary/5 border border-primary/15 rounded-full">
            {category.label}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[guide.difficulty]}`}>
            {guide.difficulty}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary leading-tight mb-3">
          {guide.title}
        </h1>
        <p className="text-text-secondary text-lg mb-5 leading-relaxed">
          {guide.subtitle}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted border-t border-b border-border py-3">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {guide.readTime} read
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {guide.steps.length} steps
          </div>
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {guide.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-surface-elevated border border-border rounded-full text-text-muted font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warnings */}
          {guide.warnings && guide.warnings.length > 0 && (
            <div className="bg-danger/5 border border-danger/20 rounded-2xl p-5">
              <h3 className="text-danger font-bold text-sm flex items-center gap-2 mb-3">
                <span>⚠</span> Safety Warnings — Read Before Starting
              </h3>
              <ul className="space-y-2">
                {guide.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-danger/80 flex gap-2">
                    <span className="shrink-0 mt-0.5">•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps */}
          <div className="space-y-5">
            {guide.steps.map((step, idx) => (
              <div
                key={idx}
                className="relative pl-12 pb-5 border-l-2 border-border last:border-transparent"
              >
                {/* Step number */}
                <div className="absolute -left-4 top-0 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shadow-sm">
                  {idx + 1}
                </div>

                <div className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors">
                  <h3 className="font-display font-bold text-text-primary mb-2 text-base">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {step.content}
                  </p>

                  {step.tip && (
                    <div className="mt-3 flex gap-2 p-3 bg-primary/5 border border-primary/15 rounded-xl text-xs text-primary">
                      <span className="shrink-0 font-bold">💡 TIP:</span>
                      <span>{step.tip}</span>
                    </div>
                  )}
                  {step.warning && (
                    <div className="mt-3 flex gap-2 p-3 bg-warning/5 border border-warning/20 rounded-xl text-xs text-warning">
                      <span className="shrink-0 font-bold">⚠ WARNING:</span>
                      <span>{step.warning}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Done Banner */}
          <div className="bg-success/5 border border-success/20 rounded-2xl p-5 text-center">
            <p className="text-2xl mb-2">✅</p>
            <h4 className="font-display font-bold text-text-primary mb-1">Guide Complete!</h4>
            <p className="text-sm text-text-secondary">
              If you&apos;re experiencing any issues, feel free to contact our support team via WhatsApp.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Tools Required */}
          {guide.tools && guide.tools.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-5 sticky top-24">
              <h3 className="font-display font-bold text-text-primary mb-3 text-sm uppercase tracking-widest">
                🛠 Tools Required
              </h3>
              <ul className="space-y-2">
                {guide.tools.map((tool, i) => (
                  <li key={i} className="text-sm text-text-secondary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                    {tool}
                  </li>
                ))}
              </ul>

              <div className="mt-5 pt-4 border-t border-border">
                <Link
                  href="/shop"
                  className="w-full block text-center bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Shop Related Parts →
                </Link>
              </div>
            </div>
          )}

          {/* Related Guides */}
          {relatedGuides.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-5">
              <h3 className="font-display font-bold text-text-primary mb-3 text-sm uppercase tracking-widest">
                Related Guides
              </h3>
              <div className="space-y-3">
                {relatedGuides.map((rg) => (
                  <Link
                    key={rg.slug}
                    href={`/guides/${rg.slug}`}
                    className="flex items-start gap-3 group hover:text-primary transition-colors"
                  >
                    <span className="text-xl">{rg.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {rg.title}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">{rg.readTime} · {rg.difficulty}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/guides" className="block mt-4 text-xs text-primary hover:underline font-medium">
                View all guides →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
