import Link from "next/link";

import { PageContainer } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

import type { LegalDocument } from "./legal-data";

export type LegalDocumentViewProps = {
  document: LegalDocument;
  /** Cross-link to the other legal page. */
  related?: {
    label: string;
    href: string;
  };
  className?: string;
};

/**
 * Shared public legal document layout — privacy / terms.
 */
export function LegalDocumentView({
  document,
  related,
  className,
}: LegalDocumentViewProps) {
  return (
    <section
      aria-labelledby="legal-document-heading"
      className={cn(
        "relative overflow-hidden bg-brand-surface font-montserrat",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-24 top-0 size-72 rounded-full",
          "bg-[radial-gradient(circle,color-mix(in_srgb,var(--brand-blue)_12%,transparent)_0%,transparent_70%)]",
          "blur-2xl sm:size-96",
        )}
        aria-hidden
      />

      <PageContainer size="lg" className="relative public-section-y">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm sm:mb-10">
          <ol className="flex flex-wrap items-center gap-2 text-brand-muted">
            <li>
              <Link
                href={ROUTES.PUBLIC.HOME}
                className="font-medium transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
              >
                Home
              </Link>
            </li>
            <li aria-hidden className="text-brand-muted/50">
              /
            </li>
            <li className="font-medium text-brand-dark">{document.title}</li>
          </ol>
        </nav>

        <header className="max-w-2xl">
          <p
            className={cn(
              "text-[0.6875rem] font-medium tracking-[0.18em] text-brand-red uppercase",
              "sm:text-xs sm:tracking-[0.2em]",
            )}
          >
            {document.eyebrow}
          </p>
          <h1
            id="legal-document-heading"
            className={cn(
              "mt-3 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-brand-dark",
              "sm:mt-4 sm:text-4xl lg:text-5xl",
            )}
          >
            {document.title}
          </h1>
          <div className="mt-4 h-1 w-12 rounded-full bg-brand-red" aria-hidden />
          <p className="mt-5 text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
            {document.description}
          </p>
          <p className="mt-3 text-xs font-medium tracking-wide text-brand-muted/80">
            Last updated: {document.lastUpdated}
          </p>
        </header>

        <div
          className={cn(
            "mt-10 rounded-3xl border border-brand-blue/10 bg-white p-6",
            "shadow-[0_12px_40px_color-mix(in_srgb,var(--brand-blue)_6%,transparent)]",
            "sm:mt-12 sm:p-8 lg:p-10",
          )}
        >
          <div className="space-y-8 sm:space-y-10">
            {document.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-heading`}
              >
                <h2
                  id={`${section.id}-heading`}
                  className="font-serif text-xl font-medium tracking-tight text-brand-dark sm:text-2xl"
                >
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-brand-muted sm:text-[0.9375rem]">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.id}-p-${index}`}>{paragraph}</p>
                  ))}
                  {section.bullets && section.bullets.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5 marker:text-brand-blue">
                      {section.bullets.map((bullet, index) => (
                        <li key={`${section.id}-b-${index}`}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </div>

        {related ? (
          <p className="mt-8 text-center text-sm text-brand-muted sm:mt-10">
            Also see{" "}
            <Link
              href={related.href}
              className="font-semibold text-brand-blue underline-offset-4 transition-colors hover:text-brand-hover hover:underline"
            >
              {related.label}
            </Link>
            .
          </p>
        ) : null}
      </PageContainer>
    </section>
  );
}
