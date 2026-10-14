import type { Metadata } from "next";

import { fictionalCase } from "../features/first-day/content/fictional-case";
import { FirstDayWorkspace } from "../features/first-day/ui/first-day-workspace";
import { presentationModeFromDemoParam } from "../features/first-day/ui/first-day-view";

export const metadata: Metadata = {
  title: "First Day | Lantern",
  description:
    "Turn school enrollment instructions into a plan you can understand, check, and complete.",
};

export default async function FirstDayPage({
  searchParams,
}: {
  searchParams: Promise<{
    demo?: string | string[];
    present?: string | string[];
    lang?: string | string[];
  }>;
}) {
  const query = await searchParams;
  return (
    <FirstDayWorkspace
      initialCase={query.lang === "es" ? { ...fictionalCase, language: "Español" } : fictionalCase}
      initialDemoMode={query.demo === "1"}
      initialPresentationMode={presentationModeFromDemoParam(query.demo, query.present)}
    />
  );
}
