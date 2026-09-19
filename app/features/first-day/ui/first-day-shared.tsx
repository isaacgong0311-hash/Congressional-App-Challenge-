import type { ReactNode } from "react";

import type { CaseEvent, Fact, FirstDayCase } from "../domain/types";
import { EyeIcon } from "./icons";

export type SourceOpener = (
  evidenceId: string,
  trigger: HTMLButtonElement,
) => void;

function isFactChangeEvent(
  event: CaseEvent,
): event is Extract<
  CaseEvent,
  { type: "fact_confirmed" | "fact_corrected" }
> {
  return event.type === "fact_confirmed" || event.type === "fact_corrected";
}

export function currentFactView(caseData: FirstDayCase, fact: Fact) {
  let value = fact.originalValue;
  let state = fact.confirmationState;

  for (const event of caseData.events) {
    if (event.type === "fact_confirmed" && event.factId === fact.id) {
      state = "confirmed";
    }
    if (event.type === "fact_corrected" && event.factId === fact.id) {
      state = "confirmed";
      value = event.value;
    }
    if (event.type === "fact_marked_unclear" && event.factId === fact.id) {
      state = "unclear";
    }
  }

  const conflict = caseData.conflicts.find((item) =>
    item.factIds.includes(fact.id),
  );
  if (conflict) {
    const selected = [...caseData.events]
      .reverse()
      .filter(isFactChangeEvent)
      .find((event) => conflict.factIds.includes(event.factId));
    if (selected && selected.factId !== fact.id) state = "superseded";
  }

  return { state, value };
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#52625c]">
      {children}
    </p>
  );
}

export function SourceButton({
  label,
  onClick,
}: {
  label: string;
  onClick: (button: HTMLButtonElement) => void;
}) {
  return (
    <button
      className="fd-source-button"
      onClick={(event) => onClick(event.currentTarget)}
      type="button"
    >
      <EyeIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
