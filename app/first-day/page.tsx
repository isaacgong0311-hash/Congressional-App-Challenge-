import type { Metadata } from "next";

import { fictionalCase } from "../features/first-day/content/fictional-case";
import { FirstDayWorkspace } from "../features/first-day/ui/first-day-workspace";

export const metadata: Metadata = {
  title: "First Day | Lantern",
  description:
    "Turn school enrollment instructions into a plan you can understand, check, and complete.",
};

export default function FirstDayPage() {
  return <FirstDayWorkspace initialCase={fictionalCase} />;
}
