export const MAX_DOCUMENTS = 5;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_CASE_BYTES = 25 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);

export type UploadStatus =
  | "queued"
  | "processing"
  | "ready"
  | "error"
  | "removed";

export type UploadQueueItem = {
  documentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: UploadStatus;
  requestId?: string;
  error?: string;
};

export type UploadCandidate = {
  name: string;
  type: string;
  size: number;
};

export type UploadRejectionCode =
  | "unsupported_type"
  | "file_too_large"
  | "case_too_large"
  | "too_many";

export type UploadRejection = {
  fileName: string;
  code: UploadRejectionCode;
};

export function validateUploadSelection<T extends UploadCandidate>(
  existing: UploadQueueItem[],
  candidates: T[],
): { accepted: T[]; rejected: UploadRejection[] } {
  const active = existing.filter((item) => item.status !== "removed");
  let count = active.length;
  let totalBytes = active.reduce((sum, item) => sum + item.size, 0);
  const accepted: T[] = [];
  const rejected: UploadRejection[] = [];

  for (const candidate of candidates) {
    let code: UploadRejectionCode | undefined;

    if (!SUPPORTED_IMAGE_TYPES.has(candidate.type)) {
      code = "unsupported_type";
    } else if (candidate.size > MAX_DOCUMENT_BYTES) {
      code = "file_too_large";
    } else if (count >= MAX_DOCUMENTS) {
      code = "too_many";
    } else if (totalBytes + candidate.size > MAX_CASE_BYTES) {
      code = "case_too_large";
    }

    if (code) {
      rejected.push({ fileName: candidate.name, code });
      continue;
    }

    accepted.push(candidate);
    count += 1;
    totalBytes += candidate.size;
  }

  return { accepted, rejected };
}

type UploadQueueAction =
  | { type: "reset" }
  | { type: "enqueue"; items: UploadQueueItem[] }
  | { type: "start"; documentId: string; requestId: string }
  | { type: "succeed"; documentId: string; requestId: string }
  | { type: "fail"; documentId: string; requestId: string; error: string }
  | { type: "retry"; documentId: string }
  | { type: "remove"; documentId: string };

export function reduceUploadQueue(
  queue: UploadQueueItem[],
  action: UploadQueueAction,
): UploadQueueItem[] {
  if (action.type === "reset") return [];

  if (action.type === "enqueue") {
    return action.items.length ? [...queue, ...action.items] : queue;
  }

  if (action.type === "start") {
    if (queue.some((item) => item.status === "processing")) return queue;
    const target = queue.find(
      (item) => item.documentId === action.documentId && item.status === "queued",
    );
    if (!target) return queue;
    return queue.map((item) =>
      item === target
        ? {
            ...item,
            status: "processing",
            requestId: action.requestId,
            error: undefined,
          }
        : item,
    );
  }

  const target = queue.find((item) => item.documentId === action.documentId);
  if (!target) return queue;

  if (action.type === "remove") {
    if (target.status === "removed") return queue;
    return queue.map((item) =>
      item === target
        ? { ...item, status: "removed", requestId: undefined, error: undefined }
        : item,
    );
  }

  if (action.type === "retry") {
    if (target.status !== "error") return queue;
    return queue.map((item) =>
      item === target
        ? { ...item, status: "queued", requestId: undefined, error: undefined }
        : item,
    );
  }

  if (
    target.status !== "processing" ||
    target.requestId !== action.requestId
  ) {
    return queue;
  }

  return queue.map((item) => {
    if (item !== target) return item;
    if (action.type === "succeed") {
      return { ...item, status: "ready", requestId: undefined, error: undefined };
    }
    return {
      ...item,
      status: "error",
      requestId: undefined,
      error: action.error,
    };
  });
}
