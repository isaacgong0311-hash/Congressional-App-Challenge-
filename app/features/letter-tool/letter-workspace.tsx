"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductHeader } from "../../components/lantern/product-header";
import { CheckIcon, ShieldAlertIcon } from "../../components/lantern/icons";
import { AccessibilityControls } from "../../components/lantern/primitives";
import { useLanternPreferences } from "../../components/lantern/use-lantern-preferences";
import { publicApiError, readingFailureMessage } from "../../lib/api-error";
import {
  deriveLetterToolView,
  isLetterResult,
  type Result,
} from "./letter-tool-state";
import { LetterHelpScreen } from "./letter-help-screen";
import { LetterIntake } from "./letter-intake";
import { LetterResults } from "./letter-results";
import { buildLetterReminderCalendar } from "./letter-calendar";
import { sampleLetterResult } from "./sample-letter-result";
import type { SpeechStatus } from "./letter-results";
import type { Category } from "../../resources";
import { prepareImageForUpload, readJsonResponse } from "../../lib/prepare-image";

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
  { label: "Reading your letter", es: "Leyendo su carta" },
  { label: "Finding important dates", es: "Buscando fechas importantes" },
  { label: "Checking for scam signals", es: "Buscando señales de estafa" },
  { label: "Matching verified programs", es: "Buscando programas verificados" },
  { label: "Writing your reply", es: "Preparando su respuesta" },
];

export default function LetterWorkspace({
  initialLanguage = null,
}: {
  initialLanguage?: "Spanish" | null;
}) {
  const [language, setLanguage] = useState(initialLanguage ?? "English");
  const [simplify, setSimplify] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [isSample, setIsSample] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>("idle");
  const speaking = speechStatus === "preparing" || speechStatus === "speaking";
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
  const speechRunRef = useRef(0);
  const initialLanguageAppliedRef = useRef(false);

  const lang = LANGUAGES.find((l) => l.label === language) ?? LANGUAGES[0];
  const dir = RTL_LANGS.has(lang.bcp47) ? "rtl" : "ltr";

  useEffect(() => {
    if (!preferencesReady) return;
    const frame = window.requestAnimationFrame(() => {
      if (initialLanguage && !initialLanguageAppliedRef.current) {
        initialLanguageAppliedRef.current = true;
        setLanguage(initialLanguage);
        if (preferences.preferredLanguage !== "es") {
          setPreferences((current) => ({ ...current, preferredLanguage: "es" }));
        }
        return;
      }
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
  }, [initialLanguage, preferences.preferredLanguage, preferencesReady, setPreferences]);

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
    e.target.value = "";
    if (!f) return;
    const pickError = f.type !== "image/jpeg" && f.type !== "image/png"
      ? "UNSUPPORTED_MEDIA"
      : f.size <= 0 || f.size > 10 * 1024 * 1024
        ? "PAYLOAD_TOO_LARGE"
        : null;
    if (pickError) {
      reset();
      setError(readingFailureMessage(pickError, language, ""));
      return;
    }
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    const url = URL.createObjectURL(f);
    previewUrl.current = url;
    setFile(f);
    setIsSample(false);
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
      if (isSample) {
        setResult(sampleLetterResult(language));
        setActiveTab(0);
        return;
      }
      const body = new FormData();
      body.append("image", await prepareImageForUpload(file));
      body.append("language", language);
      body.append("readingLevel", simplify ? "simple" : "standard");
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const res = await fetch("/api/explain", {
            method: "POST",
            body,
            signal: AbortSignal.timeout(58_000),
          });
          const data = await readJsonResponse(res);
          if (!res.ok) {
            const responseError = publicApiError(
              data,
              language === "Spanish"
                ? "Ocurrió un problema. Inténtelo de nuevo."
                : "Something went wrong. Please try again.",
            );
            if (res.status === 429) {
              setError(readingFailureMessage("RATE_LIMITED", language, responseError.message));
              return;
            }
            if (attempt === 0 && responseError.retryable) continue;
            setError(readingFailureMessage(responseError.code, language, responseError.message));
            return;
          }
          if (!isLetterResult(data)) {
            if (attempt === 0) continue;
            setError(language === "Spanish"
              ? "No pudimos leer la respuesta con seguridad. Intente de nuevo con la foto."
              : "We couldn't safely read that response. Please try the photo again.");
            return;
          }
          setResult(data);
          setActiveTab(0);
          return;
        } catch (error) {
          if (attempt === 0) continue;
          setError(error instanceof DOMException && error.name === "TimeoutError"
            ? readingFailureMessage("PROVIDER_TIMEOUT", language, "")
            : language === "Spanish"
              ? "No pudimos conectar con el servicio. Revise su conexión e inténtelo de nuevo."
              : "We couldn't reach the server. Please check your connection and try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadSample() {
    if (sampleLoading) return;
    setSampleLoading(true);
    try {
      const res = await fetch("/sample-letter.png");
      if (!res.ok) throw new Error("Sample unavailable");
      const blob = await res.blob();
      const f = new File([blob], "sample-letter.png", { type: "image/png" });
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
      const url = URL.createObjectURL(f);
      previewUrl.current = url;
      setFile(f);
      setIsSample(true);
      setResult(null);
      setError(null);
      setPreview(url);
    } catch {
      setError(language === "Spanish"
        ? "No se pudo cargar el ejemplo. Suba su propia foto."
        : "Could not load the sample. Please upload your own photo.");
    } finally {
      setSampleLoading(false);
    }
  }

  function reset() {
    stopSpeaking();
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = null;
    setFile(null);
    setIsSample(false);
    setPreview(null);
    setResult(null);
    setError(null);
  }

  function stopSpeaking(next: SpeechStatus = "idle") {
    speechRunRef.current += 1;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeechStatus(next);
  }

  function speakWithBrowser(text: string, run: number) {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechStatus("unavailable");
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang.tts;
    const voices = synth.getVoices();
    const prefix = lang.tts.split("-")[0].toLowerCase();
    const voice = voices.find((v) => v.lang.toLowerCase().replace("_", "-") === lang.tts.toLowerCase())
      ?? voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
    if (voice) u.voice = voice;
    let started = false;
    u.onstart = () => { started = true; if (speechRunRef.current === run) setSpeechStatus("speaking"); };
    u.onend = () => { if (speechRunRef.current === run) setSpeechStatus(started ? "finished" : "unavailable"); };
    u.onerror = (event) => {
      if (speechRunRef.current !== run) return;
      if (event.error === "canceled" || event.error === "interrupted") return;
      setSpeechStatus(started ? "error" : "unavailable");
    };
    synth.cancel();
    synth.speak(u);
    // Some browsers accept speak() but never start (no voice installed).
    window.setTimeout(() => {
      if (speechRunRef.current === run && !started && !synth.speaking) {
        synth.cancel();
        setSpeechStatus("unavailable");
      }
    }, 4000);
  }

  async function readAloud() {
    if (!result || typeof window === "undefined") return;
    if (speaking) { stopSpeaking(); return; }
    const run = ++speechRunRef.current;
    setSpeechStatus("preparing");

    const text = [
      result.meaning,
      result.whatTheyNeed.join(". "),
      ...result.nextSteps.map((s) => `${s.step}. ${s.detail}`),
      result.whatHappensIfNothing,
    ]
      .filter(Boolean)
      .join(" ")
      .slice(0, 2500);

    // Try high-quality multilingual server speech first, but never wait long.
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 8000);
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, bcp47: lang.bcp47 }),
        signal: controller.signal,
      }).finally(() => window.clearTimeout(timer));
      if (speechRunRef.current !== run) return;
      if (res.ok) {
        const blob = await res.blob();
        if (speechRunRef.current !== run) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        const cleanup = () => { URL.revokeObjectURL(url); if (audioRef.current === audio) audioRef.current = null; };
        audio.onended = () => { cleanup(); if (speechRunRef.current === run) setSpeechStatus("finished"); };
        audio.onerror = () => { cleanup(); if (speechRunRef.current === run) speakWithBrowser(text, run); };
        try {
          await audio.play();
          if (speechRunRef.current === run) setSpeechStatus("speaking");
          return;
        } catch {
          cleanup();
          if (speechRunRef.current !== run) return;
          // Playback blocked: fall through to browser speech.
        }
      }
    } catch {
      if (speechRunRef.current !== run) return;
      // fall through to browser speech
    }

    speakWithBrowser(text, run);
  }

  function downloadCalendar(): boolean {
    if (!result?.deadlineISO) return false;
    const ics = buildLetterReminderCalendar(result.deadlineISO, `Deadline: ${result.documentType}`);
    if (!ics) return false;
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deadline.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return true;
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
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
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
      const data = await readJsonResponse(res);
      if (res.ok && data && typeof data === "object" && "translation" in data && typeof data.translation === "string") {
        setTranslatedLetter(data.translation);
      } else if (!res.ok) {
        publicApiError(data, "Translation failed.");
      }
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
        language={language === "Spanish" ? "es" : "en"}
        controls={
          <>
            <AccessibilityControls
              language={language === "Spanish" ? "Español" : "English"}
              highContrast={highContrast}
              largeText={largeText}
              onToggleHighContrast={toggleHC}
              onToggleLargeText={toggleLT}
            />
            <span className="hidden items-center gap-1 rounded-full bg-[#e4f4e8] px-2.5 py-1 text-xs font-bold text-confirmed ring-1 ring-[#bbdec5] sm:inline-flex">
              <LockIcon /> {language === "Spanish" ? "Sin historial guardado" : "No saved history"}
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
          {language === "Spanish" ? "← Inicio de Lantern" : "← Lantern home"}
        </Link>

        {!loading && !result && !error ? (
          <div className="mb-7">
            <div aria-label={language === "Spanish" ? "Idioma de la explicación" : "Explanation language"} className="letter-language-choice" role="group">
              <button aria-pressed={language === "English"} onClick={() => chooseLanguage("English")} type="button">English</button>
              <button aria-pressed={language === "Spanish"} onClick={() => chooseLanguage("Spanish")} type="button">Español</button>
            </div>
            <p className="lantern-eyebrow">{language === "Spanish" ? "Explicar una carta" : "Explain a letter"}</p>
            <h1 className="mt-3 text-balance font-serif text-4xl leading-tight tracking-[-0.04em] text-ink sm:text-5xl">
              {language === "Spanish"
                ? "Entienda la carta. Sepa qué hacer después."
                : "Understand the letter. See what to do next."}
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">
              {language === "Spanish"
                ? "Tome una foto clara o pruebe un ejemplo. Lantern le explica la carta con palabras sencillas. Usted decide qué hacer después."
                : "Take a clear photo or try a sample. Lantern explains the letter in plain language. You decide what to do next."}
            </p>
          </div>
        ) : null}

        {!loading && !result && !error ? (
          <LetterIntake
            formTab={formTab}
            language={language}
            languages={LANGUAGES}
            loading={loading}
            sampleLoading={sampleLoading}
            loadingLabel={language === "Spanish" ? LOADING_STEPS[loadingMsg].es : LOADING_STEPS[loadingMsg].label}
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
          <div className="letter-processing-card mt-6" role="status" aria-label={language === "Spanish" ? "Analizando su carta" : "Analyzing your letter"}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="lantern-eyebrow">{language === "Spanish" ? "Trabajando de forma segura" : "Working securely"}</p>
                <p className="mt-2 text-lg font-black tracking-[-0.025em] text-ink">{language === "Spanish" ? "Analizando su carta" : "Analyzing your letter"}</p>
                <p className="mt-1 text-sm text-muted">{language === "Spanish" ? LOADING_STEPS[loadingMsg].es : LOADING_STEPS[loadingMsg].label}</p>
              </div>
              <span className="rounded-full border border-cobalt/20 bg-white px-3 py-1 text-xs font-extrabold text-cobalt">
                {`${loadingMsg + 1} ${language === "Spanish" ? "de" : "of"} ${LOADING_STEPS.length}`}
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
                    <span>{language === "Spanish" ? s.es : s.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div aria-live="polite" className="sr-only">
          {loading
            ? language === "Spanish" ? LOADING_STEPS[loadingMsg].es : LOADING_STEPS[loadingMsg].label
            : result ? language === "Spanish" ? "Análisis completo" : "Analysis complete" : ""}
        </div>

        {error && (
          <div
            role="alert"
            className="ttf-fade-in mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800"
          >
            <span aria-hidden="true">⚠️</span>
            <div>
              <p className="font-semibold">{language === "Spanish" ? "Hubo un problema" : "We hit a snag"}</p>
              <p className="mt-0.5 text-sm">{error}</p>
              <Link className="mt-3 inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4" href="/first-day?demo=1">
                {language === "Spanish" ? "Probar la demo ficticia" : "Try the fictional demo"}
              </Link>
              <div className="mt-3 flex flex-wrap gap-2">
                {file ? (
                  <button
                    className="min-h-11 rounded-xl bg-red-800 px-4 text-sm font-bold text-white hover:bg-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
                    onClick={explain}
                    type="button"
                  >
                    {language === "Spanish" ? "Intentar de nuevo" : "Try again"}
                  </button>
                ) : null}
                <button
                  className="min-h-11 rounded-xl border border-red-300 bg-white px-4 text-sm font-bold text-red-800 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
                  onClick={reset}
                  type="button"
                >
                  {language === "Spanish" ? "Elegir otra foto" : "Choose another photo"}
                </button>
              </div>
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
            speechStatus={speechStatus}
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
            language={language}
            onBack={() => {
              setHelpCategory(null);
              setScreen("app");
            }}
            onChooseCategory={setHelpCategory}
            onOpenLetter={() => setScreen("app")}
          />
        ) : null}
      </main>

      <footer className="mt-8 border-t border-ink/10 bg-surface/80 py-5 print:hidden">
        <div className="mx-auto max-w-3xl space-y-3 px-6">
          <div className="text-center text-xs text-muted">
            {language === "Spanish" ? "Esta herramienta le ayuda a entender una carta. No ofrece asesoría legal ni oficial. Confirme lo importante con la oficina indicada en el documento." : "This tool helps you understand a letter — it is not legal or official advice. Always confirm with the office named on your document."}
          </div>
          <div className="overflow-hidden rounded-card border border-ink/10 bg-white shadow-[0_14px_38px_rgba(20,36,30,.06)]">
            <button
              type="button"
              onClick={() => setWhyNotOpen((v) => !v)}
              className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-bold text-ink focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-amber"
              aria-expanded={whyNotOpen}
            >
              <span className="inline-flex items-center gap-2"><ShieldAlertIcon className="h-5 w-5 text-cobalt" /> {language === "Spanish" ? "Cómo Lantern le ayuda a decidir" : "How Lantern protects your decisions"}</span>
              <svg className={`h-4 w-4 shrink-0 text-muted transition-transform ${whyNotOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {whyNotOpen && (
              <div className="space-y-2 border-t border-ink/10 px-4 pb-4 pt-3 text-sm leading-6 text-muted">
                <p>{language === "Spanish" ? "Lantern añade estas protecciones a la explicación:" : "Lantern adds a few safeguards around a general explanation:"}</p>
                <ul className="list-disc ps-4 space-y-1">
                  <li>{language === "Spanish" ? "Los teléfonos y programas de ayuda se revisan a mano; no se inventan para cada carta." : "The phone numbers and programs shown here are hand-checked instead of generated for each letter."}</li>
                  <li>{language === "Spanish" ? "Algunas señales de estafa y crisis siempre muestran avisos de seguridad adicionales." : "Certain scam and crisis signals always surface extra safety guidance."}</li>
                  <li>{language === "Spanish" ? "Lantern no crea un perfil ni un caso familiar guardado. Consulte Privacidad para saber cómo Groq trata la imagen." : "Lantern does not create a saved family profile or case. Provider-side handling is described on the Privacy page."}</li>
                  <li>{language === "Spanish" ? "Puede obtener una respuesta para imprimir, un guion de llamada, un recordatorio y una lista de documentos." : "You can get a reply letter, phone script, calendar reminder, and document checklist."}</li>
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
