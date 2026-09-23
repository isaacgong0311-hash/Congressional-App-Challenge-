"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductHeader } from "../../components/lantern/product-header";
import { CheckIcon } from "../../components/lantern/icons";
import { AccessibilityControls } from "../../components/lantern/primitives";
import { useLanternPreferences } from "../../components/lantern/use-lantern-preferences";
import {
  deriveLetterToolView,
  isLetterResult,
  type Result,
} from "./letter-tool-state";
import { LetterHelpScreen } from "./letter-help-screen";
import { LetterIntake } from "./letter-intake";
import { LetterResults } from "./letter-results";
import type { Category } from "../../resources";

const LANGUAGES: { label: string; bcp47: string; tts: string }[] = [
  { label: "English", bcp47: "en", tts: "en-US" },
  { label: "Spanish", bcp47: "es", tts: "es-ES" },
  { label: "Chinese (Simplified)", bcp47: "zh-Hans", tts: "zh-CN" },
  { label: "Vietnamese", bcp47: "vi", tts: "vi-VN" },
  { label: "Tagalog", bcp47: "tl", tts: "fil-PH" },
  { label: "Arabic", bcp47: "ar", tts: "ar-SA" },
  { label: "French", bcp47: "fr", tts: "fr-FR" },
  { label: "Haitian Creole", bcp47: "ht", tts: "fr-FR" },
  { label: "Korean", bcp47: "ko", tts: "ko-KR" },
  { label: "Russian", bcp47: "ru", tts: "ru-RU" },
];

const RTL_LANGS = new Set(["ar"]);

const LOADING_STEPS = [
  { label: "Reading your letter" },
  { label: "Finding important dates" },
  { label: "Checking for scam signals" },
  { label: "Matching verified programs" },
  { label: "Writing your reply" },
];

function buildIcs(dateISO: string, summary: string): string {
  const d = dateISO.replaceAll("-", "");
  const dt = new Date(dateISO);
  dt.setDate(dt.getDate() + 1);
  const end = dt.toISOString().slice(0, 10).replaceAll("-", "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lantern//EN",
    "BEGIN:VEVENT",
    `UID:${stamp}-translateform@local`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${d}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${summary.replace(/\n/g, " ")}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function LetterWorkspace() {
  const [language, setLanguage] = useState("English");
  const [simplify, setSimplify] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [translatedLetter, setTranslatedLetter] = useState<string | null>(null);
  const [translatingLetter, setTranslatingLetter] = useState(false);
  const { preferences, ready: preferencesReady, setPreferences } =
    useLanternPreferences();
  const highContrast = preferences.highContrast;
  const largeText = preferences.largeText;
  const [zip, setZip] = useState("");
  const [scamExpanded, setScamExpanded] = useState(false);
  const [photoQuality, setPhotoQuality] = useState<"ok" | "dark" | null>(null);
  const [whyNotOpen, setWhyNotOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [screen, setScreen] = useState<"app" | "help">("app");
  const [helpCategory, setHelpCategory] = useState<Category | null>(null);
  const [formTab, setFormTab] = useState<0 | 1 | 2>(0);
  const previewUrl = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const lang = LANGUAGES.find((l) => l.label === language) ?? LANGUAGES[0];
  const dir = RTL_LANGS.has(lang.bcp47) ? "rtl" : "ltr";

  useEffect(() => {
    if (!preferencesReady) return;
    const frame = window.requestAnimationFrame(() => {
      const browserLang = navigator.language?.slice(0, 2).toLowerCase();
      const match =
        LANGUAGES.find((item) => item.bcp47 === preferences.preferredLanguage) ??
        LANGUAGES.find(
          (item) =>
            item.bcp47 === browserLang || item.bcp47.startsWith(browserLang),
        );
      if (match) setLanguage(match.label);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [preferences.preferredLanguage, preferencesReady]);

  useEffect(() => {
    document.documentElement.lang = lang.bcp47;
    document.documentElement.dir = dir;
  }, [dir, lang.bcp47]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    };
  }, []);

  function toggleHC() {
    setPreferences((current) => ({
      ...current,
      highContrast: !current.highContrast,
    }));
  }

  function toggleLT() {
    setPreferences((current) => ({
      ...current,
      largeText: !current.largeText,
    }));
  }

  function chooseLanguage(nextLanguage: string) {
    const selected = LANGUAGES.find((item) => item.label === nextLanguage);
    setLanguage(nextLanguage);
    if (selected) {
      setPreferences((current) => ({
        ...current,
        preferredLanguage: selected.bcp47,
      }));
    }
  }

  async function checkPhotoQuality(f: File): Promise<"ok" | "dark"> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(f);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = Math.min(img.width, 200);
        canvas.height = Math.min(img.height, 200);
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); resolve("ok"); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
        const avg = sum / (d.length / 4);
        URL.revokeObjectURL(url);
        resolve(avg < 60 ? "dark" : "ok");
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve("ok"); };
      img.src = url;
    });
  }

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(
      () => setLoadingMsg((m) => (m + 1) % LOADING_STEPS.length),
      1800,
    );
    return () => clearInterval(id);
  }, [loading]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const url = URL.createObjectURL(f);
    previewUrl.current = url;
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(url);
    setPhotoQuality(null);
    void checkPhotoQuality(f).then(setPhotoQuality);
  }

  async function explain() {
    if (!file) return;
    stopSpeaking();
    setLoadingMsg(0);
    setLoading(true);
    setError(null);
    setResult(null);
    setChecked(new Set());
    setCopiedLetter(false);
    setTranslatedLetter(null);
    try {
      const body = new FormData();
      body.append("image", file);
      body.append("language", language);
      body.append("readingLevel", simplify ? "simple" : "standard");
      const res = await fetch("/api/explain", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else if (!isLetterResult(data)) {
        setError(
          "We couldn't safely read that response. Please try the photo again.",
        );
      } else {
        setResult(data);
        setActiveTab(0);
      }
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSample() {
    try {
      const res = await fetch("/sample-letter.png");
      const blob = await res.blob();
      const f = new File([blob], "sample-letter.png", { type: "image/png" });
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      const url = URL.createObjectURL(f);
      previewUrl.current = url;
      setFile(f);
      setResult(null);
      setError(null);
      setPreview(url);
    } catch {
      setError("Could not load the sample. Please upload your own photo.");
    }
  }

  function reset() {
    stopSpeaking();
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  function stopSpeaking() {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }

  async function readAloud() {
    if (!result || typeof window === "undefined") return;
    if (speaking) { stopSpeaking(); return; }

    const text = [
      result.meaning,
      result.whatTheyNeed.join(". "),
      ...result.nextSteps.map((s) => `${s.step}. ${s.detail}`),
      result.whatHappensIfNothing,
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 2500);

    // Try ElevenLabs high-quality multilingual TTS first.
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, bcp47: lang.bcp47 }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        setSpeaking(true);
        audio.onended = () => { setSpeaking(false); URL.revokeObjectURL(url); audioRef.current = null; };
        audio.onerror = () => { setSpeaking(false); URL.revokeObjectURL(url); audioRef.current = null; };
        void audio.play();
        return;
      }
    } catch {
      // fall through to browser TTS
    }

    // Browser SpeechSynthesis fallback (always available in Chrome/Safari).
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang.tts;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    setSpeaking(true);
  }

  function downloadCalendar() {
    if (!result?.deadlineISO) return;
    const ics = buildIcs(result.deadlineISO, `Deadline: ${result.documentType}`);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deadline.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleChecked(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function copyLetter() {
    const body = translatedLetter ?? result?.responseLetter.body;
    if (!body) return;
    try {
      await navigator.clipboard.writeText(body);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    } catch {
      // Clipboard can be blocked; the download button is the fallback.
    }
  }

  function downloadLetter() {
    const body = translatedLetter ?? result?.responseLetter.body;
    if (!body) return;
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-reply-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function printLetter() {
    const body = result?.responseLetter.body;
    if (!body || typeof window === "undefined") return;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const safe = body
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    w.document.write(
      `<pre style="font:14px/1.6 Georgia,serif;white-space:pre-wrap;padding:48px;max-width:680px;margin:auto">${safe}</pre>`,
    );
    w.document.close();
    w.focus();
    w.print();
  }

  async function translateLetter() {
    const body = result?.responseLetter.body;
    if (!body || lang.label === "English") return;
    if (translatedLetter) { setTranslatedLetter(null); return; } // toggle off
    setTranslatingLetter(true);
    try {
      const res = await fetch("/api/translate-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: body, language: lang.label }),
      });
      const data = (await res.json()) as { translation?: string; error?: string };
      if (res.ok && data.translation) setTranslatedLetter(data.translation);
    } catch { /* silent — original still shown */ } finally {
      setTranslatingLetter(false);
    }
  }

  const view = deriveLetterToolView({
    error,
    previewUrl: preview,
    processingStep: loading ? loadingMsg : null,
    result,
  });

  return (
    <div className="letter-app flex min-h-screen flex-col bg-canvas text-ink" data-high-contrast={highContrast ? "true" : undefined} data-letter-view={view.status} data-large-text={largeText ? "true" : undefined} dir={dir}>
      {/* Crisis accent: a calm but clear signal at the top of the page. */}
      {result?.isCrisis && (
        <div className="h-1.5 w-full bg-red-500" aria-hidden="true" />
      )}

      <ProductHeader
        active="explain"
        controls={
          <>
            <AccessibilityControls
              highContrast={highContrast}
              largeText={largeText}
              onToggleHighContrast={toggleHC}
              onToggleLargeText={toggleLT}
            />
            <span className="hidden items-center gap-1 rounded-full bg-[#e4f4e8] px-2.5 py-1 text-xs font-bold text-confirmed ring-1 ring-[#bbdec5] sm:inline-flex">
              <LockIcon /> Private
            </span>
          </>
        }
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8">

        {/* ── App (upload + results) ─────────────────────────── */}
        {screen === "app" && (
        <div className="mx-auto max-w-5xl py-8">
        <Link
          href="/"
          className="mb-5 flex min-h-11 items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          ← Lantern home
        </Link>

        {!loading && !result && !error ? (
          <div className="mb-7">
            <p className="lantern-eyebrow">Explain a letter</p>
            <h1 className="mt-3 text-balance font-serif text-4xl leading-tight tracking-[-0.04em] text-ink sm:text-5xl">
              Understand the letter. See what to do next.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              Take a clear photo or choose an image. Lantern will surface urgency, dates, amounts, scam signals, and practical next steps.
            </p>
          </div>
        ) : null}

        {!loading && !result && !error ? (
          <LetterIntake
            formTab={formTab}
            language={language}
            languages={LANGUAGES}
            loading={loading}
            loadingLabel={LOADING_STEPS[loadingMsg].label}
            onChooseLanguage={chooseLanguage}
            onExplain={() => void explain()}
            onFindHelp={() => {
              setHelpCategory(null);
              setScreen("help");
            }}
            onPick={onPick}
            onReset={reset}
            onSample={() => void loadSample()}
            photoQuality={photoQuality}
            preview={preview}
            setFormTab={setFormTab}
            setSimplify={setSimplify}
            setZip={setZip}
            simplify={simplify}
            zip={zip}
          />
        ) : null}

        {/* Visual progress steps */}
        {loading && (
          <div className="letter-processing-card mt-6" role="status" aria-label="Analyzing your letter">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="lantern-eyebrow">Working securely</p>
                <p className="mt-2 text-lg font-black tracking-[-0.025em] text-ink">Analyzing your letter</p>
                <p className="mt-1 text-sm text-muted">{LOADING_STEPS[loadingMsg].label}</p>
              </div>
              <span className="rounded-full border border-cobalt/20 bg-white px-3 py-1 text-xs font-extrabold text-cobalt">
                {loadingMsg + 1} of {LOADING_STEPS.length}
              </span>
            </div>
            <progress className="mt-4 h-2 w-full accent-cobalt" max={LOADING_STEPS.length} value={loadingMsg + 1} />
            <ol className="mt-5 grid gap-2 sm:grid-cols-2">
              {LOADING_STEPS.map((s, i) => {
                const done = i < loadingMsg;
                const active = i === loadingMsg;
                return (
                  <li key={i} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${done ? "border-confirmed/20 bg-[#e3f4e8] text-[#24633a]" : active ? "border-cobalt/25 bg-white font-bold text-cobalt" : "border-ink/8 bg-white/50 text-muted"}`}>
                    <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-extrabold ${done ? "bg-confirmed text-white" : active ? "bg-cobalt text-white" : "bg-canvas text-muted"}`}>
                      {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
                    </span>
                    <span>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div aria-live="polite" className="sr-only">
          {loading ? LOADING_STEPS[loadingMsg].label : result ? "Analysis complete" : ""}
        </div>

        {error && (
          <div
            role="alert"
            className="ttf-fade-in mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <span aria-hidden="true">⚠️</span>
            <div>
              <p className="font-semibold">We hit a snag</p>
              <p className="mt-0.5 text-sm">{error}</p>
              {file ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="min-h-11 rounded-xl bg-red-800 px-4 text-sm font-bold text-white hover:bg-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                    onClick={explain}
                    type="button"
                  >
                    Try again
                  </button>
                  <button
                    className="min-h-11 rounded-xl border border-red-300 bg-white px-4 text-sm font-bold text-red-800 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                    onClick={reset}
                    type="button"
                  >
                    Choose another photo
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {result ? (
          <LetterResults
            activeTab={activeTab}
            checked={checked}
            copiedLetter={copiedLetter}
            copyLetter={() => void copyLetter()}
            dir={dir}
            downloadCalendar={downloadCalendar}
            downloadLetter={downloadLetter}
            lang={lang}
            preview={preview}
            printLetter={printLetter}
            readAloud={() => void readAloud()}
            reset={reset}
            result={result}
            scamExpanded={scamExpanded}
            setActiveTab={setActiveTab}
            setScamExpanded={setScamExpanded}
            simplify={simplify}
            speaking={speaking}
            toggleChecked={toggleChecked}
            translatedLetter={translatedLetter}
            translateLetter={translateLetter}
            translatingLetter={translatingLetter}
          />
        ) : null}
        </div>
        )}

        {screen === "help" ? (
          <LetterHelpScreen
            category={helpCategory}
            onBack={() => {
              setHelpCategory(null);
              setScreen("app");
            }}
            onChooseCategory={setHelpCategory}
            onOpenLetter={() => setScreen("app")}
          />
        ) : null}
      </main>

      <footer className="mt-8 border-t border-slate-200/60 bg-white/70 py-5 print:hidden">
        <div className="mx-auto max-w-3xl space-y-3 px-6">
          <div className="text-center text-xs text-slate-500">
            This tool helps you understand a letter — it is not legal or official
            advice. Always confirm with the office named on your document.
          </div>
          <div className="rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setWhyNotOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-expanded={whyNotOpen}
            >
              <span>Why not just paste it into ChatGPT?</span>
              <svg className={`h-4 w-4 text-slate-400 transition-transform ${whyNotOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {whyNotOpen && (
              <div className="border-t border-slate-100 px-4 pb-4 text-sm text-slate-600 space-y-2">
                <p>You could — but there are a few things Lantern does differently:</p>
                <ul className="list-disc ps-4 space-y-1">
                  <li><span className="font-semibold">Verified resources only.</span> The phone numbers and programs we show are hand-checked. ChatGPT can invent plausible-looking hotlines that don&apos;t exist.</li>
                  <li><span className="font-semibold">Hard scam and crisis rules.</span> If certain keywords appear, we always route you to a hotline — regardless of what the AI concludes. ChatGPT doesn&apos;t have guardrails like that.</li>
                  <li><span className="font-semibold">No account or cloud case history.</span> Lantern does not create a saved family profile or case; provider-side handling is described on the Privacy page.</li>
                  <li><span className="font-semibold">Ready-to-use outputs.</span> Reply letter, phone script, calendar reminder, and document checklist — all in one step.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
