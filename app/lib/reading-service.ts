export function readingUnavailable(language = "English") {
  return /^(spanish|español|es)$/i.test(language)
    ? "El servicio de lectura no está disponible en este momento. Inténtelo de nuevo en unos minutos. No necesita volver a tomar la foto."
    : "The reading service is unavailable right now. Please try again in a few minutes. You do not need to retake your photo.";
}
