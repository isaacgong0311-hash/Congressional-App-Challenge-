// Pages are read one at a time, so the model cannot see which key an earlier
// page used. Conflict detection compares facts that share a semantic key, so
// equivalent keys such as "enrollment.place" and "registration.location" must
// collapse to one canonical key before facts are grouped.

// Offered to the model in the extraction prompt. Other keys remain valid, but
// preferring these keeps pages consistent with one another.
export const PREFERRED_SEMANTIC_KEYS = [
  "orientation.date",
  "orientation.time",
  "orientation.location",
  "registration.date",
  "registration.time",
  "registration.location",
  "registration.deadline",
  "first_day.date",
  "first_day.time",
  "first_day.location",
  "health_forms.deadline",
  "immunization.deadline",
  "immunization.record",
  "records.deadline",
  "registration.contact",
] as const;

const EVENT_ALIASES: Record<string, string> = {
  enrollment: "registration",
  enroll: "registration",
  register: "registration",
  sign_up: "registration",
  signup: "registration",
  inscripcion: "registration",
  registro: "registration",
  orientacion: "orientation",
  first_day_of_school: "first_day",
  school_start: "first_day",
  start_of_school: "first_day",
  primer_dia: "first_day",
  health_form: "health_forms",
  health_paperwork: "health_forms",
  immunizations: "immunization",
  vaccination: "immunization",
  vaccinations: "immunization",
  vaccine: "immunization",
  vaccines: "immunization",
  vacunas: "immunization",
};

const FIELD_ALIASES: Record<string, string> = {
  place: "location",
  venue: "location",
  site: "location",
  where: "location",
  room: "location",
  building: "location",
  lugar: "location",
  day: "date",
  dates: "date",
  when: "date",
  fecha: "date",
  start_time: "time",
  starts_at: "time",
  hour: "time",
  hora: "time",
  due_date: "deadline",
  due: "deadline",
  cutoff: "deadline",
  fecha_limite: "deadline",
  phone: "contact",
  email: "contact",
};

function foldKeyPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Meeting and check-in locations are distinct fields in real letters, so only
// exact field aliases are collapsed; compound fields are left alone.
export function canonicalizeSemanticKey(key: string): string {
  const dot = key.indexOf(".");
  if (dot < 0) return foldKeyPart(key);
  const event = foldKeyPart(key.slice(0, dot));
  const field = foldKeyPart(key.slice(dot + 1));
  if (!event || !field) return key;
  return `${EVENT_ALIASES[event] ?? event}.${FIELD_ALIASES[field] ?? field}`;
}
