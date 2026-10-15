export type TeamMember = { name: string; role: string };

export const team: readonly TeamMember[] = [
  { name: "Isaac Gong", role: "Creator and project lead" },
  { name: "Karthik Devarasetty", role: "Project partner" },
  { name: "Vihan Santhosh", role: "Project partner" },
];

function names(members: readonly TeamMember[], language: "en" | "es") {
  return new Intl.ListFormat(language, { style: "long", type: "conjunction" }).format(
    members.map((member) => member.name),
  );
}

export function aboutHeroCopy(
  members: readonly TeamMember[] = team,
  language: "en" | "es" = "en",
) {
  if (members.length === 0) throw new Error("Lantern needs at least one team member.");

  const memberNames = names(members, language);
  if (language === "es") {
    return members.length === 1
      ? `Soy ${memberNames}, quien creó Lantern para el Congressional App Challenge. Comenzó con una pregunta sencilla: ¿y si una familia pudiera convertir instrucciones escolares dispersas en un plan que pueda revisar, cuestionar y llevar consigo?`
      : `Somos ${memberNames}, el equipo que creó Lantern para el Congressional App Challenge. Comenzó con una pregunta sencilla: ¿y si una familia pudiera convertir instrucciones escolares dispersas en un plan que pueda revisar, cuestionar y llevar consigo?`;
  }

  return members.length === 1
    ? `I'm ${memberNames}, the student who built Lantern for the Congressional App Challenge. It began with a simple question: what if a family could turn scattered school instructions into one plan they can inspect, question, and carry?`
    : `We're ${memberNames}, the team who built Lantern for the Congressional App Challenge. It began with a simple question: what if a family could turn scattered school instructions into one plan they can inspect, question, and carry?`;
}

export function renderTeamReadme(members: readonly TeamMember[] = team) {
  if (members.length === 0) throw new Error("Lantern needs at least one team member.");
  return `## Team\n\n${members.map(({ name, role }) => `- ${name} — ${role}`).join("\n")}\n`;
}
