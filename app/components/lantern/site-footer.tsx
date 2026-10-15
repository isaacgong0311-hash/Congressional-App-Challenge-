import Link from "next/link";

import { LanternMark } from "./brand";

export function SiteFooter({ language = "en" }: { language?: "en" | "es" }) {
  const spanish = language === "es";
  return (
    <footer className="border-t border-ink/10 bg-ink text-white print:hidden">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] lg:px-12">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-amber">
              <LanternMark />
            </span>
            <div>
              <p className="font-bold">Lantern</p>
              <p className="text-sm text-white/60">{spanish ? "Entienda la fuente. Sepa qué hacer después." : "Understand the source. Know the next step."}</p>
            </div>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-6 text-white/60">
            {spanish ? "Lantern ayuda a las familias a entender documentos y preparar preguntas. No ofrece asesoría legal, escolar ni oficial. Confirme las instrucciones importantes con la oficina indicada en el documento." : "Lantern helps families understand documents and prepare questions. It is not legal, school, or official advice. Always confirm critical instructions with the office named in the source."}
          </p>
        </div>
        <nav aria-label={spanish ? "Navegación del pie de página" : "Footer navigation"} className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm font-semibold text-white/75 sm:grid-cols-3 md:grid-cols-2">
          <Link className="hover:text-white" href={spanish ? "/first-day?lang=es" : "/first-day"}>{spanish ? "Primer Día" : "First Day"}</Link>
          <Link className="hover:text-white" href={spanish ? "/explain?lang=es" : "/explain"}>{spanish ? "Explicar una carta" : "Explain a letter"}</Link>
          <Link className="hover:text-white" href="/first-day/how-it-works">{spanish ? "Cómo funciona" : "How it works"}</Link>
          <Link className="hover:text-white" href="/about">{spanish ? "Acerca del proyecto" : "About the project"}</Link>
          <Link className="hover:text-white" href="/contact">{spanish ? "Contacto" : "Contact / feedback"}</Link>
          <Link className="hover:text-white" href="/privacy">{spanish ? "Privacidad" : "Privacy"}</Link>
          <a className="hover:text-white" href="https://github.com/isaacgong0311-hash/Congressional-App-Challenge-" rel="noreferrer" target="_blank">{spanish ? "Código fuente" : "Source code"}</a>
        </nav>
      </div>
    </footer>
  );
}
