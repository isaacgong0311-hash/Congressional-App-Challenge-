# Lantern baseline audit

Audited: 2026-09-15  
Imported source: `isaacgong0311-hash/TRANSLATEtheform` at `479ff86a30890c76a4ec0240406e66d9de4aa6ce`

## What is present

The source is a Next.js 16.2.9 App Router application using React 19.2.4, TypeScript 5, Tailwind CSS 4, Vercel AI SDK 6, and Zod 4. It has no database, authentication, server-side case history, or existing test runner.

The home page in `app/page.tsx` contains the general letter workflow, sample-letter path, accessibility controls, help finder, print/calendar actions, and response-letter presentation. `app/Assistant.tsx` contains typed and browser-speech ask/practice modes.

## API and provider map

| Route | Provider and purpose | Limits and behavior |
| --- | --- | --- |
| `POST /api/explain` | Groq, Llama 4 Scout vision; returns Zod-validated letter explanation JSON | Node runtime; 60-second max duration; image only; 10 MB per request; malformed model output returns 502 |
| `POST /api/ask` | Groq, grounded question answering and simulated call practice | Node runtime; 30-second max duration; last 12 messages; requires already-extracted context |
| `POST /api/translate-field` | Groq, translates one response field | Node runtime; 20-second max duration; input is truncated to 6,000 characters |
| `POST /api/speak` | ElevenLabs multilingual text-to-speech | Node runtime; 30-second max duration; optional; text is truncated to 2,500 characters; browser speech is the fallback |
| `POST /api/local-help` | Perplexity Sonar web-grounded resource lookup | Node runtime; 30-second max duration; optional; location inputs are sanitized and truncated to 60 characters |
| `GET /api/health` | Local environment-key status | Returns degraded/503 when the required Groq key is absent |

The imported `middleware.ts` applies per-IP, per-route rate limits in process memory. These counters are not shared between serverless instances. Next.js 16 builds it successfully but warns that the convention is deprecated in favor of `proxy.ts`.

## Data lifecycle

- The selected image is held in browser memory, sent as multipart form data to `/api/explain`, converted to bytes in the route, and sent to Groq.
- Application code does not write the uploaded image, extracted text, case, or assistant transcript to a database or file.
- Groq, ElevenLabs, and Perplexity are external processors when their respective features are used. Provider-side retention is governed by the provider account and terms, not by this codebase.
- Accessibility preferences for high contrast and large text use browser `localStorage` keys `ttf-hc` and `ttf-lt`.
- The server logs provider errors. The explain route also logs up to 2,000 characters of malformed raw model output on schema failure; this output can contain extracted letter text and must be considered when making privacy claims.
- The application does not intentionally log image bytes.

## Baseline verification

Commands were run before First Day behavior changes:

- `npm ci`: passed. npm reported 14 dependency advisories: 5 low, 2 moderate, 6 high, and 1 critical. No forced audit fix was applied because it could change the locked baseline.
- `npm run build`: passed when network access was available for the three `next/font` Google font downloads. It produced `/` and all six API routes.
- `npm run lint`: failed on the imported source. `app/page.tsx:188` synchronously restores state inside an effect, which violates `react-hooks/set-state-in-effect`. Five unused-code warnings are also present (`privacyOpen`, `setPrivacyOpen`, `PersonaCard`, `HowItWorks`, and `SectionHeader`).

No provider keys or personal documents were used during this audit, so live explanation, reply translation, speech, local search, calendar accuracy, and assistant response quality were not manually verified.

## Baseline risks to address

1. Correct the imported lint error without changing the visible preference behavior.
2. Rename `middleware.ts` to the supported Next.js 16 `proxy.ts` convention.
3. Add a deterministic test runner for First Day domain behavior.
4. Replace absolute privacy promises with wording that acknowledges external processing and possible server logs.
5. Audit dependency advisories before deployment; do not apply a breaking `npm audit fix --force` automatically.
