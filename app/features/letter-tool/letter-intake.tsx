import type { ChangeEventHandler, Dispatch, SetStateAction } from "react";

import {
  CameraIcon,
  LockIcon,
  SlidersIcon,
  UploadIcon,
} from "../../components/lantern/icons";
import { SegmentedControl } from "../../components/lantern/primitives";
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
  sampleLoading,
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
  sampleLoading: boolean;
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
  const es = language === "Spanish";
  const copy = (english: string, spanish: string) => es ? spanish : english;
  return (
    <div className="letter-intake-shell overflow-hidden rounded-feature border border-ink/10 bg-surface shadow-[0_18px_55px_rgba(20,36,30,.07)]">
      <SegmentedControl
        label={copy("Letter setup", "Opciones de la carta")}
        onChange={(value) => setFormTab(value)}
        options={[
          { icon: <UploadIcon />, label: copy("Upload", "Subir"), value: 0 },
          { icon: <SlidersIcon />, label: copy("Options", "Opciones"), value: 1 },
          { icon: <LockIcon />, label: copy("Privacy", "Privacidad"), value: 2 },
        ] as const}
        value={formTab}
      />

      <div className="p-5">
        {formTab === 0 ? (
          <div className="space-y-4">
            <aside aria-label={copy("Before you share a photo", "Antes de compartir una foto")} className="letter-privacy-note">
              <LockIcon className="h-5 w-5 shrink-0 text-[#1d4b3a]" />
              <div>
                <strong>{copy("You decide what to share.", "Usted decide qué compartir.")}</strong>
                <p>{copy("Cover Social Security numbers, A-numbers, and account numbers you do not need explained. Your photo stays on this page until you press Explain; then Lantern sends it to Groq for AI reading, not to a school or immigration office. Lantern does not create a saved family case.", "Cubra los números de Seguro Social, números A y números de cuenta que no necesite explicar. La foto permanece en esta página hasta que pulse Explicar; entonces Lantern la envía a Groq para leerla con IA, no a una escuela ni a una oficina de inmigración. Lantern no crea un caso familiar guardado.")}</p>
                <button onClick={() => setFormTab(2)} type="button">{copy("Read how sharing works", "Leer cómo se comparte la imagen")}</button>
              </div>
            </aside>
            {!preview ? (
              <>
                <label className="letter-dropzone flex cursor-pointer flex-col items-center justify-center rounded-feature border-2 border-dashed border-ink/20 bg-canvas/70 px-6 py-12 text-center transition hover:border-cobalt hover:bg-[#eef2ff] focus-within:border-cobalt focus-within:ring-2 focus-within:ring-cobalt/30">
                  <span className="letter-upload-action">
                    <CameraIcon className="h-5 w-5" />
                    {copy("Choose a letter photo", "Elegir una foto de la carta")}
                  </span>
                  <span className="mt-4 text-base font-semibold text-ink">{copy("Take a photo or choose an image", "Tome una foto o elija una imagen")}</span>
                  <span className="mt-1 text-sm text-muted">{copy("JPG or PNG · up to 10 MB · clear, flat, and well lit", "JPG o PNG · hasta 10 MB · clara, plana y bien iluminada")}</span>
                  <input
                    accept="image/*"
                    aria-label={copy("Take a photo or upload a picture of your letter", "Tome una foto o suba una imagen de su carta")}
                    capture="environment"
                    className="sr-only"
                    onChange={onPick}
                    disabled={sampleLoading}
                    type="file"
                  />
                </label>
                <div className="text-center">
                  <button aria-busy={sampleLoading} disabled={sampleLoading} className="rounded-lg text-sm font-bold text-cobalt underline decoration-cobalt/30 underline-offset-4 hover:text-cobalt-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber" onClick={onSample} type="button">
                    {sampleLoading ? copy("Loading sample…", "Cargando el ejemplo…") : copy("Don't have a letter? Try a sample", "¿No tiene una carta? Pruebe un ejemplo")}
                  </button>
                  {sampleLoading ? <p role="status" className="mt-2 text-sm text-muted">{copy("Preparing your sample photo…", "Preparando la foto de ejemplo…")}</p> : null}
                  <span aria-hidden="true" className="mx-2 text-ink/25">·</span>
                  <button className="rounded-lg text-sm font-bold text-muted underline decoration-ink/20 underline-offset-4 hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber" onClick={onFindHelp} type="button">
                    {copy("Find help without a letter", "Buscar ayuda sin una carta")}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={copy("The letter you uploaded", "La carta que subió")} className="max-h-64 w-full rounded-xl border border-ink/10 object-contain" src={preview} />
                {photoQuality === "dark" ? (
                  <div className="flex items-center gap-2 rounded-xl border border-amber/40 bg-[#fff8df] px-3 py-2 text-sm text-[#795a18]" role="alert">
                    <span aria-hidden="true">⚠️</span> {copy("Photo looks dark. Retake in bright light for best results.", "La foto parece oscura. Vuelva a tomarla con buena luz.")}
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <button aria-busy={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cobalt px-4 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(53,86,212,.2)] transition hover:bg-cobalt-dark focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-70" disabled={loading} onClick={onExplain} type="button">
                    {loading ? <><Spinner /> {loadingLabel}…</> : copy("Explain this letter", "Explicar esta carta")}
                  </button>
                  <button className="rounded-xl border border-ink/15 px-4 py-3 text-base font-bold text-ink transition hover:bg-canvas focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber disabled:opacity-60" disabled={loading} onClick={onReset} type="button">
                    {copy("New photo", "Nueva foto")}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}

        {formTab === 1 ? (
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink" htmlFor="language">{copy("Explain in this language", "Explicar en este idioma")}</label>
              <select className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-base focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber" id="language" onChange={(event) => onChooseLanguage(event.target.value)} value={language}>
                {languages.map((option) => <option key={option.bcp47} value={option.label}>{option.label}</option>)}
              </select>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-bold text-ink">{copy("Reading level", "Nivel de lectura")}</span>
              <div aria-label={copy("Reading level", "Nivel de lectura")} className="grid grid-cols-2 gap-2 rounded-xl bg-canvas p-1" role="group">
                <button aria-pressed={!simplify} className={`min-h-11 rounded-lg px-3 text-sm font-bold ${!simplify ? "bg-white text-ink shadow-sm" : "text-muted"}`} onClick={() => setSimplify(false)} type="button">{copy("Normal", "Normal")}</button>
                <button aria-pressed={simplify} className={`min-h-11 rounded-lg px-3 text-sm font-bold ${simplify ? "bg-white text-ink shadow-sm" : "text-muted"}`} onClick={() => setSimplify(true)} type="button">{copy("Extra simple", "Muy sencillo")}</button>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink" htmlFor="zip">{copy("ZIP code", "Código postal")} <span className="font-normal text-muted">{copy("(optional — for local help)", "(opcional, para buscar ayuda local)")}</span></label>
              <input className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber" id="zip" inputMode="numeric" maxLength={5} onChange={(event) => setZip(event.target.value.replace(/\D/g, ""))} placeholder="e.g. 90210" type="text" value={zip} />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-canvas px-3 py-3 text-xs text-muted">
              <LockIcon className="h-3.5 w-3.5 shrink-0" /> {copy("Settings apply to your next explanation. Only interface preferences persist.", "Estas opciones se aplican a la próxima explicación. Solo se guardan las preferencias de la interfaz.")}
            </div>
          </div>
        ) : null}

        {formTab === 2 ? (
          <div className="space-y-3">
            <p className="text-sm font-bold text-ink">{copy("How Lantern handles your document", "Cómo trata Lantern su documento")}</p>
            <ol className="list-decimal space-y-2 ps-5 text-sm leading-6 text-muted">
              <li>{copy("Your photo is sent over an encrypted connection to the configured external AI provider.", "Su foto se envía por una conexión cifrada al proveedor externo de IA.")}</li>
              <li>{copy("Lantern does not create a saved case, profile, or application database record.", "Lantern no crea un caso, perfil ni registro guardado en una base de datos.")}</li>
              <li>{copy("No account or sign-in is required.", "No necesita una cuenta ni iniciar sesión.")}</li>
              <li>{copy("The provider's own terms govern provider-side handling.", "El tratamiento por parte del proveedor se rige por sus propios términos.")}</li>
              <li>{copy("The request contains the document and instructions needed to explain it.", "La solicitud contiene el documento y las instrucciones necesarias para explicarlo.")}</li>
              <li>{copy("Close or refresh this tab to clear Lantern's in-memory result.", "Cierre o actualice esta pestaña para borrar el resultado de la memoria de Lantern.")}</li>
            </ol>
            <div className="flex items-center gap-2 rounded-xl border border-confirmed/20 bg-[#e3f4e8] px-3 py-3 text-xs font-bold text-[#24633a]">
              <LockIcon className="h-3.5 w-3.5 shrink-0" /> {copy("No account · No cloud case history · Encrypted in transit", "Sin cuenta · Sin historial en la nube · Cifrado en tránsito")}
            </div>
            <a className="inline-block min-h-11 py-2 text-sm font-bold text-cobalt underline" href="/privacy">{copy("Full privacy policy", "Política completa de privacidad (en inglés)")}</a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
