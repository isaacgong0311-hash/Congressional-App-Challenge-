export type CompetitionProofMetric = {
  id: "quotes" | "conflicts" | "dates" | "tasks";
  value: string;
  label: string;
  detail: string;
};

export type CompetitionProof = {
  packetCount: number;
  stack: readonly string[];
  metrics: readonly CompetitionProofMetric[];
  aiBoundary: string;
  codeBoundary: string;
  familyBoundary: string;
  limitation: string;
};

export const competitionProof: CompetitionProof = {
  packetCount: 20,
  stack: ["Next.js 16", "React 19", "TypeScript", "Zod", "Vitest", "Playwright"],
  metrics: [
    {
      id: "quotes",
      value: "32/32",
      label: "exact quotes covered",
      detail: "Every accepted proposal retained exact source evidence.",
    },
    {
      id: "conflicts",
      value: "8/8",
      label: "intended conflicts found",
      detail: "All intended conflicts were found with zero false positives.",
    },
    {
      id: "dates",
      value: "0/8",
      label: "date errors",
      detail: "No ambiguous date was incorrectly normalized.",
    },
    {
      id: "tasks",
      value: "34/34",
      label: "ready tasks sourced",
      detail: "Every ready task retained eligible source coverage.",
    },
  ],
  aiBoundary:
    "AI may read a page and propose structured facts with supporting quotes.",
  codeBoundary:
    "Typed code validates exact quotes, preserves conflicts, and derives task states from explicit dependencies.",
  familyBoundary:
    "A person confirms facts and records what the school said before the plan changes.",
  limitation:
    "Provider latency and cost were not measured in the offline run.",
};
