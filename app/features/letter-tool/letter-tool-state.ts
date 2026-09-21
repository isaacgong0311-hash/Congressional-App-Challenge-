import type { Category } from "../../resources";

export type Step = { step: string; detail: string };
export type ChecklistItem = { item: string; why: string };
export type ResponseLetter = { applicable: boolean; kind: string; body: string };

export type Result = {
  documentType: string;
  category: Category;
  confidence: number;
  whyThisType: string;
  urgency: "low" | "medium" | "high";
  meaning: string;
  keyDetails: {
    sender: string | null;
    contactPhone: string | null;
    accountNumber: string | null;
    amountDue: string | null;
  };
  whatTheyNeed: string[];
  documentChecklist: ChecklistItem[];
  responseLetter: ResponseLetter;
  nextSteps: Step[];
  phoneScript: string;
  deadline: string | null;
  deadlineISO: string | null;
  isPossibleScam: boolean;
  scamSigns: string[];
  isCrisis: boolean;
  crisisMessage: string;
  scamAgencyFacts: string;
  whatHappensIfNothing: string;
  photoQualityNote: string | null;
  detectedLetterLanguage: string | null;
  originalText: string;
};

export type LetterToolView =
  | { status: "intro" }
  | { status: "image_ready"; previewUrl: string }
  | { status: "processing"; previewUrl: string; step: number }
  | { status: "result"; previewUrl: string | null; result: Result }
  | { status: "error"; message: string; recoverable: boolean };

export function isLetterResult(value: unknown): value is Result {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.documentType === "string" &&
    typeof candidate.meaning === "string" &&
    typeof candidate.urgency === "string" &&
    typeof candidate.keyDetails === "object" &&
    candidate.keyDetails !== null &&
    Array.isArray(candidate.whatTheyNeed) &&
    Array.isArray(candidate.documentChecklist) &&
    Array.isArray(candidate.nextSteps) &&
    typeof candidate.responseLetter === "object" &&
    candidate.responseLetter !== null &&
    typeof candidate.phoneScript === "string" &&
    typeof candidate.whatHappensIfNothing === "string" &&
    typeof candidate.originalText === "string"
  );
}

export function deriveLetterToolView({
  error,
  previewUrl,
  processingStep,
  result,
}: {
  error: string | null;
  previewUrl: string | null;
  processingStep: number | null;
  result: Result | null;
}): LetterToolView {
  if (processingStep !== null && previewUrl) {
    return { status: "processing", previewUrl, step: processingStep };
  }
  if (error) return { status: "error", message: error, recoverable: true };
  if (result) return { status: "result", previewUrl, result };
  if (previewUrl) return { status: "image_ready", previewUrl };
  return { status: "intro" };
}
