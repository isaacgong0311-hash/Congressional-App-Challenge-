"use client";

import dynamic from "next/dynamic";
import type { Dispatch, SetStateAction } from "react";

import { CRISIS_RESOURCES, RESOURCES, SCAM_RESOURCE } from "../../resources";
import type { Result } from "./letter-tool-state";
import { LetterMobilePreview, LetterResultOverview } from "./letter-result-overview";
import { Collapsible, Detail, LocalHelpFinder, ResourceRow } from "./letter-support";

const Assistant = dynamic(() => import("../../Assistant"), {
  loading: () => (
    <div className="rounded-card border border-ink/10 bg-white p-5 text-sm text-muted">
      Preparing the practice assistant…
    </div>
  ),
  ssr: false,
});

type LanguageOption = { label: string; bcp47: string; tts: string };

const URGENCY_STYLES: Record<Result["urgency"], string> = {
  high: "bg-red-100 text-red-800 border-red-300",
  medium: "bg-amber-100 text-amber-800 border-amber-300",
  low: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const URGENCY_LABEL: Record<Result["urgency"], string> = {
  high: "Urgent",
  medium: "Time-sensitive",
  low: "Not urgent",
};

function syllableCount(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized || normalized.length <= 3) return 1;
  const stripped = normalized.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return Math.max(1, matches ? matches.length : 1);
}

function fleschKincaidGrade(text: string): number {
  if (!text?.trim()) return 0;
  const sentences = Math.max(1, (text.match(/[.!?]+/g) ?? []).length);
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const syllables = words.reduce((sum, word) => sum + syllableCount(word), 0);
  return Math.max(1, Math.round(0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59));
}

function daysUntil(iso: string): number {
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

export function LetterResults({
  activeTab,
  checked,
  copiedLetter,
  dir,
  lang,
  preview,
  result,
  scamExpanded,
  simplify,
  speaking,
  translatedLetter,
  translatingLetter,
  copyLetter,
  downloadCalendar,
  downloadLetter,
  printLetter,
  readAloud,
  reset,
  setActiveTab,
  setScamExpanded,
  toggleChecked,
  translateLetter,
}: {
  activeTab: 0 | 1 | 2;
  checked: Set<number>;
  copiedLetter: boolean;
  dir: "ltr" | "rtl";
  lang: LanguageOption;
  preview: string | null;
  result: Result;
  scamExpanded: boolean;
  simplify: boolean;
  speaking: boolean;
  translatedLetter: string | null;
  translatingLetter: boolean;
  copyLetter: () => void;
  downloadCalendar: () => void;
  downloadLetter: () => void;
  printLetter: () => void;
  readAloud: () => void;
  reset: () => void;
  setActiveTab: Dispatch<SetStateAction<0 | 1 | 2>>;
  setScamExpanded: Dispatch<SetStateAction<boolean>>;
  toggleChecked: (index: number) => void;
  translateLetter: () => Promise<void>;
}) {
  const kd = result.keyDetails;
  const hasDetails = Boolean(kd && (kd.sender || kd.contactPhone || kd.accountNumber || kd.amountDue));
  const hasActions = result.nextSteps.length > 0 || result.whatTheyNeed.length > 0 || result.documentChecklist.length > 0 || (result.responseLetter.applicable && Boolean(result.responseLetter.body)) || Boolean(result.phoneScript);

  return (
          <section
            className="mt-6 space-y-4"
            lang={lang.bcp47}
            aria-label="Explanation of your letter"
            aria-live="polite"
          >
            {/* Human-in-loop banner + FK grade */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-600">
              <span><span className="font-semibold">Lantern explains — it doesn&apos;t decide.</span> Always confirm with the office named on your letter before taking action.</span>
              {result.originalText && (() => {
                const before = fleschKincaidGrade(result.originalText);
                const after = fleschKincaidGrade(result.meaning);
                return (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    Grade {before} → Grade {after}
                  </span>
                );
              })()}
            </div>

            <LetterResultOverview
              result={result}
              urgencyLabel={URGENCY_LABEL[result.urgency]}
            />

            {preview ? <LetterMobilePreview preview={preview} /> : null}


            {result.photoQualityNote && (
              <div className="ttf-fade-in rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                📷 {result.photoQualityNote}
              </div>
            )}

            {result.isPossibleScam && (
              <div
                role="alert"
                className="ttf-fade-in rounded-2xl border-2 border-orange-500 bg-orange-50 p-4"
              >
                <p className="font-bold text-orange-900">
                  🚩 This may be a scam — please be careful
                </p>
                {result.scamSigns.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 ps-5 text-orange-900">
                    {result.scamSigns.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-sm text-orange-800">
                  Do not send money, gift cards, or personal information until you
                  confirm this is real by contacting the organization through an
                  official phone number you look up yourself.
                </p>
                {result.scamAgencyFacts && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setScamExpanded((v) => !v)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-orange-900 underline-offset-2 hover:underline focus-visible:outline-none"
                      aria-expanded={scamExpanded}
                    >
                      {scamExpanded ? "▾" : "▸"} Why we flagged this — what the real agency does
                    </button>
                    {scamExpanded && (
                      <p className="mt-2 rounded-lg bg-white/70 p-3 text-sm text-orange-900">
                        {result.scamAgencyFacts}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {result.isCrisis && result.crisisMessage && (
              <div
                role="alert"
                className="ttf-fade-in rounded-2xl border-2 border-red-400 bg-red-50 p-4"
              >
                <p className="font-semibold text-red-800">⚠️ This needs attention soon</p>
                <p className="mt-1 text-red-800">{result.crisisMessage}</p>
              </div>
            )}

            {/* Side-by-side on desktop: letter image on left, tabs on right */}
            <div className={preview ? "md:grid md:grid-cols-[minmax(220px,.72fr)_minmax(0,1.28fr)] md:items-start md:gap-5" : ""}>
              {preview && (
                <div className="hidden md:flex md:flex-col md:gap-2 md:pt-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Your letter" className="max-h-[70vh] w-full rounded-card border border-ink/10 bg-white object-contain shadow-[0_18px_45px_rgba(20,36,30,.08)]" />
                  <div className="flex flex-wrap gap-1">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${URGENCY_STYLES[result.urgency]}`}>{URGENCY_LABEL[result.urgency]}</span>
                    {result.keyDetails?.amountDue && <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">💵 {result.keyDetails.amountDue}</span>}
                    {result.keyDetails?.contactPhone && <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-600">📞 {result.keyDetails.contactPhone}</span>}
                  </div>
                </div>
              )}

            {/* Tab bar */}
            <div className="overflow-hidden rounded-feature border border-ink/10 bg-surface shadow-[0_18px_55px_rgba(20,36,30,.07)]">
              <div className="flex border-b border-ink/10 bg-canvas/60 p-1.5" role="tablist">
                {(["Understand", "Take Action", "Get Help"] as const).map((label, i) => (
                  <button
                    key={label}
                    role="tab"
                    aria-selected={activeTab === i}
                    onClick={() => setActiveTab(i as 0 | 1 | 2)}
                    className={`min-h-11 flex-1 rounded-xl px-3 py-2 text-sm font-bold transition focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-amber ${
                      activeTab === i
                        ? "bg-white text-cobalt shadow-sm"
                        : "text-muted hover:bg-white/60 hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Tab 0 — Understand */}
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
                          {result.documentType}
                        </p>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${URGENCY_STYLES[result.urgency]}`}>
                          {URGENCY_LABEL[result.urgency]}
                        </span>
                        {result.detectedLetterLanguage && result.detectedLetterLanguage !== "English" && (
                          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            Letter in {result.detectedLetterLanguage}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <h2 className="text-xl font-bold">What this means</h2>
                        <button
                          onClick={readAloud}
                          className="flex flex-none items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                          aria-pressed={speaking}
                        >
                          {speaking ? "⏹ Stop" : "🔊 Read aloud"}
                        </button>
                      </div>
                      <p className="mt-2 text-base leading-relaxed text-slate-700">{result.meaning}</p>
                      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                        <p><span className="font-semibold">Why I think this:</span> {result.whyThisType}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-semibold">Confidence:</span>
                          <span className="inline-flex h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                            <span className={`h-full ${result.confidence >= 60 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${result.confidence}%` }} />
                          </span>
                          <span>{result.confidence}%</span>
                        </div>
                        {result.confidence < 60 && (
                          <p className="mt-1 text-amber-700">Please double-check — the photo may be unclear.</p>
                        )}
                      </div>
                    </div>

                    {result.deadline && (
                      <div className={`rounded-2xl p-4 ${
                        result.deadlineISO && daysUntil(result.deadlineISO) <= 7
                          ? "border-2 border-red-400 bg-red-50"
                          : result.deadlineISO && daysUntil(result.deadlineISO) <= 14
                          ? "border border-orange-300 bg-orange-50"
                          : "border border-amber-300 bg-amber-50"
                      }`}>
                        <p className={`font-semibold ${result.deadlineISO && daysUntil(result.deadlineISO) <= 7 ? "text-red-900" : "text-amber-900"}`}>📅 Important date</p>
                        <p className={`mt-1 ${result.deadlineISO && daysUntil(result.deadlineISO) <= 7 ? "text-red-900" : "text-amber-900"}`}>{result.deadline}</p>
                        {result.deadlineISO && (() => {
                          const days = daysUntil(result.deadlineISO);
                          return (
                            <p className={`mt-1 text-sm font-semibold ${days <= 7 ? "text-red-700" : days <= 14 ? "text-orange-700" : "text-amber-700"}`}>
                              {days < 0 ? "This date has passed." : days === 0 ? "Due today!" : `${days} day${days === 1 ? "" : "s"} away`}
                            </p>
                          );
                        })()}
                        <p className="mt-1 text-sm text-amber-700">Double-check this date on the letter yourself before acting.</p>
                        {result.deadlineISO && (
                          <button onClick={downloadCalendar} className="mt-3 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 transition hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
                            Add reminder to calendar
                          </button>
                        )}
                      </div>
                    )}

                    {result.whatHappensIfNothing && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="font-semibold text-slate-800">💭 What happens if you do nothing?</p>
                        <p className="mt-1 text-sm text-slate-700">{result.whatHappensIfNothing}</p>
                      </div>
                    )}

                    {hasDetails && (
                      <Collapsible title="Key details" subtitle="Read from your letter by AI — double-check against the original">
                        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {kd!.sender && <Detail label="From" value={kd!.sender} />}
                          {kd!.contactPhone && <Detail label="Phone" value={kd!.contactPhone} />}
                          {kd!.accountNumber && <Detail label="Account / case #" value={kd!.accountNumber} />}
                          {kd!.amountDue && <Detail label="Amount" value={kd!.amountDue} />}
                        </dl>
                      </Collapsible>
                    )}
                  </div>
                )}

                {/* Tab 1 — Take Action */}
                {activeTab === 1 && (
                  <div className="space-y-4">
                    {result.nextSteps.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold">Your next steps</h2>
                        <ol className="mt-3 space-y-4">
                          {result.nextSteps.map((s, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{i + 1}</span>
                              <div>
                                <p className="font-semibold text-slate-900">{s.step}</p>
                                <p className="text-slate-700">{s.detail}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {result.whatTheyNeed.length > 0 && (
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <h2 className="font-bold text-slate-900">What they need from you</h2>
                        <ul className="mt-2 space-y-1.5">
                          {result.whatTheyNeed.map((item, i) => (
                            <li key={i} className="flex gap-2 text-slate-700"><span className="text-blue-600">•</span><span>{item}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.documentChecklist.length > 0 && (
                      <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h2 className="font-bold text-slate-900">Documents to gather</h2>
                          <span className="text-sm font-medium text-slate-500">{checked.size} of {result.documentChecklist.length} ready</span>
                        </div>
                        <ul className="mt-2 space-y-2">
                          {result.documentChecklist.map((c, i) => {
                            const done = checked.has(i);
                            return (
                              <li key={i}>
                                <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${done ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                                  <input type="checkbox" checked={done} onChange={() => toggleChecked(i)} className="mt-0.5 h-5 w-5 flex-none rounded border-slate-300 text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" />
                                  <span>
                                    <span className={`font-medium ${done ? "text-emerald-900 line-through" : "text-slate-900"}`}>{c.item}</span>
                                    {c.why && <span className="block text-sm text-slate-500">{c.why}</span>}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}

                    {result.responseLetter.applicable && result.responseLetter.body && (
                      <Collapsible accent icon={<span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-blue-100 text-base">✍️</span>} title="Your reply, already written" subtitle={result.responseLetter.kind ? `${result.responseLetter.kind} · tap to read, print, or send` : "Tap to read, print, or send"}>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-slate-600">We drafted a reply you can print, sign, and send. It&apos;s written in English because that&apos;s what the office reads. Fill in anything in [brackets] and check it before sending.</p>
                          {lang.label !== "English" && (
                            <button onClick={() => void translateLetter()} disabled={translatingLetter} className="flex-none rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50">
                              {translatingLetter ? "Translating…" : translatedLetter ? "Show English" : `Translate to ${lang.label}`}
                            </button>
                          )}
                        </div>
                        {translatedLetter && <p className="mt-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700">Showing {lang.label} translation — send the English version above to the office.</p>}
                        <pre className="ttf-scroll mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-serif text-sm leading-relaxed text-slate-800">{translatedLetter ?? result.responseLetter.body}</pre>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={copyLetter} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">{copiedLetter ? "✓ Copied" : "Copy"}</button>
                          <button onClick={downloadLetter} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">Download</button>
                          <button onClick={printLetter} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">Print</button>
                        </div>
                      </Collapsible>
                    )}

                    {result.phoneScript && (
                      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <h2 className="text-xl font-bold text-blue-900">📞 What to say when you call</h2>
                        <p className="mt-2 italic leading-relaxed text-blue-900">&ldquo;{result.phoneScript}&rdquo;</p>
                        <div className="mt-4 flex flex-wrap items-start gap-4">
                          {kd?.contactPhone && (
                            <a href={`tel:${kd.contactPhone.replace(/[^+\d]/g, "")}`} className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2">
                              Call {kd.contactPhone}
                            </a>
                          )}
                          <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-white p-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=88x88&format=png&data=${encodeURIComponent(result.phoneScript + (kd?.contactPhone ? `\n\nCall: ${kd.contactPhone}` : ""))}`} alt="QR code — scan to save the phone script on your phone" width={88} height={88} className="rounded-lg" />
                            <p className="max-w-[120px] text-xs leading-relaxed text-slate-600">Scan to get this script on your phone</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!hasActions && (
                      <p className="text-sm text-slate-500">No specific actions required for this document.</p>
                    )}
                  </div>
                )}

                {/* Tab 2 — Get Help */}
                {activeTab === 2 && (
                  <div className="space-y-4">
                    <Assistant
                      context={{
                        documentType: result.documentType,
                        category: result.category,
                        meaning: result.meaning,
                        deadline: result.deadline,
                        whatTheyNeed: result.whatTheyNeed,
                        keyDetails: result.keyDetails,
                      }}
                      lang={lang}
                      simplify={simplify}
                      dir={dir}
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold">Real help you can use now</h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">✓ Verified</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">These are real national programs from official sources — not AI-generated. We never invent phone numbers.</p>
                      <ul className="mt-3 space-y-2">
                        {result.isPossibleScam && <ResourceRow resource={SCAM_RESOURCE} />}
                        {result.isCrisis && CRISIS_RESOURCES.map((r) => <ResourceRow key={r.name} resource={r} />)}
                        {RESOURCES[result.category].map((r) => <ResourceRow key={r.name} resource={r} />)}
                      </ul>
                    </div>

                    <LocalHelpFinder category={result.category} />
                  </div>
                )}
              </div>
            </div>
            </div> {/* closes side-by-side wrapper */}

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <span className="font-semibold">⚠️ AI can make mistakes.</span>{" "}
              Always verify critical dates, amounts, and requirements directly on
              your original letter before acting. For legal or immigration
              matters, consult a qualified professional.
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-1 print:hidden">
              <button
                onClick={() => window.print()}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Save as PDF
              </button>
              <button
                onClick={reset}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Explain another letter
              </button>
            </div>
          </section>
  );
}

