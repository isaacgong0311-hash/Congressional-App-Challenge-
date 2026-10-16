export type PublicApiError = {
  code: string;
  message: string;
  requestId?: string;
  retryable: boolean;
};

export function publicApiError(
  payload: unknown,
  fallback: string,
): PublicApiError {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = payload.error;
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return {
        code:
          "code" in error && typeof error.code === "string"
            ? error.code
            : "INTERNAL_ERROR",
        message: error.message,
        requestId:
          "requestId" in error && typeof error.requestId === "string"
            ? error.requestId
            : undefined,
        retryable: "retryable" in error && error.retryable === true,
      };
    }
    if (typeof error === "string") {
      return {
        code: "INTERNAL_ERROR",
        message: error,
        retryable: true,
      };
    }
  }

  return {
    code: "INTERNAL_ERROR",
    message: fallback,
    retryable: true,
  };
}

export function readingFailureMessage(
  code: string,
  language: string,
  fallback: string,
) {
  const spanish = language === "Spanish" || language === "Español";
  switch (code) {
    case "RATE_LIMITED":
      return spanish
        ? "Hay demasiadas solicitudes en este momento. Espere un minuto e inténtelo de nuevo, o pruebe la demo ficticia."
        : "Too many requests right now. Please wait a minute and try again, or use the fictional demo.";
    case "NO_TEXT_FOUND":
      return spanish
        ? "No encontramos palabras en esta foto. Asegúrese de que toda la carta esté en la foto, plana y con buena luz, y tome otra foto."
        : "We couldn't find any words in this photo. Make sure the whole letter is in the frame, flat, and well lit, then take another photo.";
    case "UNSUPPORTED_MEDIA":
      return spanish
        ? "Este tipo de archivo no funciona. Use una foto JPG o PNG."
        : "This file type doesn't work. Please use a JPG or PNG photo.";
    case "PAYLOAD_TOO_LARGE":
      return spanish
        ? "Esta foto es demasiado grande (más de 10 MB). Tome una foto nueva o elija una más pequeña."
        : "This photo is too large (over 10 MB). Take a new photo or choose a smaller one.";
    case "PROVIDER_UNAVAILABLE":
      return spanish
        ? "La lectura de documentos no está disponible ahora. Puede probar la demo ficticia."
        : "Document reading is unavailable right now. You can try the fictional demo.";
    case "PROVIDER_TIMEOUT":
      return spanish
        ? "La lectura tardó demasiado. Inténtelo de nuevo o pruebe la demo ficticia."
        : "Reading took too long. Please try again or use the fictional demo.";
    case "INVALID_PROVIDER_RESPONSE":
      return spanish
        ? "No pudimos comprobar la respuesta de lectura. Inténtelo de nuevo o pruebe la demo ficticia."
        : "We couldn't verify the reading response. Please try again or use the fictional demo.";
    case "PROVIDER_REJECTED":
    case "INTERNAL_ERROR":
      return spanish
        ? "No pudimos leer el documento en este momento. Inténtelo de nuevo más tarde o pruebe la demo ficticia."
        : "We couldn't read the document right now. Please try again later or use the fictional demo.";
    default:
      return fallback;
  }
}
