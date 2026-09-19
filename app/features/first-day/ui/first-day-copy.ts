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
    action: "Lleve el registro de vacunas o use la cita confirmada con la enfermera.",
    detail: "Este procedimiento ficticio permite cualquiera de las dos opciones.",
  },
  "task-orientation": {
    title: "Confirmar dónde empieza la orientación",
    action: "Pregunte si la familia debe entrar por la cafetería o el gimnasio.",
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

export function localizedTaskCopy(task: DerivedTask, language: Language) {
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
      title: "Abrir el formulario de inscripción de Round Rock ISD",
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
  "fact-immunization-record": "Registro de vacunas disponible",
  "fact-nurse-review": "Revisión con la enfermera",
  "fact-orientation-cafeteria": "Lugar de orientación",
  "fact-orientation-gym": "Lugar de orientación",
  "fact-interpreter-preference": "Intérprete solicitado",
};

export const DOCUMENT_ES: Record<string, string> = {
  "doc-welcome-letter": "Carta de bienvenida para inscripción",
  "doc-health-note": "Nota de la oficina de salud",
  "doc-follow-up-message": "Mensaje de seguimiento de la escuela",
};

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
