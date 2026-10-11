import type { Result } from "./letter-tool-state";

// Matches public/sample-letter.png. This fictional example is bundled with the
// app, so trying it never sends a document or request to an AI provider.
const english: Result = {
  documentType: "Fictional Medicaid denial notice",
  category: "healthcare",
  confidence: 100,
  whyThisType: "The heading says “Notice of Action - Medicaid” and the letter says the application was denied.",
  urgency: "high",
  meaning: "This fictional notice says a medical assistance application was denied because proof of income was not received. It says the applicant may appeal. The printed response date, June 25, 2026, has already passed.",
  keyDetails: {
    sender: "Sample State Department of Health Services",
    contactPhone: "555-0123",
    accountNumber: "884-221-0098",
    amountDue: null,
  },
  whatTheyNeed: ["Review the missing proof-of-income request", "Ask the office about appeal options"],
  documentChecklist: [
    { item: "Pay stubs from the last 30 days", why: "The sample notice asks for them as proof of income." },
    { item: "This notice", why: "Keep the fictional case number and office phone number together." },
  ],
  responseLetter: { applicable: false, kind: "", body: "" },
  nextSteps: [
    { step: "Check the date", detail: "The sample deadline was June 25, 2026 and is now in the past. This is a fictional demonstration, not a current notice." },
    { step: "Contact the office", detail: "For a real notice, use a verified office number to ask about missing documents and appeal rights." },
  ],
  phoneScript: "I received a notice saying proof of income was missing. Could you explain what documents are needed and how to appeal?",
  deadline: "June 25, 2026",
  deadlineISO: "2026-06-25",
  isPossibleScam: false,
  scamSigns: [],
  isCrisis: false,
  crisisMessage: "",
  scamAgencyFacts: "",
  whatHappensIfNothing: "For this fictional example, the denial would remain unresolved unless the applicant contacts the office or appeals.",
  photoQualityNote: null,
  detectedLetterLanguage: "English",
  originalText: "Notice of Action - Medicaid\nDate: June 10, 2026\nCase Number: 884-221-0098\nYour application for medical assistance has been DENIED.\nReason: We did not receive proof of income.\nTo keep your coverage you must submit pay stubs from the last 30 days. You have the right to appeal.\nDEADLINE: You must respond by June 25, 2026.\nIf you have questions call the County Office at 555-0123.",
};

const spanish: Result = {
  ...english,
  documentType: "Aviso ficticio de denegación de Medicaid",
  whyThisType: "El título dice “Notice of Action - Medicaid” y la carta indica que se denegó la solicitud.",
  meaning: "Este aviso ficticio dice que se denegó una solicitud de asistencia médica porque no se recibió un comprobante de ingresos. Indica que la persona puede apelar. La fecha de respuesta impresa, el 25 de junio de 2026, ya pasó.",
  whatTheyNeed: ["Revisar la solicitud de comprobante de ingresos", "Preguntar a la oficina por las opciones de apelación"],
  documentChecklist: [
    { item: "Talones de pago de los últimos 30 días", why: "El aviso de ejemplo los pide como comprobante de ingresos." },
    { item: "Este aviso", why: "Conserve juntos el número de caso ficticio y el teléfono de la oficina." },
  ],
  nextSteps: [
    { step: "Revise la fecha", detail: "El plazo del ejemplo fue el 25 de junio de 2026 y ya pasó. Esta es una demostración ficticia, no un aviso vigente." },
    { step: "Llame a la oficina", detail: "Si tiene un aviso real, use un número verificado para preguntar por los documentos faltantes y su derecho a apelar." },
  ],
  phoneScript: "Recibí un aviso que dice que faltaba un comprobante de ingresos. ¿Podría explicarme qué documentos necesitan y cómo puedo apelar?",
  whatHappensIfNothing: "En este ejemplo ficticio, la denegación seguiría sin resolverse si la persona no contacta a la oficina ni apela.",
};

export function sampleLetterResult(language: string): Result {
  return structuredClone(language === "Spanish" ? spanish : english);
}
