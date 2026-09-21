import { describe, expect, it } from "vitest";

import {
  deriveLetterToolView,
  isLetterResult,
  type Result,
} from "../../app/features/letter-tool/letter-tool-state";

const result = {
  documentType: "Notice",
  category: "other",
  confidence: 90,
  whyThisType: "Test",
  urgency: "low",
  meaning: "Test meaning",
  keyDetails: {
    sender: null,
    contactPhone: null,
    accountNumber: null,
    amountDue: null,
  },
  whatTheyNeed: [],
  documentChecklist: [],
  responseLetter: { applicable: false, kind: "", body: "" },
  nextSteps: [],
  phoneScript: "",
  deadline: null,
  deadlineISO: null,
  isPossibleScam: false,
  scamSigns: [],
  isCrisis: false,
  crisisMessage: "",
  scamAgencyFacts: "",
  whatHappensIfNothing: "",
  photoQualityNote: null,
  detectedLetterLanguage: "English",
  originalText: "Test",
} satisfies Result;

describe("letter tool view state", () => {
  it("rejects malformed provider results before rendering", () => {
    expect(isLetterResult({ meaning: "Missing the rest" })).toBe(false);
    expect(isLetterResult(result)).toBe(true);
  });
  it("derives intro and image review states", () => {
    expect(
      deriveLetterToolView({
        error: null,
        previewUrl: null,
        processingStep: null,
        result: null,
      }),
    ).toEqual({ status: "intro" });
    expect(
      deriveLetterToolView({
        error: null,
        previewUrl: "blob:preview",
        processingStep: null,
        result: null,
      }),
    ).toEqual({ status: "image_ready", previewUrl: "blob:preview" });
  });

  it("keeps processing, recoverable errors, and results distinct", () => {
    expect(
      deriveLetterToolView({
        error: null,
        previewUrl: "blob:preview",
        processingStep: 2,
        result: null,
      }),
    ).toMatchObject({ status: "processing", step: 2 });
    expect(
      deriveLetterToolView({
        error: "Try again",
        previewUrl: "blob:preview",
        processingStep: null,
        result: null,
      }),
    ).toEqual({ status: "error", message: "Try again", recoverable: true });
    expect(
      deriveLetterToolView({
        error: null,
        previewUrl: null,
        processingStep: null,
        result,
      }),
    ).toEqual({ status: "result", previewUrl: null, result });
  });
});
