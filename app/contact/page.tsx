import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRightIcon } from "../components/lantern/brand";
import { ProductHeader } from "../components/lantern/product-header";
import { SiteFooter } from "../components/lantern/site-footer";

export const metadata: Metadata = {
  title: "Contact | Lantern",
  description:
    "Share feedback on Lantern or start a conversation about a family or school pilot.",
};

const inquiryPaths = [
  {
    title: "Families",
    detail:
      "Tell me which school instructions are hardest to untangle and what would make the plan easier to trust.",
  },
  {
    title: "Educators",
    detail:
      "Share the documents, handoffs, or recurring questions that create confusion for new families.",
  },
  {
    title: "District teams",
    detail:
      "Discuss a small, permission-based evaluation using synthetic or carefully redacted materials before any broader pilot.",
  },
] as const;

const issueUrl =
  "https://github.com/isaacgong0311-hash/Congressional-App-Challenge-/issues/new?title=Lantern%20pilot%20or%20feedback%20inquiry";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <ProductHeader active="contact" />
      <main className="info-page">
        <section className="info-shell info-hero">
          <p className="lantern-eyebrow">Contact / pilot interest</p>
          <h1 className="info-display">Help shape the next honest test.</h1>
          <p className="info-lead">
            Lantern is a student project, not a district service. If you see a
            useful next step—or a flaw worth fixing—I&apos;d like to hear it.
          </p>
        </section>

        <section className="info-shell info-grid three-column" aria-label="Ways to contribute feedback">
          {inquiryPaths.map((path) => (
            <article className="info-card" key={path.title}>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] !text-cobalt">
                For
              </p>
              <h2 className="mt-4 text-3xl">{path.title}</h2>
              <p className="mt-4">{path.detail}</p>
            </article>
          ))}
        </section>

        <section className="info-shell pb-20">
          <div className="grid overflow-hidden rounded-[2rem] border border-ink/10 bg-surface shadow-[0_28px_80px_rgba(20,36,30,.09)] lg:grid-cols-[1.15fr_.85fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="lantern-eyebrow">Open a conversation</p>
              <h2 className="mt-4 max-w-xl font-serif text-4xl tracking-[-0.04em] sm:text-5xl">
                Send feedback through the public project.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-muted">
                GitHub provides a working contact path without pretending this
                site stores a waitlist or private form submission. Please do not
                include student records, document images, or other sensitive
                family information.
              </p>
              <a className="lantern-primary-cta mt-7" href={issueUrl} rel="noreferrer" target="_blank">
                Start a pilot or feedback inquiry <ArrowUpRightIcon className="h-5 w-5" />
              </a>
            </div>
            <aside className="bg-ink p-7 text-white sm:p-10 lg:p-12">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber">Before sharing</p>
              <ul className="mt-6 space-y-4 text-sm leading-6 text-white/75">
                <li>Do not attach a real child&apos;s school document.</li>
                <li>Describe the workflow problem, not private case details.</li>
                <li>No submission is stored by Lantern itself.</li>
              </ul>
              <Link className="mt-8 inline-flex font-bold text-white underline decoration-white/30 underline-offset-4" href="/privacy">
                Read the privacy explanation
              </Link>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
