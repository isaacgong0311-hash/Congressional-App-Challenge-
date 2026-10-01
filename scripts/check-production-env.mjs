// Keep local builds and provider-free tests available; fail closed on Vercel production.
if (process.env.VERCEL_ENV === "production" && !process.env.GROQ_API_KEY?.trim()) {
  console.error("Production build blocked: configure GROQ_API_KEY in the Vercel production environment.");
  process.exit(1);
}
