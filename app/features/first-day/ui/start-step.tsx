import type { Language } from "./first-day-copy";
import { translated } from "./first-day-copy";
import { Eyebrow } from "./first-day-shared";
import type { ProviderCapability } from "./use-provider-capability";
import {
  ArrowRightIcon,
  DocumentIcon,
  EyeIcon,
  SparkIcon,
  WarningIcon,
} from "./icons";

export type StartStepProps = {
  language: Language;
  providerCapability: ProviderCapability;
  onOpenSample: () => void;
  onStartLive: () => void;
};

export function StartStep({
  language,
  providerCapability,
  onOpenSample,
  onStartLive,
}: StartStepProps) {
  return (
    <section className="fd-enter">
      <div className="fd-hero overflow-hidden rounded-[2rem] border border-[#dce2dc] bg-[#fbfcf8] shadow-[0_24px_80px_rgba(24,46,38,.08)]">
        <div className="grid lg:grid-cols-[1.08fr_.92fr]">
          <div className="p-7 sm:p-10 lg:p-14">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cad6ff] bg-[#edf1ff] px-3 py-1.5 text-xs font-bold text-[#3556d4]">
              <SparkIcon className="h-4 w-4" />
              {translated(
                language,
                "A calmer first day",
                "Un primer día más tranquilo",
              )}
            </div>
            <Eyebrow>
              {translated(
                language,
                "Lantern · First Day",
                "Lantern · Primer Día",
              )}
            </Eyebrow>
            <h1 className="max-w-2xl text-balance font-serif text-5xl leading-[1.03] tracking-[-0.04em] text-[#12221c] sm:text-6xl">
              {translated(
                language,
                "School instructions, turned into a plan you can trust.",
                "Instrucciones escolares convertidas en un plan confiable.",
              )}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-[#59665f] sm:text-lg sm:leading-8">
              {translated(
                language,
                "Bring related letters together, check every important fact against its source, and see what is ready, waiting, or unclear.",
                "Reúna cartas relacionadas, revise cada dato importante con su fuente y vea qué está listo, en espera o no está claro.",
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                className="fd-primary-button"
                onClick={onOpenSample}
                type="button"
              >
                {translated(
                  language,
                  "Open the sample case",
                  "Abrir el caso de ejemplo",
                )}
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              <button
                className="fd-secondary-button"
                disabled={providerCapability !== "available"}
                onClick={onStartLive}
                type="button"
              >
                <DocumentIcon className="h-4 w-4" />
                {translated(
                  language,
                  "Add my documents",
                  "Añadir mis documentos",
                )}
              </button>
            </div>
            {providerCapability !== "available" ? (
              <p aria-live="polite" className="mt-4 text-sm text-[#65716b]">
                {providerCapability === "checking"
                  ? translated(
                      language,
                      "Checking live document availability…",
                      "Comprobando la disponibilidad de documentos…",
                    )
                  : translated(
                      language,
                      "Live document reading is unavailable right now. The complete sample still works.",
                      "La lectura de documentos no está disponible ahora. El ejemplo completo sigue funcionando.",
                    )}
              </p>
            ) : null}
          </div>

          <div className="fd-hero-visual relative min-h-[390px] overflow-hidden border-t border-[#dce2dc] bg-[#182c24] p-7 text-white lg:border-l lg:border-t-0 lg:p-10">
            <div className="fd-orbit fd-orbit-one" />
            <div className="fd-orbit fd-orbit-two" />
            <div className="relative z-10 mx-auto max-w-md space-y-4 pt-4 lg:pt-10">
              <div className="ml-8 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7c864] text-[#14241e]">
                    <DocumentIcon />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/55">
                      {translated(language, "Source", "Fuente")}
                    </p>
                    <p className="font-semibold">
                      {translated(
                        language,
                        "Welcome letter",
                        "Carta de bienvenida",
                      )}
                    </p>
                  </div>
                </div>
                <p className="mt-4 font-serif text-lg leading-7 text-white/90">
                  “Mesa View Welcome Center, 145 Oak Street…”
                </p>
              </div>
              <div className="mr-7 rounded-3xl bg-white p-5 text-[#1b2d26] shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5f6d66]">
                      {translated(
                        language,
                        "Your next step",
                        "Su próximo paso",
                      )}
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      {translated(
                        language,
                        "Go to enrollment",
                        "Ir a la inscripción",
                      )}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#dff3e5] px-3 py-1 text-xs font-bold text-[#23673a]">
                    {translated(language, "Ready", "Listo")}
                  </span>
                </div>
              </div>
              <div className="ml-14 flex items-center gap-3 rounded-3xl border border-[#ffd778]/30 bg-[#ffc95d]/15 p-4 text-[#ffe7ad] backdrop-blur-md">
                <WarningIcon />
                <p className="text-sm font-semibold">
                  {translated(
                    language,
                    "Two locations need checking",
                    "Hay que revisar dos lugares",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          [DocumentIcon, "3", "related documents", "documentos relacionados"],
          [EyeIcon, "10", "source passages", "fragmentos de fuentes"],
          [WarningIcon, "1", "conflict to resolve", "conflicto por resolver"],
        ].map(([Icon, value, english, spanish]) => (
          <div className="fd-stat-card" key={String(english)}>
            <Icon className="h-5 w-5 text-[#3556d4]" />
            <span className="text-2xl font-bold tracking-[-0.03em]">
              {String(value)}
            </span>
            <span className="text-sm text-[#65716b]">
              {translated(
                language,
                String(english),
                String(spanish),
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
