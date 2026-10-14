import type { Metadata } from "next";

import LetterWorkspace from "../features/letter-tool/letter-workspace";

export const metadata: Metadata = {
  title: "Explain a Letter | Lantern",
  description:
    "Turn a confusing official letter into plain language, next actions, and verified help.",
};

export default async function ExplainPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const query = await searchParams;
  return <LetterWorkspace initialLanguage={query.lang === "es" ? "Spanish" : null} />;
}
