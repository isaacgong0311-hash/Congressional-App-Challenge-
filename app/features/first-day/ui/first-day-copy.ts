import type {
  ConfirmationState,
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
