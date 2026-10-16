import { useState, type FormEvent } from "react";

import { translated, type Language } from "./first-day-copy";

type Turn = { from: "office" | "family"; text: string };

// A scripted rehearsal of the call to the school office. The replies are canned
// on purpose: Lantern never invents what the school "said". Nothing here changes
// the plan; only the family's real confirmation above does that.
function officeScript(language: Language) {
  return {
    opening: translated(
      language,
      "Front office, this is Ms. Rivera. How can I help you?",
      "Oficina principal, habla la Sra. Rivera. ¿En qué le puedo ayudar?",
    ),
    replies: [
      translated(
        language,
        "Good question, thank you for checking. Can you tell me the student's name and grade so I can look it up?",
        "Buena pregunta, gracias por preguntar. ¿Me puede dar el nombre y el grado del estudiante para buscarlo?",
      ),
      translated(
        language,
        "Thank you. I'll confirm the right place with the counselor and call you back today.",
        "Gracias. Voy a confirmar el lugar correcto con la consejera y le llamo hoy.",
      ),
    ],
    hints: [
      translated(
        language,
        "Ask the school your question.",
        "Haga su pregunta a la escuela.",
      ),
      translated(
        language,
        "Answer: give the student's name and grade (practice names are fine).",
        "Responda: dé el nombre y el grado del estudiante (puede usar nombres de práctica).",
      ),
    ],
  };
}

export function PracticeConversation({
  language,
  preparedQuestion,
}: {
  language: Language;
  preparedQuestion: string;
}) {
  const script = officeScript(language);
  const [turns, setTurns] = useState<Turn[]>([{ from: "office", text: script.opening }]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState(false);
  const familyTurns = turns.filter((turn) => turn.from === "family").length;
  const finished = familyTurns >= script.replies.length;

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) {
      setError(true);
      return;
    }
    setError(false);
    setDraft("");
    setTurns((current) => [
      ...current,
      { from: "family", text },
      { from: "office", text: script.replies[familyTurns] },
    ]);
  }

  function restart() {
    setTurns([{ from: "office", text: script.opening }]);
    setDraft("");
    setError(false);
  }

  return (
    <div className="fd-practice">
      <p className="text-sm leading-6 text-muted">
        {translated(
          language,
          "Rehearse the call before you make it. The school's replies are a practice script, not a real answer, and nothing here changes your plan.",
          "Ensaye la llamada antes de hacerla. Las respuestas de la escuela son un guion de práctica, no una respuesta real, y nada aquí cambia su plan.",
        )}
      </p>

      <ol
        aria-label={translated(language, "Practice conversation", "Conversación de práctica")}
        aria-live="polite"
        className="fd-practice-log"
        role="log"
      >
        {turns.map((turn, index) => (
          <li className={`fd-practice-turn fd-practice-turn-${turn.from}`} key={index}>
            <span className="fd-practice-speaker">
              {turn.from === "office"
                ? translated(language, "School office (practice)", "Oficina escolar (práctica)")
                : translated(language, "You", "Usted")}
            </span>
            <span>{turn.text}</span>
          </li>
        ))}
      </ol>

      {finished ? (
        <div className="fd-practice-tip" role="status">
          <p className="font-bold">
            {translated(language, "Practice complete.", "Práctica terminada.")}
          </p>
          <p className="mt-1">
            {translated(
              language,
              "On the real call, write down who you spoke with and exactly what they said. Then come back and tap the place the school confirmed. Lantern updates only the steps that depend on it.",
              "En la llamada real, anote con quién habló y qué le dijeron exactamente. Luego vuelva y toque el lugar que confirmó la escuela. Lantern actualiza solo los pasos que dependen de eso.",
            )}
          </p>
          <button className="fd-secondary-button mt-3" onClick={restart} type="button">
            {translated(language, "Practice again", "Practicar otra vez")}
          </button>
        </div>
      ) : (
        <form className="mt-3" onSubmit={send}>
          <label className="block text-sm font-semibold text-muted" htmlFor="fd-practice-input">
            {script.hints[familyTurns]}
          </label>
          <textarea
            aria-describedby={error ? "fd-practice-error" : undefined}
            aria-invalid={error || undefined}
            className="mt-2 min-h-24 w-full rounded-xl border border-ink/15 bg-white p-3 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"
            id="fd-practice-input"
            onChange={(event) => {
              setDraft(event.currentTarget.value);
              if (error) setError(false);
            }}
            value={draft}
          />
          {error ? (
            <p className="mt-1 text-sm font-semibold text-[#8a4b00]" id="fd-practice-error">
              {translated(language, "Type a reply first.", "Escriba una respuesta primero.")}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="fd-confirm-button" type="submit">
              {translated(language, "Send practice reply", "Enviar respuesta de práctica")}
            </button>
            {familyTurns === 0 ? (
              <button
                className="fd-secondary-button"
                onClick={() => {
                  setDraft(preparedQuestion);
                  setError(false);
                }}
                type="button"
              >
                {translated(language, "Use Lantern's question", "Usar la pregunta de Lantern")}
              </button>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
