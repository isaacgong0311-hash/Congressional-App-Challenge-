import type {
  ConfirmationState,
  DerivedTask,
  FirstDayCase,
  PlanState,
} from "../domain/types";
import {
  CircleCheckIcon,
  ClockIcon,
  EyeIcon,
  SparkIcon,
  WarningIcon,
} from "./icons";

export type StepId =
  | "start"
  | "documents"
  | "facts"
  | "plan"
  | "blocker"
  | "export";

export type Language = FirstDayCase["language"];

export const STEPS: { id: StepId; en: string; es: string }[] = [
  { id: "start", en: "Start", es: "Inicio" },
  { id: "documents", en: "Documents", es: "Documentos" },
  { id: "facts", en: "Review facts", es: "Revisar datos" },
  { id: "plan", en: "My plan", es: "Mi plan" },
  { id: "blocker", en: "Resolve", es: "Resolver" },
  { id: "export", en: "Take it with me", es: "Llevar conmigo" },
];

export const STATE_META: Record<
  PlanState,
  { en: string; es: string; icon: typeof CircleCheckIcon; className: string }
> = {
  ready: {
    en: "Ready",
    es: "Listo",
    icon: SparkIcon,
    className: "fd-state-ready",
  },
  needs_clarification: {
    en: "Needs clarification",
    es: "Necesita aclaración",
    icon: WarningIcon,
    className: "fd-state-clarify",
  },
  waiting: {
    en: "Waiting",
    es: "En espera",
    icon: ClockIcon,
    className: "fd-state-waiting",
  },
  done: {
    en: "Done",
    es: "Terminado",
    icon: CircleCheckIcon,
    className: "fd-state-done",
  },
  needs_review: {
    en: "Needs review",
    es: "Necesita revisión",
    icon: EyeIcon,
    className: "fd-state-review",
  },
};

export const TASK_ES: Record<
  string,
  { title: string; action: string; detail: string }
> = {
  "task-registration": {
    title: "Ir a la reunión de inscripción",
    action: "Lleve a Maya y la carta de bienvenida al Centro de Bienvenida.",
    detail: "La fecha y el lugar están confirmados en la carta ficticia.",
  },
  "task-health-records": {
    title: "Prepararse para el paso de salud",
    action: "Lleve el registro de vacunas o confirme la cita con la enfermera.",
    detail: "Este procedimiento ficticio permite cualquiera de las dos opciones.",
  },
  "task-orientation": {
    title: "Confirmar dónde empieza la orientación",
    action: "Pregunte si la orientación será en la cafetería o en el gimnasio.",
    detail: "Dos documentos indican lugares diferentes para la misma orientación.",
  },
  "task-interpreter": {
    title: "Decidir si quiere un intérprete",
    action: "Responda a la escuela si un intérprete sería útil.",
    detail: "La escuela ofrece ayuda de idioma, pero falta confirmar la preferencia.",
  },
  "task-first-day-ready": {
    title: "Revisar el plan final",
    action: "Revise los pasos de inscripción y salud antes del primer día.",
    detail: "Este resumen espera hasta que se terminen los dos pasos anteriores.",
  },
};

export function localizedTaskCopy(task: DerivedTask, language: Language, caseData?: FirstDayCase) {
  if (task.id === "task-orientation" && caseData) {
    const answer = [...caseData.events].reverse().find(
      (event) => event.type === "school_confirmation_recorded" && event.conflictId === "conflict-orientation-location",
    );
    if (answer?.type === "school_confirmation_recorded") {
      const place = factDisplayValue(answer.selectedFactId, answer.reportedValue, language);
      const article = answer.selectedFactId === "fact-orientation-cafeteria" ? "la" : "el";
      return {
        ...task,
        title: translated(language, "Orientation location confirmed", "Lugar de orientación confirmado"),
        action: translated(language, `Attend orientation at the ${place.toLowerCase()}.`, `Asista a la orientación en ${article} ${place.toLowerCase()}.`),
        detail: translated(language, `The school confirmed: ${place}.`, `La escuela confirmó: ${place}.`),
      };
    }
  }
  if (language !== "Español") return task;
  const fictional = TASK_ES[task.id];
  if (fictional) return { ...task, ...fictional };

  if (task.id === "task-live-gather-documents") {
    return {
      ...task,
      title: "Reunir los documentos de inscripción confirmados",
      action: task.action.replace(/^Prepare:/, "Prepare:"),
      detail:
        "Esta lista usa solo solicitudes de documentos que confirmó con sus fuentes.",
    };
  }
  if (task.id === "task-live-open-enrollment") {
    return {
      ...task,
      title: "Revisar el formulario de inscripción de la fuente",
      action:
        "Cree la cuenta del portal, complete el formulario de estudiante nuevo y configure el acceso del tutor.",
      detail:
        "La secuencia proviene de la página de inscripción del distrito revisada con su fuente.",
    };
  }
  if (task.id === "task-live-review-plan") {
    return {
      ...task,
      title: "Revisar el plan final de inscripción",
      action: "Revise cada paso con fuente antes de confiar en el plan.",
      detail: "Este resumen espera a que termine cada paso anterior.",
    };
  }
  if (task.id.startsWith("task-live-clarify-")) {
    return {
      ...task,
      title: "Aclarar instrucciones contradictorias",
      action:
        "Pregunte a la escuela qué fuente debe seguir su familia y registre lo que le digan.",
      detail:
        "Lantern mantiene visibles ambas fuentes y no elige una como correcta.",
    };
  }
  if (task.id.startsWith("task-live-attend-")) {
    return {
      ...task,
      action: task.action.replace(
        /^Plan around the confirmed date or appointment:/,
        "Planifique según la fecha o cita confirmada:",
      ),
      detail:
        "Este horario proviene de un dato que revisó con su fuente.",
    };
  }
  return task;
}

export const FACT_ES: Record<string, string> = {
  "fact-registration-date": "Reunión de inscripción",
  "fact-registration-location": "Lugar de inscripción",
  "fact-immunization-record": "¿Tiene el registro de vacunas de Maya?",
  "fact-nurse-review": "Revisión con la enfermera",
  "fact-orientation-time": "Orientación familiar",
  "fact-orientation-cafeteria": "Carta de bienvenida: cafetería",
  "fact-orientation-gym": "Mensaje de seguimiento: gimnasio",
  "fact-interpreter-preference": "¿Necesita un intérprete?",
};

export const DOCUMENT_ES: Record<string, string> = {
  "doc-welcome-letter": "Carta de bienvenida para inscripción",
  "doc-health-note": "Nota de la oficina de salud",
  "doc-follow-up-message": "Mensaje de seguimiento de la escuela",
};

const PROCEDURE_ES: Record<string, string> = {
  "procedure-demo-registration": "Procedimiento ficticio de inscripción",
  "procedure-demo-health": "Alternativa ficticia para el registro de salud",
};

export function sourceTitle(
  id: string | undefined,
  title: string,
  language: Language,
) {
  if (language !== "Español" || !id) return title;
  return DOCUMENT_ES[id] ?? PROCEDURE_ES[id] ?? title;
}

export function sourceLocation(location: string, language: Language) {
  if (language !== "Español") return location;
  const page = /^Page (\d+)(?:, (.+))?$/.exec(location);
  if (page) {
    const section: Record<string, string> = {
      "enrollment paragraph": "párrafo de inscripción",
      "orientation paragraph": "párrafo de orientación",
      "first sentence": "primera oración",
      "second sentence": "segunda oración",
      "final sentence": "última oración",
      "health instructions": "instrucciones de salud",
    };
    return `Página ${page[1]}${page[2] ? `, ${section[page[2]] ?? page[2]}` : ""}`;
  }
  const rule = /^Fictional demo rule, (registration|health records)$/.exec(location);
  if (rule) return `Regla de demostración ficticia, ${rule[1] === "registration" ? "inscripción" : "registros de salud"}`;
  return location;
}

export function readableDate(date: string, language: Language, time?: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const value = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(value.getTime()) || value.toISOString().slice(0, 10) !== date) return date;
  const locale = language === "Español" ? "es-US" : "en-US";
  const day = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(value);
  const clock = time && /^(\d{2})(\d{2})\d{2}$/.exec(time);
  if (!clock) return day;
  const at = new Date(Date.UTC(2020, 0, 1, Number(clock[1]), Number(clock[2])));
  return `${day}, ${new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }).format(at)}`;
}

export function factDisplayValue(
  id: string,
  value: string,
  language: Language,
) {
  if (value === "Yes" || value === "Sí") return translated(language, "Yes", "Sí");
  if (value === "No") return "No";
  if (language !== "Español") return value;
  const demoValues: Record<string, Record<string, string>> = {
    "fact-registration-date": { "August 12, 2027 at 9:00 a.m.": "12 de agosto de 2027, 9:00 a. m." },
    "fact-nurse-review": { "August 13, 2027 at 1:30 p.m. at the Welcome Center": "13 de agosto de 2027, 1:30 p. m., en el Centro de Bienvenida" },
    "fact-registration-location": { "Mesa View Welcome Center, 145 Oak Street": "Centro de Bienvenida de Mesa View, 145 Oak Street" },
    "fact-orientation-cafeteria": { "School cafeteria": "Cafetería de la escuela" },
    "fact-orientation-gym": { "Gym": "Gimnasio" },
    "fact-immunization-record": { "Availability not confirmed": "Disponibilidad sin confirmar" },
    "fact-interpreter-preference": { "Not answered yet": "Aún no se ha respondido" },
  };
  return demoValues[id]?.[value] ?? value;
}

export const FACT_STATE_META: Record<
  ConfirmationState,
  { en: string; es: string; className: string }
> = {
  proposed: {
    en: "Check this",
    es: "Revisar",
    className: "fd-fact-proposed",
  },
  confirmed: {
    en: "Confirmed",
    es: "Confirmado",
    className: "fd-fact-confirmed",
  },
  unclear: {
    en: "Unclear",
    es: "No está claro",
    className: "fd-fact-unclear",
  },
  conflicted: {
    en: "Conflicting",
    es: "En conflicto",
    className: "fd-fact-conflicted",
  },
  superseded: {
    en: "Not selected",
    es: "No seleccionado",
    className: "fd-fact-superseded",
  },
};

export function translated(
  language: Language,
  english: string,
  spanish: string,
) {
  return language === "Español" ? spanish : english;
}
