"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  DocumentLineIcon,
  LanternMark,
  QuoteIcon,
  ShieldCheckIcon,
} from "./components/lantern/brand";
import { ProductHeader } from "./components/lantern/product-header";
import { SiteFooter } from "./components/lantern/site-footer";
import { useLanternPreferences } from "./components/lantern/use-lantern-preferences";
import { competitionProof } from "./features/first-day/content/competition-proof";
import { fictionalPreview } from "./features/first-day/content/fictional-case";
export default function HomeContent() {
  const { preferences, setPreferences } = useLanternPreferences();
  const spanish = preferences.preferredLanguage === "es";
  const copy = (english: string, spanishText: string) => spanish ? spanishText : english;
  const stages = [
    { number: "01", title: copy("Gather the pieces.", "Reúna los documentos."), description: copy("Bring school letters, reminders, and office notes into one place. Each page keeps its own identity.", "Reúna cartas, recordatorios y notas de la escuela. Cada página conserva su origen."), detail: copy("Your documents, together", "Sus documentos, juntos"), icon: DocumentLineIcon },
    { number: "02", title: copy("Make sense of them.", "Entienda lo importante."), description: copy("Check dates, places, and requirements beside the original words. You decide what is confirmed.", "Revise fechas, lugares y requisitos junto al texto original. Usted decide qué está confirmado."), detail: copy("Every fact has a source", "Cada dato tiene una fuente"), icon: QuoteIcon },
    { number: "03", title: copy("Know your next step.", "Sepa qué hacer después."), description: copy("Follow a clear checklist, work through unanswered questions, and take a printable plan with you.", "Siga una lista clara, resuelva dudas y lleve un plan impreso."), detail: copy("A plan you can carry", "Un plan que puede llevar"), icon: CheckCircleIcon },
  ];

  useEffect(() => {
    document.documentElement.lang = spanish ? "es" : "en";
    return () => { document.documentElement.lang = "en"; };
  }, [spanish]);

  function chooseLanguage(language: "en" | "es") {
    setPreferences((current) => ({ ...current, preferredLanguage: language }));
  }

  return (
    <div className="lantern-home" data-language={spanish ? "es" : "en"}>
      <a className="home-skip" href="#main-content">
        {copy("Skip to content", "Ir al contenido")}
      </a>
      <ProductHeader language={spanish ? "es" : "en"} />
      <main id="main-content">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-container home-hero-grid">
            <div className="home-hero-copy">
              <div aria-label={copy("Choose language", "Elija el idioma")} className="home-language-choice" role="group">
                <button aria-pressed={!spanish} onClick={() => chooseLanguage("en")} type="button">English</button>
                <button aria-pressed={spanish} onClick={() => chooseLanguage("es")} type="button">Español</button>
              </div>
              <p className="home-kicker">
                <span className="home-status-dot" /> {copy("A little clarity when a letter feels confusing", "Un poco de claridad cuando una carta confunde")}
              </p>
              <h1 id="home-title">
                {copy("Understand the letter.", "Entienda la carta.")}
                <br />
                <em>{copy("Know what to do next.", "Sepa qué hacer después.")}</em>
              </h1>
              <p className="home-lead">
                {copy("A bill, school note, or official letter can be hard to read. Lantern explains it in plain language. You decide what to do next.", "Una factura, nota escolar o carta oficial puede ser difícil de entender. Lantern se la explica con palabras sencillas. Usted decide qué hacer después.")}
              </p>
              <div className="home-hero-actions">
                <Link className="home-button" href={spanish ? "/explain?lang=es" : "/explain"}>
                  {copy("Explain a letter", "Explicar una carta")} <ArrowUpRightIcon />
                </Link>
                <Link className="home-text-link" href={spanish ? "/first-day?demo=1&lang=es" : "/first-day?demo=1"}>
                  {copy("Try the school demo", "Probar la demo escolar")} <ArrowUpRightIcon />
                </Link>
              </div>
              <p className="home-small-note">
                <CheckCircleIcon /> {copy("Try a sample letter without uploading yours", "Pruebe una carta de ejemplo sin subir la suya")}
              </p>
            </div>
            <figure
              className="home-preview"
              aria-label={copy("Fictional example of a school plan with source-linked instructions", "Ejemplo ficticio de un plan escolar con instrucciones vinculadas a sus fuentes")}
            >
              <figcaption className="home-preview-caption">
                <span>
                  <span className="home-status-dot" /> {copy("A clearer picture", "Una idea más clara")}
                </span>
                <span>{copy("Fictional school example", "Ejemplo escolar ficticio")}</span>
              </figcaption>
              <div className="home-plan-window">
                <div className="home-window-bar">
                  <span>
                    <LanternMark /> Lantern{" "}
                    <span className="home-window-divider">/</span> {copy("First Day", "Primer Día")}
                  </span>
                  <span
                    className="home-family-avatar"
                    aria-label={copy("Rivera family", "Familia Rivera")}
                  >
                    R
                  </span>
                </div>
                <div className="home-window-body">
                  <div className="home-plan-heading">
                    <div>
                      <p className="home-label">{copy(fictionalPreview.familyLabel, "Familia Rivera")}</p>
                      <h2>{copy("Your first day, organized.", "Su primer día, organizado.")}</h2>
                    </div>
                    <span className="home-plan-date">
                      {copy("Sample", "Ejemplo")}
                      <br />
                      <strong>{copy("school plan", "plan escolar")}</strong>
                    </span>
                  </div>
                  <div className="home-plan-tabs" aria-hidden="true">
                    <span>{copy("3 documents", "3 documentos")}</span>
                    <span>{copy("Review facts", "Revisar datos")}</span>
                    <span className="is-selected">{copy("Your plan", "Su plan")}</span>
                  </div>
                  <div className="home-task">
                    <span className="home-task-check">
                      <CheckCircleIcon />
                    </span>
                    <div>
                      <h3>{copy("Gather enrollment documents", "Reunir documentos de inscripción")}</h3>
                      <p>{copy("Keep the required paperwork together.", "Mantenga juntos los documentos necesarios.")}</p>
                      <span className="home-source-ref">
                        <DocumentLineIcon /> {copy(fictionalPreview.welcomeDocument.label, "Carta de bienvenida para inscripción")} · {copy("Page", "Página")} {fictionalPreview.welcomeDocument.pageIndex}
                      </span>
                    </div>
                    <span className="home-pill">{copy("Ready", "Listo")}</span>
                  </div>
                  <div className="home-task">
                    <span className="home-task-check">
                      <CheckCircleIcon />
                    </span>
                    <div>
                      <h3>{copy(fictionalPreview.registrationTask.title, "Ir a la reunión de inscripción")}</h3>
                      <p>{fictionalPreview.enrollmentLocationQuote}</p>
                      <span className="home-source-ref">
                        <DocumentLineIcon /> {copy(fictionalPreview.welcomeDocument.label, "Carta de bienvenida para inscripción")} · {copy("Page", "Página")} {fictionalPreview.welcomeDocument.pageIndex}
                      </span>
                    </div>
                    <span className="home-pill">{copy("Ready", "Listo")}</span>
                  </div>
                  <div className="home-task home-task-unclear">
                    <span className="home-question-mark">?</span>
                    <div>
                      <h3>{copy(fictionalPreview.orientationTask.title, "Confirmar el lugar de la orientación")}</h3>
                      <p>{copy(fictionalPreview.orientationTask.detail, "Dos documentos indican lugares diferentes para la orientación.")}</p>
                    </div>
                    <span className="home-pill home-pill-amber">
                      {copy("Ask the school", "Preguntar a la escuela")}
                    </span>
                  </div>
                  <div className="home-plan-footnote">
                    <ShieldCheckIcon /> {copy("Every step connects back to your documents.", "Cada paso se vincula con sus documentos.")}
                  </div>
                </div>
              </div>
              <div className="home-evidence-note">
                <span className="home-evidence-icon">
                  <QuoteIcon />
                </span>
                <div>
                  <strong>{copy("Clarity you can check.", "Claridad que puede verificar.")}</strong>
                  <p>{copy("Original words. Always one step away.", "El texto original siempre está a un paso.")}</p>
                </div>
                <CheckCircleIcon className="home-evidence-check" />
              </div>
            </figure>
          </div>
          <div className="home-container">
            <div className="home-trust-strip">
              <span>{copy("Made for the people behind the paperwork.", "Hecho para las personas detrás de los papeles.")}</span>
              <ul>
                <li>
                  <ShieldCheckIcon /> {copy("No saved family account", "Sin cuenta familiar guardada")}
                </li>
                <li>
                  <QuoteIcon /> {copy("Instructions linked to the original", "Instrucciones vinculadas al original")}
                </li>
                <li>
                  <span className="home-language-icon" aria-hidden="true">
                    A / Ñ
                  </span>{" "}
                  {copy("English + Spanish", "Inglés + español")}
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section
          className="home-section home-container"
          id="how-it-works"
          aria-labelledby="flow-title"
        >
          <div className="home-section-heading">
            <div>
              <p className="home-kicker">{copy("A simple way forward", "Una manera sencilla de avanzar")}</p>
              <h2 id="flow-title">
                {copy("From a stack of letters", "De un montón de cartas")}
                <br />
                {copy("to a little more certainty.", "a un poco más de claridad.")}
              </h2>
            </div>
            <p>
              {copy("You don’t need to figure everything out at once. Just take it one step at a time.", "No tiene que resolver todo de una vez. Avance paso a paso.")}
            </p>
          </div>
          <div className="home-steps">
            {stages.map(({ number, title, description, detail, icon: Icon }) => (
              <article className="home-step" key={number}>
                <div className="home-step-top">
                  <span className="home-step-icon">
                    <Icon />
                  </span>
                  <span className="home-step-number">{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="home-step-detail">
                  <CheckCircleIcon /> {detail}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="home-container" aria-labelledby="difference-title">
          <div className="home-difference">
            <div className="home-difference-copy">
              <p className="home-kicker">{copy("Clarity includes the unknowns", "La claridad también muestra las dudas")}</p>
              <h2 id="difference-title">
                {copy("When the letters disagree,", "Cuando las cartas se contradicen,")}
                <br />
                <em>{copy("you deserve to know.", "usted debe saberlo.")}</em>
              </h2>
              <p>
                {copy("The cafeteria on one page. The gym on another. Lantern keeps both sources visible and helps you prepare the right question for the school.", "Una página dice cafetería y otra dice gimnasio. Lantern muestra ambas fuentes y le ayuda a preparar la pregunta para la escuela.")}
              </p>
              <Link className="home-text-link" href="/first-day/how-it-works">
                {copy("See how the plan is made", "Vea cómo se crea el plan")} <ArrowUpRightIcon />
              </Link>
            </div>
            <div className="home-comparison">
              <div className="home-comparison-sources">
                <article>
                  <span className="home-label">
                    <DocumentLineIcon /> {copy(fictionalPreview.welcomeDocument.label, "Carta de bienvenida para inscripción")} · P. {fictionalPreview.welcomeDocument.pageIndex}
                  </span>
                  <p>“{fictionalPreview.orientationCafeteriaQuote}”</p>
                </article>
                <span
                  className="home-conflict-symbol"
                  aria-label={copy("Conflicting locations", "Lugares contradictorios")}
                >
                  ≠
                </span>
                <article>
                  <span className="home-label">
                    <DocumentLineIcon /> {copy(fictionalPreview.followUpDocument.label, "Mensaje de seguimiento de la escuela")} · P. {fictionalPreview.followUpDocument.pageIndex}
                  </span>
                  <p>“{fictionalPreview.orientationGymQuote}”</p>
                </article>
              </div>
              <div className="home-question">
                <span className="home-label">{copy("WHAT TO ASK THE SCHOOL", "QUÉ PREGUNTAR A LA ESCUELA")}</span>
                <p>{copy(fictionalPreview.orientationTask.action, "¿La orientación será en la cafetería o en el gimnasio?")}</p>
                <span className="home-question-footer">
                  <span className="home-status-dot" /> {copy("Waiting for the school’s answer", "Esperando la respuesta de la escuela")}
                </span>
              </div>
              <p className="home-example-label">
                {copy("Illustrative example · The family confirms the answer.", "Ejemplo ficticio · La familia confirma la respuesta.")}
              </p>
            </div>
          </div>
        </section>
        <section className="home-container" aria-labelledby="versus-title">
          <div className="home-versus">
            <h2 id="versus-title">{copy("A smooth summary can hide the problem.", "Un resumen fluido puede ocultar el problema.")}</h2>
            <div className="home-versus-grid">
              <article className="home-versus-card">
                <span className="home-label">{copy("A generic summary (illustrative)", "Un resumen genérico (ilustrativo)")}</span>
                <p>{copy("“Orientation is coming up. Go to the cafeteria and bring your documents.”", "“La orientación se acerca. Vaya a la cafetería y lleve sus documentos.”")}</p>
                <p className="home-versus-note">{copy("Sounds sure. Never mentions the second letter said gym.", "Suena seguro. No menciona que la segunda carta decía gimnasio.")}</p>
              </article>
              <article className="home-versus-card is-lantern">
                <span className="home-label">Lantern</span>
                <p>{copy("“Two documents disagree: cafeteria vs. gym. Ask the school before you go.”", "“Dos documentos no coinciden: cafetería o gimnasio. Pregunte a la escuela antes de ir.”")}</p>
                <p className="home-versus-note">{copy("Both exact quotes stay visible. You confirm the answer.", "Ambas citas exactas quedan visibles. Usted confirma la respuesta.")}</p>
              </article>
            </div>
            <p className="home-example-label">{copy("The generic summary is an invented example of the failure Lantern is built to avoid, not output from a named product.", "El resumen genérico es un ejemplo inventado del error que Lantern busca evitar, no la respuesta de un producto específico.")}</p>
          </div>
        </section>
        <section
          className="home-section home-container home-support"
          aria-labelledby="trust-title"
        >
          <article className="home-privacy">
            <span className="home-support-icon">
              <ShieldCheckIcon />
            </span>
            <p className="home-kicker">{copy("Room to feel comfortable", "Usted tiene el control")}</p>
            <h2 id="trust-title">
              {copy("Your family’s next chapter.", "El siguiente capítulo de su familia.")}
              <br />
              {copy("Your information to control.", "Su información bajo su control.")}
            </h2>
            <p>
              {copy("Try the fictional demo without sharing a document. No account or saved family case. If you choose to explain your own letter, its image is sent to Groq when you submit it.", "Pruebe la demo ficticia sin compartir documentos. No necesita cuenta y Lantern no guarda un caso familiar. Si decide explicar su propia carta, la imagen se envía a Groq cuando la envía.")}
            </p>
            <Link className="home-text-link" href="/privacy">
              {copy("How we handle your information", "Cómo tratamos su información")} <ArrowUpRightIcon />
            </Link>
          </article>
          <article className="home-letter-card">
            <div className="home-letter-illustration" aria-hidden="true">
              <div className="home-mini-letter">
                <DocumentLineIcon />
                <span />
                <span />
                <span />
              </div>
              <span className="home-letter-badge">
                <QuoteIcon />
              </span>
            </div>
            <p className="home-kicker">{copy("Beyond the first day", "Más allá del primer día")}</p>
            <h2>{copy("One confusing letter?", "¿Una carta confusa?")}</h2>
            <p>
              {copy("A bill, benefit notice, or official form. Get a plain-language explanation and help deciding what to do next.", "Una factura, aviso de beneficios o formulario oficial. Reciba una explicación sencilla y ayuda para decidir qué hacer después.")}
            </p>
            <Link className="home-text-link" href={spanish ? "/explain?lang=es" : "/explain"}>
              {copy("Explain a confusing letter", "Explicar una carta confusa")} <ArrowUpRightIcon />
            </Link>
          </article>
        </section>
        <section className="home-proof" aria-labelledby="proof-title">
          <div className="home-container home-proof-grid">
            <div>
              <p className="home-kicker">{copy("Built to be checked", "Un trabajo que puede revisar")}</p>
              <h2 id="proof-title">{copy("Small details. Real accountability.", "Cada detalle cuenta.")}</h2>
              <p>
                {copy(`We checked Lantern against ${competitionProof.packetCount} made-up school document sets.`, `Probamos Lantern con ${competitionProof.packetCount} conjuntos ficticios de documentos escolares.`)}
              </p>
            </div>
            <dl>
              {competitionProof.metrics.map((metric) => (
                <div key={metric.id}>
                  <dt>{spanish
                    ? ({ quotes: "citas del documento encontradas", conflicts: "contradicciones encontradas", dates: "fechas leídas correctamente", tasks: "pasos con fuente" } as Record<string, string>)[metric.id] ?? metric.label
                    : ({ quotes: "document quotes found", conflicts: "contradictions found", dates: "dates read correctly", tasks: "steps with sources" } as Record<string, string>)[metric.id] ?? metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
            <p className="home-proof-note">
              {competitionProof.conflictFalsePositives > 0
                ? copy(`The test also found ${competitionProof.conflictFalsePositives} unintended conflict${competitionProof.conflictFalsePositives === 1 ? "" : "s"}. `, `La prueba también marcó ${competitionProof.conflictFalsePositives} contradicción que no existía. `)
                : ""}
              {copy("These results come from made-up documents, not real family cases.", "Estos resultados vienen de documentos ficticios, no de casos de familias reales.")} <Link href="/first-day/how-it-works">{copy("See the test details", "Ver detalles de la prueba")}</Link>.
            </p>
          </div>
        </section>
        <section
          className="home-final home-container"
          aria-labelledby="final-title"
        >
          <span className="home-final-mark">
            <LanternMark />
          </span>
          <p className="home-kicker">{copy("One less thing to worry about", "Una preocupación menos")}</p>
          <h2 id="final-title">
            {copy("A new school.", "Una escuela nueva.")}
            <br />
            <em>{copy("A clearer start.", "Un comienzo más claro.")}</em>
          </h2>
          <p>
            {copy("Meet the Rivera family’s sample case and see how a few scattered pages become a plan.", "Conozca el caso ficticio de la familia Rivera y vea cómo varias páginas se convierten en un plan.")}
          </p>
          <Link className="home-button" href={spanish ? "/first-day?demo=1&lang=es" : "/first-day?demo=1"}>
            {copy("Start the guided demo", "Iniciar la demo guiada")} <ArrowUpRightIcon />
          </Link>
          <span className="home-final-note">
            {copy("Fictional documents. A real look at how Lantern works.", "Documentos ficticios. Una muestra real de cómo funciona Lantern.")}
          </span>
        </section>
      </main>
      <SiteFooter language={spanish ? "es" : "en"} />
    </div>
  );
}
