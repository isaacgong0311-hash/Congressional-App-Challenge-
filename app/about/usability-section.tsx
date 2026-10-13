import type { PublicUsabilityReport } from "../../evaluation/usability/public-report";

export function aboutLimitsCopy(report: PublicUsabilityReport) {
  return report.status === "Not started"
    ? "Lantern has synthetic regression tests, not a completed real-family study. It does not replace school staff, legal advice, or the source document. The next responsible step is learning with consenting families and educators—not inventing proof that does not exist yet."
    : "Lantern has synthetic regression tests and sessions with consenting adults using fictional documents. Those observations do not establish real-world impact. Lantern does not replace school staff, legal advice, or the source document. We will keep testing with families and educators before making broader claims.";
}

export function UsabilitySection({ report }: { report: PublicUsabilityReport }) {
  if (report.status === "Not started") return null;

  return (
    <section className="info-shell pb-8" aria-labelledby="usability-title">
      <div className="info-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] !text-cobalt">
          Human observations · {report.status}
        </p>
        <h2 className="mt-4 font-serif text-3xl tracking-[-0.035em]" id="usability-title">
          What we learned from testing
        </h2>
        <p className="mt-4 max-w-3xl">
          Consenting adults used fictional school documents. These are observations
          from those sessions, not a measure of impact on real family cases.
        </p>
        {report.entries.length > 0 ? (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {report.entries.map((entry) => (
              <li className="rounded-2xl border border-ink/10 bg-[#f8faf6] p-5" key={`${entry.date}-${entry.participantRole}-${entry.finding}`}>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-cobalt">
                  {entry.participantRole} · {entry.date}
                </p>
                <p className="mt-3 font-semibold text-ink">{entry.finding}</p>
                <p className="mt-3 text-sm text-muted">Change made: {entry.changeMade}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted">No reviewed changes are documented yet.</p>
        )}
      </div>
    </section>
  );
}
