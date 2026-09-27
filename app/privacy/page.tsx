import type { Metadata } from "next";

import { ProductHeader } from "../components/lantern/product-header";
import { SiteFooter } from "../components/lantern/site-footer";

export const metadata: Metadata = {
  title: "Privacy | Lantern",
  description: "How Lantern handles documents, case data, and preferences.",
};

const commitments = [
  {
    title: "No account or cloud case history",
    detail:
      "Lantern does not create a family profile or save a case for later. First Day documents, extracted text, facts, tasks, and event history stay in the current page memory.",
  },
  {
    title: "Live uploads use an external provider",
    detail:
      "When live reading is available, each page image is sent over an encrypted connection to Groq for processing. Groq receives the page only for inference under the project's configured data controls. Close or refresh the page to clear the in-memory case.",
  },
  {
    title: "PDF preparation stays in your browser",
    detail:
      "Lantern opens a selected PDF in this browser and turns each page into an image. The original PDF is never uploaded; only the prepared page images are sent one at a time for reading.",
  },
  {
    title: "The fictional demo needs no provider",
    detail:
      "The built-in Mesa View case contains only synthetic names, documents, and procedures. It can demonstrate the complete workflow without uploading a real document.",
  },
  {
    title: "Only interface preferences persist",
    detail:
      "Lantern stores a versioned preference containing language, large-text, and high-contrast choices. It does not place document contents or case records in local storage, session storage, or IndexedDB.",
  },
  {
    title: "Short-lived abuse protection",
    detail:
      "AI routes use a salted one-way hash of the network address and route to count requests. The limiter stores no document data, and its longest counter expires within 24 hours.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <ProductHeader active="privacy" />
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="lantern-eyebrow">Lantern privacy</p>
        <h1 className="mt-4 max-w-4xl text-balance font-serif text-5xl leading-[1.02] tracking-[-0.045em] sm:text-7xl">
          Useful in the moment. Not a permanent family record.
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-muted">
          Lantern is designed to help a family understand a document and carry away a plan without creating another account or saved case history.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {commitments.map((commitment) => (
            <article className="rounded-feature border border-ink/10 bg-surface p-7 shadow-[0_16px_44px_rgba(20,36,30,.05)]" key={commitment.title}>
              <h2 className="text-xl font-bold tracking-[-0.025em]">{commitment.title}</h2>
              <p className="mt-4 text-sm leading-7 text-muted">{commitment.detail}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-feature border border-amber/35 bg-[#fff8df] p-7">
          <h2 className="text-xl font-bold">Before using a real document</h2>
          <p className="mt-3 text-sm leading-7 text-[#584719]">
            Cover information the tool does not need, such as Social Security numbers, full bank details, or unrelated medical information. Lantern provides reading assistance—not legal, school, financial, or official advice.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
