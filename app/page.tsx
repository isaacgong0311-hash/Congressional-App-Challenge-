import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  DocumentLineIcon,
  LanternMark,
  QuoteIcon,
  ShieldCheckIcon,
} from "./components/lantern/brand";
import { ProductHeader } from "./components/lantern/product-header";
import { SiteFooter } from "./components/lantern/site-footer";
import { competitionProof } from "./features/first-day/content/competition-proof";
import "./styles/home.css";

export const metadata: Metadata = {
  title: "Lantern — School instructions, turned into a plan",
  description:
    "Bring school letters together, check what matters, and leave with a clear plan for your family's first day.",
};

const stages = [
  {
    number: "01",
    title: "Gather the pieces.",
    copy: "Bring school letters, reminders, and office notes into one place. Each page keeps its own identity.",
    detail: "Your documents, together",
    icon: DocumentLineIcon,
  },
  {
    number: "02",
    title: "Make sense of them.",
    copy: "Check dates, places, and requirements beside the original words. You decide what is confirmed.",
    detail: "Every fact has a source",
    icon: QuoteIcon,
  },
  {
    number: "03",
    title: "Know your next step.",
    copy: "Follow a clear checklist, work through unanswered questions, and take a printable plan with you.",
    detail: "A plan you can carry",
    icon: CheckCircleIcon,
  },
] as const;

export default function HomePage() {
  return (
    <div className="lantern-home">
      <a className="home-skip" href="#main-content">
        Skip to content
      </a>
      <ProductHeader />
      <main id="main-content">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-container home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-kicker">
                <span className="home-status-dot" /> A little clarity for a big
                first day
              </p>
              <h1 id="home-title">
                Less paperwork.
                <br />
                More <em>peace of mind.</em>
              </h1>
              <p className="home-lead">
                School letters can be overwhelming. Lantern brings them together
                into a clear, step-by-step plan—so your family knows what comes
                next.
              </p>
              <div className="home-hero-actions">
                <Link
                  className="home-button"
                  href="/first-day?demo=1"
                >
                  See Lantern in action <ArrowUpRightIcon />
                </Link>
                <a className="home-text-link" href="#how-it-works">
                  How it works <span aria-hidden="true">↓</span>
                </a>
              </div>
              <p className="home-small-note">
                <CheckCircleIcon /> 3-minute demo <span>·</span> No account or
                upload needed
              </p>
            </div>
            <figure
              className="home-preview"
              aria-label="Fictional example of a school plan with source-linked instructions"
            >
              <figcaption className="home-preview-caption">
                <span>
                  <span className="home-status-dot" /> A clearer picture
                </span>
                <span>Fictional case preview</span>
              </figcaption>
              <div className="home-plan-window">
                <div className="home-window-bar">
                  <span>
                    <LanternMark /> Lantern{" "}
                    <span className="home-window-divider">/</span> First Day
                  </span>
                  <span
                    className="home-family-avatar"
                    aria-label="Rivera family"
                  >
                    R
                  </span>
                </div>
                <div className="home-window-body">
                  <div className="home-plan-heading">
                    <div>
                      <p className="home-label">MESA VIEW · RIVERA FAMILY</p>
                      <h2>Your first day, organized.</h2>
                    </div>
                    <span className="home-plan-date">
                      Sample
                      <br />
                      <strong>school plan</strong>
                    </span>
                  </div>
                  <div className="home-plan-tabs" aria-hidden="true">
                    <span>3 documents</span>
                    <span>Review facts</span>
                    <span className="is-selected">Your plan</span>
                  </div>
                  <div className="home-task">
                    <span className="home-task-check">
                      <CheckCircleIcon />
                    </span>
                    <div>
                      <h3>Gather enrollment documents</h3>
                      <p>Keep the required paperwork together.</p>
                      <span className="home-source-ref">
                        <DocumentLineIcon /> Welcome letter · Page 1
                      </span>
                    </div>
                    <span className="home-pill">Ready</span>
                  </div>
                  <div className="home-task">
                    <span className="home-task-check">
                      <CheckCircleIcon />
                    </span>
                    <div>
                      <h3>Go to the enrollment meeting</h3>
                      <p>Mesa View Welcome Center</p>
                      <span className="home-source-ref">
                        <DocumentLineIcon /> Office note · Page 3
                      </span>
                    </div>
                    <span className="home-pill">Ready</span>
                  </div>
                  <div className="home-task home-task-unclear">
                    <span className="home-question-mark">?</span>
                    <div>
                      <h3>Confirm the orientation location</h3>
                      <p>Two pages list different places. Let’s check.</p>
                    </div>
                    <span className="home-pill home-pill-amber">
                      Ask the school
                    </span>
                  </div>
                  <div className="home-plan-footnote">
                    <ShieldCheckIcon /> Every step connects back to your
                    documents.
                  </div>
                </div>
              </div>
              <div className="home-evidence-note">
                <span className="home-evidence-icon">
                  <QuoteIcon />
                </span>
                <div>
                  <strong>Clarity you can check.</strong>
                  <p>Original words. Always one step away.</p>
                </div>
                <CheckCircleIcon className="home-evidence-check" />
              </div>
            </figure>
          </div>
          <div className="home-container">
            <div className="home-trust-strip">
              <span>Made for the people behind the paperwork.</span>
              <ul>
                <li>
                  <ShieldCheckIcon /> No saved family account
                </li>
                <li>
                  <QuoteIcon /> Source-linked instructions
                </li>
                <li>
                  <span className="home-language-icon" aria-hidden="true">
                    A / Ñ
                  </span>{" "}
                  English + Spanish
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section
          className="home-section home-container"
          id="how-it-works"
          aria-labelledby="flow-title"
        >
          <div className="home-section-heading">
            <div>
              <p className="home-kicker">A simple way forward</p>
              <h2 id="flow-title">
                From a stack of letters
                <br />
                to a little more certainty.
              </h2>
            </div>
            <p>
              You don’t need to figure everything out at once. Just take it one
              step at a time.
            </p>
          </div>
          <div className="home-steps">
            {stages.map(({ number, title, copy, detail, icon: Icon }) => (
              <article className="home-step" key={number}>
                <div className="home-step-top">
                  <span className="home-step-icon">
                    <Icon />
                  </span>
                  <span className="home-step-number">{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{copy}</p>
                <div className="home-step-detail">
                  <CheckCircleIcon /> {detail}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="home-container" aria-labelledby="difference-title">
          <div className="home-difference">
            <div className="home-difference-copy">
              <p className="home-kicker">Clarity includes the unknowns</p>
              <h2 id="difference-title">
                When the letters disagree,
                <br />
                <em>you deserve to know.</em>
              </h2>
              <p>
                A cafeteria on one page. A gym entrance on another. Lantern
                keeps both sources visible and helps you prepare the right
                question for the school.
              </p>
              <Link className="home-text-link" href="/first-day/how-it-works">
                See how decisions are made <ArrowUpRightIcon />
              </Link>
            </div>
            <div className="home-comparison">
              <div className="home-comparison-sources">
                <article>
                  <span className="home-label">
                    <DocumentLineIcon /> WELCOME LETTER · P. 1
                  </span>
                  <p>“School cafeteria”</p>
                </article>
                <span
                  className="home-conflict-symbol"
                  aria-label="Conflicting locations"
                >
                  ≠
                </span>
                <article>
                  <span className="home-label">
                    <DocumentLineIcon /> REMINDER · P. 2
                  </span>
                  <p>“Gym entrance”</p>
                </article>
              </div>
              <div className="home-question">
                <span className="home-label">YOUR QUESTION, READY TO ASK</span>
                <p>“Which entrance should our family use for orientation?”</p>
                <span className="home-question-footer">
                  <span className="home-status-dot" /> Waiting for the school’s
                  answer
                </span>
              </div>
              <p className="home-example-label">
                Illustrative example · The family confirms the answer.
              </p>
            </div>
          </div>
        </section>
        <section
          className="home-section home-container home-support"
          aria-labelledby="trust-title"
        >
          <article className="home-privacy">
            <span className="home-support-icon">
              <ShieldCheckIcon />
            </span>
            <p className="home-kicker">Room to feel comfortable</p>
            <h2 id="trust-title">
              Your family’s next chapter.
              <br />
              Your information to control.
            </h2>
            <p>
              Try the complete fictional demo without sharing a document. No
              account, no saved cloud case history. For live documents, images
              are sent to the reading provider only when you submit them.
            </p>
            <Link className="home-text-link" href="/privacy">
              How we handle your information <ArrowUpRightIcon />
            </Link>
          </article>
          <article className="home-letter-card">
            <div className="home-letter-illustration" aria-hidden="true">
              <div className="home-mini-letter">
                <DocumentLineIcon />
                <span />
                <span />
                <span />
              </div>
              <span className="home-letter-badge">
                <QuoteIcon />
              </span>
            </div>
            <p className="home-kicker">Beyond the first day</p>
            <h2>One confusing letter?</h2>
            <p>
              A bill, benefit notice, or official form. Get a plain-language
              explanation and help deciding what to do next.
            </p>
            <Link className="home-text-link" href="/explain">
              Explain a confusing letter <ArrowUpRightIcon />
            </Link>
          </article>
        </section>
        <section className="home-proof" aria-labelledby="proof-title">
          <div className="home-container home-proof-grid">
            <div>
              <p className="home-kicker">Built to be checked</p>
              <h2 id="proof-title">Small details. Real accountability.</h2>
              <p>
                Measured offline across {competitionProof.packetCount} synthetic
                held-out packets.
              </p>
            </div>
            <dl>
              {competitionProof.metrics
                .filter((metric) => metric.id !== "dates")
                .map((metric) => (
                  <div key={metric.id}>
                    <dt>{metric.label}</dt>
                    <dd>{metric.value}</dd>
                  </div>
                ))}
            </dl>
            <p className="home-proof-note">
              {competitionProof.limitation} These are evaluation results on
              fictional documents, not a guarantee for every real-world
              document.
            </p>
          </div>
        </section>
        <section
          className="home-final home-container"
          aria-labelledby="final-title"
        >
          <span className="home-final-mark">
            <LanternMark />
          </span>
          <p className="home-kicker">One less thing to worry about</p>
          <h2 id="final-title">
            A new school.
            <br />
            <em>A clearer start.</em>
          </h2>
          <p>
            Meet the Rivera family’s sample case and see how a few scattered
            pages become a plan.
          </p>
          <Link className="home-button" href="/first-day?demo=1">
            Start the guided demo <ArrowUpRightIcon />
          </Link>
          <span className="home-final-note">
            Fictional documents. A real look at how Lantern works.
          </span>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
