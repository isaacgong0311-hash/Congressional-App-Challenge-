import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

import { extractOuterJson } from "../../../lib/extract-json";

export type FirstDayPageExtractionInput = {
  bytes: Uint8Array;
  mediaType: "image/jpeg" | "image/png";
  language: string;
  documentId: string;
  requestId: string;
  signal: AbortSignal;
};

const RESPONSE_SHAPE = `{
  "schemaVersion": "first-day-extraction-v1",
  "requestId": string,
  "documentId": string,
  "document": {
    "label": string,
    "confidence": number 0-100,
    "originalText": string,
    "photoQualityNote": string or null
  },
  "facts": [{
    "clientKey": lowercase-kebab-case string,
    "kind": "date" | "location" | "requested_item" | "contact" | "appointment" | "informational_note",
    "semanticKey": lowercase event.field string,
    "label": string,
    "originalValue": string,
    "normalizedValue": string or null,
    "quote": string,
    "location": string,
    "confidence": number 0-100
  }]
}`;

export async function runGroqExtraction({
  bytes,
  mediaType,
  language,
  documentId,
  requestId,
  signal,
}: FirstDayPageExtractionInput): Promise<unknown> {
  const { text } = await generateText({
    model: groq("meta-llama/llama-4-scout-17b-16e-instruct"),
    abortSignal: signal,
    messages: [
      {
        role: "system",
        content: [
          "You extract source-backed facts from one school enrollment document page.",
          `Write labels in ${language}. Preserve names, dates, locations, and contact details exactly as printed.`,
          "Return verbatim document text and proposed facts only.",
          "Every fact quote must appear exactly in originalText.",
          "Use semantic keys in event.field form.",
          "Do not produce tasks, eligibility decisions, district rules, conflict resolutions, or inferred requirements.",
          "Leave normalizedValue null for ambiguous or relative dates.",
          "Use a normalized YYYY-MM-DD value only for a complete, unambiguous calendar date.",
          "If the page is hard to read, lower confidence and describe the visible problem in photoQualityNote.",
          "Return one JSON object with exactly this shape and no markdown:",
          RESPONSE_SHAPE,
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract page facts for documentId ${documentId} and requestId ${requestId}.`,
          },
          { type: "image", image: bytes, mediaType },
        ],
      },
    ],
  });

  return extractOuterJson(text);
}
