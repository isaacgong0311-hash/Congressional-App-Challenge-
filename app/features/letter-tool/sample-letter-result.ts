import type { Result } from "./letter-tool-state";

// Matches public/sample-letter.png. This fictional example is bundled with the
// app, so trying it never sends a document or request to an AI provider.
const english: Result = {
  documentType: "Fictional Medicaid denial notice",
  category: "healthcare",
  confidence: 95,
  whyThisType: "The heading says “Notice of Action - Medicaid” and the letter says the application was denied.",
  urgency: "high",
  meaning: "This fictional notice says a medical assistance application was denied because proof of income was not received. It says the applicant may appeal. The response deadline printed on the letter is January 29, 2027.",
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
    { step: "Gather proof of income before January 29, 2027", detail: "Collect pay stubs from the last 30 days. This is a fictional demonstration, not a real notice." },
    { step: "Contact the office", detail: "For a real notice, use a verified office number to ask about missing documents and appeal rights." },
  ],
  phoneScript: "I received a notice saying proof of income was missing. Could you explain what documents are needed and how to appeal?",
  deadline: "January 29, 2027",
  deadlineISO: "2027-01-29",
  isPossibleScam: false,
  scamSigns: [],
  isCrisis: false,
  crisisMessage: "",
  scamAgencyFacts: "",
  whatHappensIfNothing: "For this fictional example, the denial would remain unresolved unless the applicant contacts the office or appeals.",
  photoQualityNote: null,
  detectedLetterLanguage: "English",
  originalText: "Notice of Action - Medicaid\nDate: January 8, 2027\nCase Number: 884-221-0098\nYour application for medical assistance has been DENIED.\nReason: We did not receive proof of income.\nTo keep your coverage you must submit pay stubs from the last 30 days. You have the right to appeal.\nDEADLINE: You must respond by January 29, 2027.\nIf you have questions call the County Office at 555-0123.",
};

const spanish: Result = {
  ...english,
  documentType: "Aviso ficticio de denegación de Medicaid",
  whyThisType: "El título dice “Notice of Action - Medicaid” y la carta indica que se denegó la solicitud.",
  meaning: "Este aviso ficticio dice que se denegó una solicitud de asistencia médica porque no se recibió un comprobante de ingresos. Indica que la persona puede apelar. La fecha límite impresa en la carta es el 29 de enero de 2027.",
  whatTheyNeed: ["Revisar la solicitud de comprobante de ingresos", "Preguntar a la oficina por las opciones de apelación"],
  documentChecklist: [
    { item: "Talones de pago de los últimos 30 días", why: "El aviso de ejemplo los pide como comprobante de ingresos." },
    { item: "Este aviso", why: "Conserve juntos el número de caso ficticio y el teléfono de la oficina." },
  ],
  nextSteps: [
    { step: "Reúna el comprobante de ingresos antes del 29 de enero de 2027", detail: "Junte los talones de pago de los últimos 30 días. Esta es una demostración ficticia, no un aviso real." },
    { step: "Llame a la oficina", detail: "Si tiene un aviso real, use un número verificado para preguntar por los documentos faltantes y su derecho a apelar." },
  ],
  phoneScript: "Recibí un aviso que dice que faltaba un comprobante de ingresos. ¿Podría explicarme qué documentos necesitan y cómo puedo apelar?",
  whatHappensIfNothing: "En este ejemplo ficticio, la denegación seguiría sin resolverse si la persona no contacta a la oficina ni apela.",
};

export function sampleLetterResult(language: string): Result {
  return structuredClone(language === "Spanish" ? spanish : english);
}
