import type { Metadata } from "next";
import Link from "next/link";

import { aboutHeroCopy, team } from "../../content/team";
import usabilityReportJson from "../../evaluation/usability/report.json";
import { parsePublicUsabilityReport } from "../../evaluation/usability/public-report";
import {
  ArrowUpRightIcon,
  DocumentLineIcon,
  QuoteIcon,
  ShieldCheckIcon,
} from "../components/lantern/brand";
import { ProductHeader } from "../components/lantern/product-header";
import { SiteFooter } from "../components/lantern/site-footer";
import { aboutLimitsCopy, UsabilitySection } from "./usability-section";

const usabilityReport = parsePublicUsabilityReport(usabilityReportJson);

export const metadata: Metadata = {
  title: "About | Lantern",
  description:
    `Meet the ${team.length === 1 ? "student" : "team"} behind Lantern and see how the project turns source evidence into a family-reviewed plan.`,
};

const principles = [
  {
    title: "AI reads",
    detail:
      "The reading model proposes facts from a document. It is not allowed to decide what a family should believe or mark complete.",
    icon: DocumentLineIcon,
  },
  {
    title: "Evidence stays visible",
    detail:
      "Dates, locations, and requirements remain connected to the exact passage that supported them—even after a correction.",
    icon: QuoteIcon,
  },
  {
    title: "Families decide",
    detail:
      "People confirm answers, preserve uncertainty, and record what a school actually said. Deterministic code updates the plan.",
    icon: ShieldCheckIcon,
  },
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <ProductHeader active="about" />
      <main className="info-page">
        <section className="info-shell info-hero">
          <p className="lantern-eyebrow">A student-built public-interest project</p>
          <h1 className="info-display">Paperwork should not decide who feels prepared.</h1>
          <p className="info-lead">{aboutHeroCopy(team)}</p>
          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Lantern team">
            {team.map(({ name, role }) => (
              <li className="rounded-full border border-cobalt/15 bg-white/75 px-4 py-2 text-sm font-semibold text-ink shadow-sm" key={name}>
                {name} <span className="font-normal text-slate-600">· {role}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="lantern-primary-cta" href="/first-day?demo=1">
              See the fictional demo <ArrowUpRightIcon className="h-5 w-5" />
            </Link>
            <a
              className="lantern-secondary-cta"
              href="https://github.com/isaacgong0311-hash/Congressional-App-Challenge-"
              rel="noreferrer"
              target="_blank"
            >
              Inspect the source code <ArrowUpRightIcon className="h-5 w-5" />
            </a>
          </div>
        </section>

        <section className="info-shell info-grid three-column" aria-label="How Lantern works">
          {principles.map(({ detail, icon: Icon, title }) => (
            <article className="info-card" key={title}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef2ff] text-cobalt">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-7 text-3xl">{title}</h2>
              <p className="mt-4">{detail}</p>
            </article>
          ))}
        </section>

        <section className="info-shell info-grid two-column">
          <article className="info-card info-card-dark">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] !text-amber">
              What is real
            </p>
            <h2 className="mt-4 text-4xl !text-white">A public-source example.</h2>
            <p className="mt-5 !text-white/70">
              The optional workflow references public Round Rock ISD enrollment
              pages. It is an independent student example. The district has not
              partnered with, reviewed, or endorsed Lantern.
            </p>
          </article>
          <article className="info-card">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] !text-cobalt">
              What is fictional
            </p>
            <h2 className="mt-4 text-4xl">A safe, complete demonstration.</h2>
            <p className="mt-5">
              Mesa View Community Schools, the Rivera family, their letters, and
              their plan are synthetic. The demo proves the workflow without
              asking anyone to upload a real family document.
            </p>
          </article>
        </section>

        <section className="info-shell pb-8" aria-label="Access and pricing">
          <div className="info-card">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] !text-cobalt">
              Access and pricing
            </p>
            <h2 className="mt-4 text-3xl">Lantern is free for families.</h2>
            <p className="mt-4 max-w-3xl">
            Lantern is a student project, and we are committed to keeping it free
            for families. There is no subscription, no paywall, and no account
            required. We will keep testing with families and educators as we
            improve it.
            </p>
            <Link className="mt-5 inline-flex font-bold text-cobalt underline decoration-cobalt/30 underline-offset-4" href="/contact">
              Share feedback or ask about a future pilot <ArrowUpRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

        <UsabilitySection report={usabilityReport} />

        <section className="info-shell pb-20">
          <div className="rounded-[2rem] border border-amber/35 bg-[#fff8df] p-7 sm:p-10">
            <h2 className="font-serif text-3xl tracking-[-0.035em]">Built to be honest about its limits.</h2>
            <p className="mt-4 max-w-4xl leading-7 text-[#5f512d]">
              {aboutLimitsCopy(usabilityReport)}
            </p>
            <Link className="mt-6 inline-flex font-bold text-cobalt underline decoration-cobalt/30 underline-offset-4" href="/contact">
              Share feedback or discuss a future pilot <ArrowUpRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
