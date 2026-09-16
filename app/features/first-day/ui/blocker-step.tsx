import { translated, type Language } from "./first-day-copy";
import { Eyebrow, SourceButton, type SourceOpener } from "./first-day-shared";
import { CheckIcon, MessageIcon, WarningIcon } from "./icons";

export type BlockerStepProps = {
  language: Language;
  onOpenSource: SourceOpener;
  onResolveConflict: () => void;
};

export function BlockerStep({
  language,
  onOpenSource,
  onResolveConflict,
}: BlockerStepProps) {
  const sourceLabel = translated(language, "Show source", "Ver fuente");
  const options = [
    {
      title: translated(language, "Welcome letter", "Carta de bienvenida"),
      value: translated(language, "School cafeteria", "Cafetería escolar"),
      evidence: "evidence-orientation-cafeteria",
    },
    {
      title: translated(
        language,
        "Follow-up message",
        "Mensaje de seguimiento",
      ),
      value: translated(language, "Gym entrance", "Entrada del gimnasio"),
      evidence: "evidence-orientation-gym",
    },
  ];

  return (
    <section className="fd-enter">
      <Eyebrow>
        {translated(
          language,
          "Step 5 · Resolve a blocker",
          "Paso 5 · Resolver un bloqueo",
        )}
      </Eyebrow>
      <h1 className="fd-page-title">
        {translated(
          language,
          "Two documents. One unanswered question.",
          "Dos documentos. Una pregunta sin respuesta.",
        )}
      </h1>
      <p className="fd-page-intro">
        {translated(
          language,
          "Lantern does not assume the newest page is correct. Both passages stay visible until the family records a real confirmation.",
          "Lantern no supone que la página más reciente sea correcta. Ambas fuentes siguen visibles hasta registrar una confirmación real.",
        )}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {options.map((option) => (
          <article className="fd-conflict-card" key={option.evidence}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#8a6721]">
              <WarningIcon className="h-4 w-4" />
              {option.title}
            </div>
            <p className="mt-5 font-serif text-3xl tracking-[-0.03em]">
              {option.value}
            </p>
            <div className="mt-5">
              <SourceButton
                label={sourceLabel}
                onClick={(button) => onOpenSource(option.evidence, button)}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-[2rem] border border-[#ccd6ff] bg-[#eef2ff] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3556d4] text-white">
            <MessageIcon />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5369bd]">
              {translated(
                language,
                "Prepared question",
                "Pregunta preparada",
              )}
            </p>
            <p className="mt-3 text-lg font-semibold leading-7 text-[#26386f]">
              {translated(
                language,
                "Hello, Maya’s welcome letter says orientation is in the cafeteria, but the follow-up says to use the gym entrance. Where should our family go first?",
                "Hola. La carta de Maya dice que la orientación es en la cafetería, pero el mensaje dice que usemos la entrada del gimnasio. ¿A dónde debemos ir primero?",
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[#dce2dd] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold">
          {translated(
            language,
            "Demo resolution",
            "Resolución de demostración",
          )}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#66736c]">
          {translated(
            language,
            "For this fictional story, imagine the school office confirms the gym entrance. Recording that confirmation updates only the affected task.",
            "En esta historia ficticia, imagine que la oficina confirma la entrada del gimnasio. Registrar esa confirmación actualiza solo el paso afectado.",
          )}
        </p>
        <button
          className="fd-primary-button mt-5"
          onClick={onResolveConflict}
          type="button"
        >
          <CheckIcon className="h-5 w-5" />
          {translated(
            language,
            "Record fictional confirmation",
            "Registrar confirmación ficticia",
          )}
        </button>
      </div>
    </section>
  );
}
