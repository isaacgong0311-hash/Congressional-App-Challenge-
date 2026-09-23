import type { Result } from "./letter-tool-state";

export function LetterResultOverview({
  result,
  urgencyLabel,
}: {
  result: Result;
  urgencyLabel: string;
}) {
  const nextStep = result.nextSteps[0];
  const attention = result.deadline
    ? result.deadline
    : result.isPossibleScam
      ? "Possible scam signals need review"
      : result.whatTheyNeed[0] ?? "No urgent requirement found";

  return (
    <section aria-label="Letter summary" className="grid gap-3 lg:grid-cols-3">
      <article className="rounded-card border border-ink/10 bg-surface p-5 shadow-[0_12px_36px_rgba(20,36,30,.05)]">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-cobalt">
          1 · What it means
        </p>
        <h2 className="mt-3 text-lg font-bold tracking-[-0.025em] text-ink">
          {result.documentType}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
          {result.meaning}
        </p>
      </article>

      <article className="rounded-card border border-amber/35 bg-[#fff8df] p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#795a18]">
          2 · What needs attention
        </p>
        <p className="mt-3 text-lg font-bold tracking-[-0.025em] text-ink">
          {attention}
        </p>
        <p className="mt-2 text-sm font-semibold text-[#795a18]">
          {urgencyLabel}
        </p>
      </article>

      <article className="rounded-card border border-cobalt/20 bg-[#eef2ff] p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-cobalt">
          3 · What to do next
        </p>
        <p className="mt-3 text-lg font-bold tracking-[-0.025em] text-ink">
          {nextStep?.step ?? "Review the original letter"}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#53628b]">
          {nextStep?.detail ?? "Confirm important details with the office named on the document."}
        </p>
      </article>
    </section>
  );
}

export function LetterMobilePreview({ preview }: { preview: string }) {
  return (
    <details className="rounded-card border border-ink/10 bg-surface p-4 md:hidden">
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-ink">
        View the original letter
      </summary>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Your letter"
        className="mt-3 max-h-[70vh] w-full rounded-xl border border-ink/10 object-contain"
        src={preview}
      />
    </details>
  );
}
