import type { Metadata } from "next";
import Link from "next/link";

import { ProductHeader } from "../../components/lantern/product-header";
import { SiteFooter } from "../../components/lantern/site-footer";
import { competitionProof } from "../../features/first-day/content/competition-proof";

export const metadata: Metadata = {
  title: "How First Day works | Lantern",
  description:
    "See how Lantern turns exact document evidence into a deterministic, source-backed school enrollment plan.",
};

const stages = [
  {
    number: "01",
    name: "Document",
    owner: "AI proposes",
    detail:
      "A family adds a page. The provider returns extracted text, but the page remains the record Lantern checks.",
    example:
      "Welcome letter · “Family orientation will be held in the school cafeteria…”",
  },
  {
    number: "02",
    name: "Exact evidence",
    owner: "AI proposes · code validates",
    detail:
      "Every proposed fact must include a verbatim passage that exists in that page’s extracted text.",
    example:
      "Evidence · “Family orientation will be held in the school cafeteria on August 14, 2026…”",
  },
  {
    number: "03",
    name: "Confirmed fact",
    owner: "Family decides",
    detail:
      "The proposal does not affect the plan until a person confirms, corrects, or marks it unclear.",
    example: "Orientation location · School cafeteria · Confirmed",
  },
  {
    number: "04",
    name: "Explicit dependency",
    owner: "Student-authored rule",
    detail:
      "Each task names the facts, earlier tasks, and reviewed procedures it depends on. Missing information stays missing.",
    example: "Confirm orientation · needs one confirmed location fact",
  },
  {
    number: "05",
    name: "Derived task state",
    owner: "Deterministic code",
    detail:
      "The planner derives Ready, Waiting, Needs clarification, Needs review, or Done from those records—never from a model guess.",
    example: "Confirm orientation · Ready",
  },
] as const;

export default function HowFirstDayWorksPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <ProductHeader active="how" />
      <main className="overflow-hidden">
      <div className="relative border-b border-[#dce2dd] bg-[#14271f] text-white">
        <div className="absolute -right-24 -top-36 h-96 w-96 rounded-full bg-[#4868e8]/25 blur-3xl" />
        <div className="absolute -bottom-28 left-[18%] h-72 w-72 rounded-full bg-[#f7c864]/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
          <Link
            className="inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f7c864]"
            href="/first-day"
          >
            ← Back to First Day
          </Link>
          <p className="mt-14 text-xs font-bold uppercase tracking-[0.2em] text-[#f7c864]">
            Technical explanation
          </p>
          <h1 className="mt-5 max-w-4xl text-balance font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-7xl">
            A plan you can trace back to the page.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-white/75">
            First Day uses AI for reading assistance, then hands control to
            exact-quote validation, human confirmation, and deterministic
            planning rules.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <section aria-labelledby="pipeline-title">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4960ba]">
                The evidence pipeline
              </p>
              <h2
                className="mt-3 max-w-2xl font-serif text-4xl tracking-[-0.035em] sm:text-5xl"
                id="pipeline-title"
              >
                Five stages, one visible chain.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#56645d]">
              This example uses the fictional Mesa View packet. No real student,
              school, or policy appears below.
            </p>
          </div>

          <ol className="mt-10 grid gap-4" aria-label="Evidence pipeline stages">
            {stages.map((stage, index) => (
              <li
                className="group grid overflow-hidden rounded-[1.75rem] border border-[#dbe1dc] bg-white shadow-[0_18px_55px_rgba(24,46,38,.06)] md:grid-cols-[96px_1fr_1.15fr]"
                key={stage.name}
              >
                <div className="flex items-center justify-between bg-[#eaf0ff] px-6 py-5 text-[#3556d4] md:flex-col md:items-start md:justify-center md:px-7">
                  <span className="font-mono text-xs font-bold tracking-[0.18em]">
                    {stage.number}
                  </span>
                  {index < stages.length - 1 ? (
                    <span aria-hidden="true" className="text-xl md:mt-5 md:rotate-90">
                      →
                    </span>
                  ) : (
                    <span aria-hidden="true" className="text-xl md:mt-5">
                      ✓
                    </span>
                  )}
                </div>
                <div className="p-6 md:p-8">
                  <span className="inline-flex rounded-full bg-[#eef1ed] px-3 py-1 text-xs font-bold text-[#4d5d55]">
                    {stage.owner}
                  </span>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.025em]">
                    {stage.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#59675f]">
                    {stage.detail}
                  </p>
                </div>
                <div className="border-t border-[#e3e7e3] bg-[#fbfcf9] p-6 md:border-l md:border-t-0 md:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#68756e]">
                    Fictional record
                  </p>
                  <p className="mt-4 font-serif text-xl leading-8 text-[#25362f]">
                    {stage.example}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16 grid gap-5 lg:grid-cols-2" aria-labelledby="boundary-title">
          <div className="rounded-[2rem] bg-[#172a22] p-7 text-white sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7c864]">
              AI boundary
            </p>
            <h2 className="mt-4 font-serif text-3xl tracking-[-0.03em]" id="boundary-title">
              AI can propose. It cannot decide.
            </h2>
            <p className="mt-5 leading-7 text-white/72">
              The provider reads an uploaded page and proposes structured facts
              plus exact supporting quotes. A schema rejects malformed output;
              an exact-quote check rejects unsupported passages. The family still
              chooses what to confirm.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[#d7deda] bg-[#fffaf0] p-7 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8a6721]">
              Deterministic boundary
            </p>
            <h2 className="mt-4 font-serif text-3xl tracking-[-0.03em]">
              Unknown never becomes false—or true.
            </h2>
            <p className="mt-5 leading-7 text-[#5a604e]">
              Confirmations append history. Conflicts preserve both sources.
              Removed pages send affected tasks to review. Ready states come only
              from explicit facts, dependencies, and eligible procedure records.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-[2rem] border border-[#ccd6ff] bg-[#edf1ff] p-7 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4960ba]">
              Measured offline
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em]">
              {competitionProof.packetCount} synthetic held-out packets
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-[#45567f]">
              The versioned evaluation reports{" "}
              {competitionProof.metrics
                .map((metric) => `${metric.value} ${metric.label}`)
                .join(", ")}.
              {` `}{competitionProof.limitation}
            </p>
          </div>
          <Link
            className="mt-6 inline-flex min-h-12 shrink-0 items-center rounded-xl bg-[#3556d4] px-5 font-semibold text-white shadow-sm transition hover:bg-[#2948be] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3556d4] sm:mt-0"
            href="/first-day?demo=1"
          >
            Start the 3-minute demo →
          </Link>
        </section>

        <details className="mt-6 rounded-feature border border-ink/10 bg-white p-6">
          <summary className="min-h-11 cursor-pointer py-2 text-lg font-bold">
            Evaluation limits and technical details
          </summary>
          <div className="mt-4 grid gap-5 text-sm leading-6 text-muted md:grid-cols-2">
            <p>
              These results use synthetic, held-out packets—not real family documents. They test quote coverage, conflict detection, date normalization, and source retention; they do not establish accuracy for every school or document format.
            </p>
            <p>
              Live page reading depends on an external provider. Planning, dependency evaluation, conflict preservation, completion history, and portable export remain explicit code paths after extraction.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="lantern-primary-cta" href="/first-day?demo=1">Open guided demo</Link>
            <a className="lantern-secondary-cta" href="https://github.com/isaacgong0311-hash/Congressional-App-Challenge-" rel="noreferrer" target="_blank">View source repository ↗</a>
          </div>
        </details>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
