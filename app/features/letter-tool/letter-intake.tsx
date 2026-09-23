import type { ChangeEventHandler, Dispatch, SetStateAction } from "react";

import { Spinner } from "./letter-support";

type LanguageOption = {
  label: string;
  bcp47: string;
  tts: string;
};

export function LetterIntake({
  formTab,
  language,
  languages,
  loading,
  loadingLabel,
  photoQuality,
  preview,
  simplify,
  zip,
  onChooseLanguage,
  onExplain,
  onFindHelp,
  onPick,
  onReset,
  onSample,
  setFormTab,
  setSimplify,
  setZip,
}: {
  formTab: 0 | 1 | 2;
  language: string;
  languages: readonly LanguageOption[];
  loading: boolean;
  loadingLabel: string;
  photoQuality: "ok" | "dark" | null;
  preview: string | null;
  simplify: boolean;
  zip: string;
  onChooseLanguage: (language: string) => void;
  onExplain: () => void;
  onFindHelp: () => void;
  onPick: ChangeEventHandler<HTMLInputElement>;
  onReset: () => void;
  onSample: () => void;
  setFormTab: Dispatch<SetStateAction<0 | 1 | 2>>;
  setSimplify: Dispatch<SetStateAction<boolean>>;
  setZip: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="overflow-hidden rounded-feature border border-ink/10 bg-surface shadow-[0_18px_55px_rgba(20,36,30,.07)]">
      <div className="flex border-b border-ink/10 bg-canvas/60 p-1.5" role="tablist">
        {([
          { label: "Upload", icon: "▣", index: 0 },
          { label: "Options", icon: "◌", index: 1 },
          { label: "Privacy", icon: "⌑", index: 2 },
        ] as const).map((tab) => (
          <button
            aria-selected={formTab === tab.index}
            className={`min-h-11 flex-1 rounded-xl px-3 py-2 text-sm font-bold transition focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-amber ${
              formTab === tab.index
                ? "bg-white text-cobalt shadow-sm"
                : "text-muted hover:bg-white/60 hover:text-ink"
            }`}
            key={tab.index}
            onClick={() => setFormTab(tab.index)}
            role="tab"
            type="button"
          >
            <span aria-hidden="true">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {formTab === 0 ? (
          <div className="space-y-4">
            {!preview ? (
              <>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-feature border-2 border-dashed border-ink/20 bg-canvas/70 px-6 py-12 text-center transition hover:border-cobalt hover:bg-[#eef2ff] focus-within:border-cobalt focus-within:ring-2 focus-within:ring-cobalt/30">
                  <CameraIcon />
                  <span className="mt-3 text-base font-semibold text-ink">Take a photo or upload your letter</span>
                  <span className="mt-1 text-sm text-muted">JPG or PNG, up to 10 MB</span>
                  <input
                    accept="image/*"
                    aria-label="Take a photo or upload a picture of your letter"
                    capture="environment"
                    className="sr-only"
                    onChange={onPick}
                    type="file"
                  />
                </label>
                <div className="text-center">
                  <button className="rounded-lg text-sm font-bold text-cobalt underline decoration-cobalt/30 underline-offset-4 hover:text-cobalt-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber" onClick={onSample} type="button">
                    Don&apos;t have a letter? Try a sample
                  </button>
                  <span aria-hidden="true" className="mx-2 text-ink/25">·</span>
                  <button className="rounded-lg text-sm font-bold text-muted underline decoration-ink/20 underline-offset-4 hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber" onClick={onFindHelp} type="button">
                    Find help without a letter
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="The letter you uploaded" className="max-h-64 w-full rounded-xl border border-ink/10 object-contain" src={preview} />
                {photoQuality === "dark" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-amber/40 bg-[#fff8df] px-3 py-2 text-sm text-[#795a18]" role="alert">
                    <span aria-hidden="true">⚠️</span> Photo looks dark. Retake in bright light for best results.
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <button aria-busy={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cobalt px-4 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(53,86,212,.2)] transition hover:bg-cobalt-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-70" disabled={loading} onClick={onExplain} type="button">
                    {loading ? <><Spinner /> {loadingLabel}…</> : "Explain this letter"}
                  </button>
                  <button className="rounded-xl border border-ink/15 px-4 py-3 text-base font-bold text-ink transition hover:bg-canvas focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber disabled:opacity-60" disabled={loading} onClick={onReset} type="button">
                    New photo
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {formTab === 1 ? (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink" htmlFor="language">Explain in this language</label>
              <select className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber" id="language" onChange={(event) => onChooseLanguage(event.target.value)} value={language}>
                {languages.map((option) => <option key={option.bcp47} value={option.label}>{option.label}</option>)}
              </select>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-bold text-ink">Reading level</span>
              <div aria-label="Reading level" className="grid grid-cols-2 gap-2 rounded-xl bg-canvas p-1" role="group">
                <button aria-pressed={!simplify} className={`min-h-11 rounded-lg px-3 text-sm font-bold ${!simplify ? "bg-white text-ink shadow-sm" : "text-muted"}`} onClick={() => setSimplify(false)} type="button">Normal</button>
                <button aria-pressed={simplify} className={`min-h-11 rounded-lg px-3 text-sm font-bold ${simplify ? "bg-white text-ink shadow-sm" : "text-muted"}`} onClick={() => setSimplify(true)} type="button">Extra simple</button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink" htmlFor="zip">ZIP code <span className="font-normal text-muted">(optional — for local help)</span></label>
              <input className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber" id="zip" inputMode="numeric" maxLength={5} onChange={(event) => setZip(event.target.value.replace(/\D/g, ""))} placeholder="e.g. 90210" type="text" value={zip} />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-canvas px-3 py-3 text-xs text-muted">
              <LockIcon /> Settings apply to your next explanation. Only interface preferences persist.
            </div>
          </div>
        ) : null}

        {formTab === 2 ? (
          <div className="space-y-3">
            <p className="text-sm font-bold text-ink">How Lantern handles your document</p>
            <ol className="list-decimal space-y-2 ps-5 text-sm leading-6 text-muted">
              <li>Your photo is sent over an encrypted connection to the configured external AI provider.</li>
              <li>Lantern does not create a saved case, profile, or application database record.</li>
              <li>No account or sign-in is required.</li>
              <li>The provider&apos;s own terms govern provider-side handling.</li>
              <li>The request contains the document and instructions needed to explain it.</li>
              <li>Close or refresh this tab to clear Lantern&apos;s in-memory result.</li>
            </ol>
            <div className="flex items-center gap-2 rounded-xl border border-confirmed/20 bg-[#e3f4e8] px-3 py-3 text-xs font-bold text-[#24633a]">
              <LockIcon /> No account · No cloud case history · Encrypted in transit
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 24 24" width="12">
      <rect fill="currentColor" height="9" rx="2" width="14" x="5" y="11" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="40" viewBox="0 0 24 24" width="40">
      <rect height="13" rx="3" stroke="#3556d4" strokeWidth="1.6" width="18" x="3" y="7" />
      <path d="M8 7l1.5-2.5h5L16 7" stroke="#3556d4" strokeLinejoin="round" strokeWidth="1.6" />
      <circle cx="12" cy="13.5" r="3.2" stroke="#3556d4" strokeWidth="1.6" />
    </svg>
  );
}
