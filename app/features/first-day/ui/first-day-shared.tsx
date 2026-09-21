import type { ReactNode } from "react";

import type { Fact, FirstDayCase } from "../domain/types";
import { EyeIcon } from "./icons";

export type SourceOpener = (
  evidenceId: string,
  trigger: HTMLButtonElement,
) => void;

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
      .find((event) =>
        event.type === "school_confirmation_recorded" &&
        event.conflictId === conflict.id,
      );
    const selectedFactId =
      selected?.type === "school_confirmation_recorded"
        ? selected.selectedFactId
        : undefined;
    if (!selectedFactId && conflict.status === "open") state = "conflicted";
    if (selectedFactId && selectedFactId !== fact.id) state = "superseded";
    if (
      selected?.type === "school_confirmation_recorded" &&
      selectedFactId === fact.id
    ) {
      state = "confirmed";
      value = selected.reportedValue;
    }
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
  highlight = false,
  label,
  onClick,
}: {
  highlight?: boolean;
  label: string;
  onClick: (button: HTMLButtonElement) => void;
}) {
  return (
    <button
      className="fd-source-button"
      data-demo-target={highlight ? "true" : undefined}
      onClick={(event) => onClick(event.currentTarget)}
      type="button"
    >
      <EyeIcon className="h-4 w-4" />
      {label}
    </button>
  );
}
