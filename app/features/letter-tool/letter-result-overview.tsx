import {
  CheckIcon,
  DocumentIcon,
  ShieldAlertIcon,
} from "../../components/lantern/icons";
import type { Result } from "./letter-tool-state";

export function LetterResultOverview({
  result,
  urgencyLabel,
  spanish = false,
}: {
  result: Result;
  urgencyLabel: string;
  spanish?: boolean;
}) {
  const nextStep = result.nextSteps[0];
  const attention = result.deadline
    ? result.deadline
    : result.isPossibleScam
      ? (spanish ? "Revise las posibles señales de estafa" : "Possible scam signals need review")
      : result.whatTheyNeed[0] ?? (spanish ? "No se encontró ningún requisito urgente" : "No urgent requirement found");

  return (
    <section aria-label={spanish ? "Resumen de la carta" : "Letter summary"} className="grid gap-3 lg:grid-cols-3">
      <article className="letter-summary-card">
        <span className="letter-icon-well text-cobalt"><DocumentIcon className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-cobalt">
            1 · {spanish ? "Qué significa" : "What it means"}
          </p>
          <h2 className="mt-3 text-lg font-bold tracking-[-0.025em] text-ink">
            {result.documentType}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
            {result.meaning}
          </p>
        </div>
      </article>

      <article className="letter-summary-card border-amber/35 bg-[#fff8df]">
        <span className="letter-icon-well bg-white/80 text-[#795a18]"><ShieldAlertIcon className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#795a18]">
            2 · {spanish ? "Qué necesita atención" : "What needs attention"}
          </p>
          <p className="mt-3 text-lg font-bold tracking-[-0.025em] text-ink">
            {attention}
          </p>
          <p className="mt-2 text-sm font-semibold text-[#795a18]">
            {urgencyLabel}
          </p>
        </div>
      </article>

      <article className="letter-summary-card border-cobalt/20 bg-[#eef2ff]">
        <span className="letter-icon-well bg-white/80 text-cobalt"><CheckIcon className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-cobalt">
            3 · {spanish ? "Qué hacer ahora" : "What to do next"}
          </p>
          <p className="mt-3 text-lg font-bold tracking-[-0.025em] text-ink">
            {nextStep?.step ?? (spanish ? "Revise la carta original" : "Review the original letter")}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#53628b]">
            {nextStep?.detail ?? (spanish ? "Confirme los datos importantes con la oficina indicada en el documento." : "Confirm important details with the office named on the document.")}
          </p>
        </div>
      </article>
    </section>
  );
}

export function LetterMobilePreview({ preview, spanish = false }: { preview: string; spanish?: boolean }) {
  return (
    <details className="rounded-card border border-ink/10 bg-surface p-4 md:hidden">
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-bold text-ink">
        {spanish ? "Ver la carta original" : "View the original letter"}
      </summary>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={spanish ? "Su carta" : "Your letter"}
        className="mt-3 max-h-[70vh] w-full rounded-xl border border-ink/10 object-contain"
        src={preview}
      />
    </details>
  );
}
