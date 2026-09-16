import { describe, expect, it } from "vitest";

import {
  MAX_CASE_BYTES,
  MAX_DOCUMENT_BYTES,
  reduceUploadQueue,
  validateUploadSelection,
  type UploadQueueItem,
} from "../../app/features/first-day/domain/upload-queue";

function candidate(
  name: string,
  size = 1024,
  type = "image/jpeg",
) {
  return { name, size, type };
}

function queued(documentId = "doc-1"): UploadQueueItem {
  return {
    documentId,
    fileName: `${documentId}.jpg`,
    mimeType: "image/jpeg",
    size: 1024,
    status: "queued",
  };
}

describe("First Day upload selection", () => {
  it("accepts at most five JPG or PNG pages in order", () => {
    const result = validateUploadSelection([], [
      candidate("one.jpg"),
      candidate("two.png", 1024, "image/png"),
      candidate("three.jpg"),
      candidate("four.jpg"),
      candidate("five.jpg"),
      candidate("six.jpg"),
    ]);

    expect(result.accepted.map((file) => file.name)).toEqual([
      "one.jpg",
      "two.png",
      "three.jpg",
      "four.jpg",
      "five.jpg",
    ]);
    expect(result.rejected).toEqual([
      expect.objectContaining({ fileName: "six.jpg", code: "too_many" }),
    ]);
  });

  it("rejects unsupported, oversized, and over-total-limit files", () => {
    const existing = [
      { ...queued(), size: MAX_CASE_BYTES - 1024, status: "ready" as const },
    ];
    const result = validateUploadSelection(existing, [
      candidate("form.pdf", 1024, "application/pdf"),
      candidate("huge.jpg", MAX_DOCUMENT_BYTES + 1),
      candidate("page.png", 2048, "image/png"),
    ]);

    expect(result.accepted).toHaveLength(0);
    expect(result.rejected.map((item) => item.code)).toEqual([
      "unsupported_type",
      "file_too_large",
      "case_too_large",
    ]);
  });
});

describe("First Day upload queue", () => {
  it("processes pages sequentially", () => {
    const initial = [queued("doc-1"), queued("doc-2")];
    const first = reduceUploadQueue(initial, {
      type: "start",
      documentId: "doc-1",
      requestId: "request-1",
    });

    expect(first.map((item) => item.status)).toEqual(["processing", "queued"]);
    expect(
      reduceUploadQueue(first, {
        type: "start",
        documentId: "doc-2",
        requestId: "request-2",
      }),
    ).toBe(first);
  });

  it("ignores late and duplicate results after a page is removed", () => {
    const processing = reduceUploadQueue([queued()], {
      type: "start",
      documentId: "doc-1",
      requestId: "request-1",
    });
    const removed = reduceUploadQueue(processing, {
      type: "remove",
      documentId: "doc-1",
    });
    const late = reduceUploadQueue(removed, {
      type: "succeed",
      documentId: "doc-1",
      requestId: "request-1",
    });

    expect(late).toBe(removed);
    expect(late[0]?.status).toBe("removed");
  });

  it("retries only failed pages without changing successful pages", () => {
    const ready = { ...queued("doc-ready"), status: "ready" as const };
    const failed = {
      ...queued("doc-failed"),
      status: "error" as const,
      error: "Could not read this page.",
    };
    const retried = reduceUploadQueue([ready, failed], {
      type: "retry",
      documentId: "doc-failed",
    });

    expect(retried[0]).toBe(ready);
    expect(retried[1]).toEqual(
      expect.objectContaining({ status: "queued", error: undefined }),
    );
  });
});
