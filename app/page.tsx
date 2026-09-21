import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  DocumentLineIcon,
  QuoteIcon,
  ShieldCheckIcon,
} from "./components/lantern/brand";
import { ProductHeader } from "./components/lantern/product-header";
import { SiteFooter } from "./components/lantern/site-footer";

export const metadata: Metadata = {
  title: "Lantern — School instructions, turned into a plan",
  description:
    "Lantern First Day turns scattered school instructions into a source-backed plan families can inspect, correct, and carry with them.",
};

const metrics = [
  ["32/32", "exact quotes covered"],
  ["8/8", "intended conflicts found"],
  ["34/34", "ready tasks sourced"],
] as const;

const stages = [
  {
    number: "01",
    title: "Bring instructions together",
    copy: "Keep related letters, reminders, and office notes in one case without erasing where each instruction came from.",
    icon: DocumentLineIcon,
  },
  {
    number: "02",
    title: "Check every important fact",
    copy: "Review dates, places, and requests beside the exact words that support them. Confirm, correct, or leave them unclear.",
    icon: QuoteIcon,
  },
  {
    number: "03",
    title: "Carry a plan you can explain",
    copy: "See what is ready, blocked, waiting, or done—and why—then print it or add only confirmed dates to a calendar.",
    icon: CheckCircleIcon,
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <ProductHeader />

      <main>
        <section className="relative overflow-hidden border-b border-ink/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,rgba(53,86,212,.16),transparent_28rem),radial-gradient(circle_at_14%_78%,rgba(231,178,62,.15),transparent_24rem)]" />
          <div className="relative mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:px-12 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cobalt/20 bg-white/75 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-cobalt shadow-sm">
                <span className="h-2 w-2 rounded-full bg-amber" />
                Lantern · First Day
              </div>
              <h1 className="mt-7 max-w-3xl text-balance font-serif text-[clamp(3.5rem,7.5vw,7.2rem)] leading-[.92] tracking-[-0.055em] text-ink">
                A school plan you can trace back to the page.
              </h1>
              <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-muted sm:text-xl">
                Lantern turns scattered enrollment instructions into one source-backed plan families can inspect, correct, and trust.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link className="lantern-primary-cta" href="/first-day?demo=1">
                  Try the fictional First Day case
                  <ArrowUpRightIcon className="h-5 w-5" />
                </Link>
                <Link className="lantern-secondary-cta" href="/explain">
                  Explain a confusing letter
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
                <span className="inline-flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-confirmed" /> No account</span>
                <span className="inline-flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-confirmed" /> No cloud case history</span>
                <span className="inline-flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-confirmed" /> English + Spanish</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-cobalt/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-ink p-5 text-white shadow-[0_35px_90px_rgba(17,34,27,.25)] sm:p-7">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber">Fictional case preview</p>
                    <p className="mt-1 text-sm text-white/60">Mesa View · Rivera family</p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/75">3 pages</span>
                </div>

                <div className="mt-5 space-y-3">
                  <article className="ml-5 rounded-[1.35rem] border border-white/12 bg-white/8 p-5 backdrop-blur-md">
                    <div className="flex items-center gap-3 text-white/60">
                      <DocumentLineIcon className="h-5 w-5 text-amber" />
                      <span className="text-xs font-bold uppercase tracking-[0.16em]">Welcome letter · Page 1</span>
                    </div>
                    <p className="mt-4 font-serif text-xl leading-8 text-white/92">“Family orientation will be held in the school cafeteria…”</p>
                  </article>

                  <article className="mr-8 rounded-[1.35rem] border border-cobalt/20 bg-[#eef2ff] p-5 text-ink shadow-xl">
                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.15em] text-cobalt">
                      <QuoteIcon className="h-4 w-4" /> Exact evidence
                    </div>
                    <p className="mt-3 font-semibold">Orientation location</p>
                    <p className="mt-1 text-sm text-muted">School cafeteria · waiting for family review</p>
                  </article>

                  <article className="ml-10 rounded-[1.35rem] bg-white p-5 text-ink shadow-2xl">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-muted">Your next step</p>
                        <p className="mt-2 text-lg font-bold">Confirm where orientation begins</p>
                      </div>
                      <span className="rounded-full bg-[#fff0ca] px-3 py-1 text-xs font-extrabold text-[#765515]">Needs clarity</span>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="proof-title" className="border-b border-ink/10 bg-surface">
          <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_2fr] lg:px-12">
            <div>
              <p className="lantern-eyebrow">Measured offline</p>
              <h2 className="mt-2 text-balance font-serif text-3xl tracking-[-0.035em]" id="proof-title">Evidence, not a vague AI promise.</h2>
              <p className="mt-3 text-sm leading-6 text-muted">Results from 20 synthetic held-out packets. Provider speed and cost were not measured in this offline run.</p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3">
              {metrics.map(([value, label]) => (
                <div className="rounded-card border border-ink/10 bg-canvas px-5 py-6" key={label}>
                  <dt className="text-sm font-semibold text-muted">{label}</dt>
                  <dd className="mt-2 text-3xl font-black tracking-[-0.04em] text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28" aria-labelledby="flow-title">
          <div className="max-w-3xl">
            <p className="lantern-eyebrow">From scattered pages to one plan</p>
            <h2 className="lantern-section-title" id="flow-title">Calm enough for families. Rigorous enough to inspect.</h2>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {stages.map((stage) => {
              const Icon = stage.icon;
              return (
                <article className="group rounded-feature border border-ink/10 bg-surface p-7 shadow-[0_18px_50px_rgba(20,36,30,.06)] transition-transform hover:-translate-y-1 sm:p-8" key={stage.number}>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cobalt/10 text-cobalt"><Icon className="h-6 w-6" /></span>
                    <span className="font-mono text-xs font-bold tracking-[0.18em] text-muted">{stage.number}</span>
                  </div>
                  <h3 className="mt-8 text-2xl font-bold tracking-[-0.03em]">{stage.title}</h3>
                  <p className="mt-4 text-base leading-7 text-muted">{stage.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-ink/10 bg-surface" aria-labelledby="families-title">
          <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
            <p className="lantern-eyebrow">For real family questions</p>
            <h2 className="mt-3 max-w-4xl text-balance font-serif text-4xl tracking-[-0.04em] sm:text-5xl" id="families-title">
              The hard part is rarely one sentence. It is knowing what matters together.
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ["The date is on one page.", "The location is buried in another reminder."],
                ["Two letters disagree.", "The family needs a question—not a silent guess."],
                ["A requirement is still unclear.", "The next safe step should stay visible without pretending it is resolved."],
              ].map(([problem, detail]) => (
                <article className="rounded-card border border-ink/10 bg-canvas p-6" key={problem}>
                  <p className="text-xl font-bold tracking-[-0.025em] text-ink">{problem}</p>
                  <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#10241c] text-white" aria-labelledby="difference-title">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:px-12 lg:py-28">
            <div>
              <p className="lantern-eyebrow is-on-dark">The difference</p>
              <h2 className="mt-4 max-w-2xl text-balance font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-6xl" id="difference-title">Lantern refuses to hide uncertainty.</h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/68">When two documents disagree, Lantern keeps both sources visible, prepares the question to ask, and waits for the family to record what the school said.</p>
              <Link className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-amber px-5 font-bold text-ink transition hover:-translate-y-0.5 hover:bg-[#f0c35d] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white" href="/first-day/how-it-works">
                See how decisions are made <ArrowUpRightIcon className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {["School cafeteria", "Gym entrance"].map((value, index) => (
                <article className="rounded-feature border border-white/12 bg-white/7 p-6 backdrop-blur-sm" key={value}>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber">Source {index + 1}</p>
                  <p className="mt-5 font-serif text-3xl">{value}</p>
                  <p className="mt-3 text-sm leading-6 text-white/60">Exact quote stays attached to its original page.</p>
                </article>
              ))}
              <article className="rounded-feature border border-amber/30 bg-amber/10 p-6 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber">Prepared question</p>
                <p className="mt-3 text-lg font-semibold leading-7 text-[#fff1c9]">“I found two different entrances. Which should our family use for orientation?”</p>
              </article>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28" aria-labelledby="trust-title">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-feature border border-ink/10 bg-surface p-8 shadow-[0_18px_50px_rgba(20,36,30,.06)] sm:p-10">
              <ShieldCheckIcon className="h-9 w-9 text-confirmed" />
              <p className="lantern-eyebrow mt-7">Private by default</p>
              <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em]" id="trust-title">No account. No cloud case history.</h2>
              <p className="mt-5 text-base leading-7 text-muted">The fictional demo stays in the page. Live images are sent to the configured external provider one at a time, and Lantern does not create a saved family account.</p>
            </article>
            <article className="rounded-feature border border-cobalt/20 bg-[#edf1ff] p-8 sm:p-10">
              <DocumentLineIcon className="h-9 w-9 text-cobalt" />
              <p className="lantern-eyebrow mt-7 text-cobalt">Another Lantern tool</p>
              <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em]">One confusing letter?</h2>
              <p className="mt-5 text-base leading-7 text-[#52628e]">Upload a bill, benefit notice, utility letter, or official form and get a plain-language explanation, next-step checklist, and help preparing a response.</p>
              <Link className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-cobalt px-5 font-bold text-white transition hover:-translate-y-0.5 hover:bg-cobalt-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber" href="/explain">
                Open the letter explainer <ArrowUpRightIcon className="h-5 w-5" />
              </Link>
            </article>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="mx-auto max-w-[1344px] overflow-hidden rounded-[2.25rem] bg-cobalt px-7 py-12 text-white shadow-[0_28px_80px_rgba(53,86,212,.25)] sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-16 lg:py-16">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/90">A calmer first day</p>
              <h2 className="mt-4 max-w-3xl text-balance font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-5xl">See the complete evidence-to-plan journey with no upload and no AI key.</h2>
            </div>
            <Link className="mt-8 inline-flex min-h-13 shrink-0 items-center gap-2 rounded-xl bg-white px-6 font-extrabold text-cobalt transition hover:-translate-y-0.5 hover:bg-[#f7f8ff] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber lg:mt-0" href="/first-day?demo=1">
              Start the guided demo <ArrowUpRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
