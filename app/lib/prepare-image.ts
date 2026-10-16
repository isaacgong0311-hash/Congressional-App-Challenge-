// Vercel Functions reject request bodies over 4.5 MB before our route runs, so
// large phone photos are shrunk in the browser first. Falls back to the original
// file whenever the browser cannot decode or re-encode it.
export const UPLOAD_TARGET_BYTES = 3.5 * 1024 * 1024;
const MAX_EDGE = 2400;

export async function prepareImageForUpload(file: File): Promise<File> {
  if (file.size <= UPLOAD_TARGET_BYTES) return file;
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    for (const quality of [0.88, 0.8, 0.7, 0.6]) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality),
      );
      if (blob && blob.size <= UPLOAD_TARGET_BYTES) {
        const name = file.name.replace(/\.[^.]+$/, "") || "page";
        return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
      }
    }
    return file;
  } catch {
    return file;
  }
}

// Hosting layers answer oversize bodies with plain text, not our JSON envelope.
export async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return response.status === 413
      ? { error: { code: "PAYLOAD_TOO_LARGE", message: "Image is too large.", retryable: false } }
      : { error: { code: "INTERNAL_ERROR", message: "Unexpected response.", retryable: true } };
  }
}
