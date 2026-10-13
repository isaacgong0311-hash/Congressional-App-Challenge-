import { z } from "zod";

import { parseUsabilityDataset } from "./summary";

const findingSchema = z.object({
  participantRole: z.string().trim().min(1).max(80),
  date: z.iso.date(),
  finding: z.string().trim().min(1).max(400),
  changeMade: z.string().trim().min(1).max(400),
}).strict();

const publicReportSchema = z.object({
  status: z.enum(["Not started", "Preliminary", "Complete"]),
  entries: z.array(findingSchema),
}).strict();

export type PublicUsabilityReport = z.infer<typeof publicReportSchema>;

export function parsePublicUsabilityReport(input: unknown): PublicUsabilityReport {
  return publicReportSchema.parse(input);
}

export function buildPublicUsabilityReport(
  datasetInput: unknown,
  findingsInput: unknown,
): PublicUsabilityReport {
  const dataset = parseUsabilityDataset(datasetInput);
  const entries = z.array(findingSchema).parse(findingsInput);
  if (dataset.studyStatus === "not_started" && entries.length > 0) {
    throw new Error("Usability findings require recorded participant sessions.");
  }

  return {
    status: dataset.studyStatus === "not_started"
      ? "Not started"
      : dataset.studyStatus === "complete"
        ? "Complete"
        : "Preliminary",
    entries,
  };
}
