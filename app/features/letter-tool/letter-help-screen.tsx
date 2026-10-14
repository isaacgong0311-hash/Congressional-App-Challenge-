import type { ComponentType } from "react";

import {
  BenefitsIcon,
  FinanceIcon,
  HealthcareIcon,
  HelpIcon,
  HomeIcon,
  ImmigrationIcon,
  LegalIcon,
  LightbulbIcon,
  SchoolIcon,
  type LanternIconProps,
} from "../../components/lantern/icons";
import { RESOURCES, type Category } from "../../resources";

const categories: Array<{
  key: Category;
  icon: ComponentType<LanternIconProps>;
  label: string;
  description: string;
}> = [
  { key: "housing", icon: HomeIcon, label: "Housing", description: "Eviction, rent, landlord" },
  { key: "healthcare", icon: HealthcareIcon, label: "Healthcare", description: "Medical bills, insurance" },
  { key: "benefits", icon: BenefitsIcon, label: "Food & benefits", description: "SNAP, food stamps" },
  { key: "utilities", icon: LightbulbIcon, label: "Utilities", description: "Shutoff notice" },
  { key: "legal", icon: LegalIcon, label: "Legal trouble", description: "Court, fines, summons" },
  { key: "school", icon: SchoolIcon, label: "School", description: "Financial aid, forms" },
  { key: "financial", icon: FinanceIcon, label: "Debt & money", description: "Collections, bills" },
  { key: "immigration", icon: ImmigrationIcon, label: "Immigration", description: "USCIS, visas" },
  { key: "other", icon: HelpIcon, label: "Something else", description: "General resources" },
];

const categoryTitles: Record<Category, string> = {
  housing: "Housing help",
  healthcare: "Healthcare help",
  benefits: "Food & benefits",
  utilities: "Utility help",
  legal: "Legal help",
  school: "School & financial aid",
  financial: "Debt & money help",
  immigration: "Immigration help",
  other: "General resources",
};

const categorySpanish: Record<Category, { label: string; description: string; title: string }> = {
  housing: { label: "Vivienda", description: "Desalojo, alquiler, propietario", title: "Ayuda con la vivienda" },
  healthcare: { label: "Salud", description: "Facturas médicas, seguro", title: "Ayuda con la salud" },
  benefits: { label: "Comida y beneficios", description: "SNAP, ayuda alimentaria", title: "Comida y beneficios" },
  utilities: { label: "Servicios básicos", description: "Aviso de corte de servicios", title: "Ayuda con los servicios básicos" },
  legal: { label: "Asuntos legales", description: "Tribunal, multas, citaciones", title: "Ayuda legal" },
  school: { label: "Escuela", description: "Ayuda financiera, formularios", title: "Escuela y ayuda financiera" },
  financial: { label: "Deudas y dinero", description: "Cobros, facturas", title: "Ayuda con deudas y dinero" },
  immigration: { label: "Inmigración", description: "USCIS, visas", title: "Ayuda con inmigración" },
  other: { label: "Otro asunto", description: "Recursos generales", title: "Recursos generales" },
};

const resourceDescriptionsSpanish: Record<string, string> = {
  "Free, confidential 24/7 line that connects you to local help in many languages.": "Línea gratuita y confidencial, disponible las 24 horas, que le conecta con ayuda local en varios idiomas.",
  "Free HUD-approved counselors for rent, eviction, and foreclosure help.": "Asesores gratuitos aprobados por HUD para alquiler, desalojo y ejecución hipotecaria.",
  "Find free legal aid near you for eviction and housing disputes.": "Encuentre ayuda legal gratuita para desalojos y problemas de vivienda.",
  "Help with Medicaid, CHIP, and Marketplace health coverage.": "Ayuda con Medicaid, CHIP y los seguros del Mercado de Salud.",
  "Official Medicaid info and links to your state's Medicaid office.": "Información oficial de Medicaid y contacto de la oficina de su estado.",
  "Help finding food assistance and SNAP/food-stamp resources.": "Ayuda para encontrar alimentos y recursos de SNAP.",
  "Official tool to find government benefits you may qualify for.": "Herramienta oficial para buscar beneficios públicos para los que podría reunir los requisitos.",
  "Help paying heating, cooling, and utility bills.": "Ayuda para pagar calefacción, aire acondicionado y servicios básicos.",
  "Find free or low-cost legal aid programs near you.": "Encuentre ayuda legal gratuita o de bajo costo cerca de usted.",
  "Directory of nonprofit legal-aid offices nationwide.": "Directorio nacional de oficinas de ayuda legal sin fines de lucro.",
  "Help with FAFSA, student loans, and college financial aid.": "Ayuda con FAFSA, préstamos estudiantiles y apoyo económico universitario.",
  "Help with debts, bills, and complaints against financial companies.": "Ayuda con deudas, facturas y quejas contra empresas financieras.",
  "Free and low-cost nonprofit credit and debt counseling.": "Asesoría sin fines de lucro gratuita o de bajo costo sobre crédito y deudas.",
  "Official help with immigration cases, notices, and appointments.": "Ayuda oficial con casos, avisos y citas de inmigración.",
  "Find trusted, low-cost immigration legal help near you.": "Encuentre ayuda legal de inmigración confiable y de bajo costo cerca de usted.",
};

export function LetterHelpScreen({
  category,
  language = "English",
  onBack,
  onChooseCategory,
  onOpenLetter,
}: {
  category: Category | null;
  language?: string;
  onBack: () => void;
  onChooseCategory: (category: Category | null) => void;
  onOpenLetter: () => void;
}) {
  const es = language === "Spanish";
  const copy = (english: string, spanish: string) => es ? spanish : english;
  return (
    <div className="mx-auto max-w-5xl py-10">
      <button className="mb-6 min-h-11 rounded-lg text-sm font-bold text-muted hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber" onClick={onBack} type="button">
        {copy("← Back", "← Volver")}
      </button>

      {!category ? (
        <>
          <p className="lantern-eyebrow">{copy("Verified help", "Ayuda revisada")}</p>
          <h1 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-ink sm:text-5xl">{copy("What’s going on?", "¿Qué está pasando?")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            {copy("Pick the closest option. Lantern will show hand-checked national resources without requiring a letter.", "Elija la opción más cercana. Lantern le mostrará recursos nacionales revisados a mano. No necesita una carta.")}
          </p>
          <ul aria-label={copy("Help categories", "Categorías de ayuda")} className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <li className="contents" key={item.key}>
                  <button
                    className="letter-help-category"
                    onClick={() => onChooseCategory(item.key)}
                    type="button"
                  >
                    <span className="letter-icon-well"><Icon className="h-5 w-5" /></span>
                    <span>
                      <span className="block text-sm font-bold text-ink">{es ? categorySpanish[item.key].label : item.label}</span>
                      <span className="mt-0.5 block text-xs text-muted">{es ? categorySpanish[item.key].description : item.description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 rounded-feature border border-cobalt/20 bg-[#eef2ff] p-5 text-center">
            <p className="font-bold text-ink">{copy("Not sure? Call 211", "¿No está seguro? Llame al 211")}</p>
            <p className="mt-1 text-sm text-[#53628b]">{copy("Free, confidential, available around the clock, and offered in many languages.", "Es gratis, confidencial, disponible todo el día y ofrece ayuda en varios idiomas.")}</p>
            <a className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-cobalt px-4 text-sm font-bold text-white" href="tel:211">{copy("Call 211", "Llamar al 211")}</a>
          </div>
          <p className="mt-5 text-center text-sm text-muted">
            {copy("Or ", "O ")}<button className="font-bold text-cobalt underline decoration-cobalt/30 underline-offset-4" onClick={onOpenLetter} type="button">{copy("upload a letter", "suba una carta")}</button>{copy(" and Lantern will explain it.", " y Lantern se la explicará.")}
          </p>
        </>
      ) : (
        <>
          <button className="mb-5 min-h-11 rounded-lg text-sm font-bold text-cobalt focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-amber" onClick={() => onChooseCategory(null)} type="button">
            {copy("← All categories", "← Todas las categorías")}
          </button>
          <h1 className="font-serif text-4xl tracking-[-0.04em] text-ink">{es ? categorySpanish[category].title : categoryTitles[category]}</h1>
          <p className="mt-3 text-sm text-muted">{copy("Real, free, national resources verified by hand—not generated by AI.", "Recursos nacionales gratuitos y reales, revisados a mano; la IA no los inventa.")}</p>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {RESOURCES[category].map((resource) => (
              <article className="rounded-card border border-ink/10 bg-surface p-5 shadow-sm" key={resource.name}>
                <h2 className="font-bold text-ink">{resource.name}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{es ? resourceDescriptionsSpanish[resource.desc] ?? resource.desc : resource.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {resource.phone ? <a className="inline-flex min-h-11 items-center rounded-xl bg-cobalt px-4 text-sm font-bold text-white" href={`tel:${resource.phone}`}>{copy("Call", "Llamar al")} {resource.phone}</a> : null}
                  {resource.url ? <a className="inline-flex min-h-11 items-center rounded-xl border border-ink/15 bg-white px-4 text-sm font-bold text-ink" href={resource.url} rel="noopener noreferrer" target="_blank">{copy("Visit website", "Visitar sitio web")} ↗</a> : null}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-feature border border-ink/10 bg-surface p-5 text-center shadow-sm">
            <p className="font-bold text-ink">{copy("Have a letter about this?", "¿Tiene una carta sobre este tema?")}</p>
            <p className="mt-1 text-sm text-muted">{copy("Upload it to see what it says and what to do next.", "Súbala para entender lo que dice y qué puede hacer después.")}</p>
            <button className="mt-4 min-h-11 rounded-xl bg-cobalt px-4 text-sm font-bold text-white" onClick={onOpenLetter} type="button">{copy("Upload my letter", "Subir mi carta")}</button>
          </div>
        </>
      )}
    </div>
  );
}
