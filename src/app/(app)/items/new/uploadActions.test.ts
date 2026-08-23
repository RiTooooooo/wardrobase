import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as PresignedUrlModule from "@/infrastructure/s3/presignedUrl";

const mocks = vi.hoisted(() => ({
  requireWritableUserId: vi.fn(),
  createUploadUrl: vi.fn(),
}));

vi.mock("@/lib/actionSession", () => ({
  requireWritableUserId: mocks.requireWritableUserId,
}));

vi.mock("@/infrastructure/s3/presignedUrl", async (importOriginal) => {
  const actual = await importOriginal<typeof PresignedUrlModule>();

  return { ...actual, createUploadUrl: mocks.createUploadUrl };
});

import { getUploadUrlAction } from "./uploadActions";

const MB = 1024 * 1024;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireWritableUserId.mockResolvedValue({ userId: "user-1" });
  mocks.createUploadUrl.mockResolvedValue("https://example.com/upload");
});

describe("getUploadUrlAction の認可", () => {
  it("未ログイン・デモ等でガードが拒否したら URL を発行しない", async () => {
    mocks.requireWritableUserId.mockResolvedValue({
      error: { ok: false, message: "ログインが必要です" },
    });

    const result = await getUploadUrlAction("image/jpeg", 1 * MB);

    expect(result.ok).toBe(false);
    expect(mocks.createUploadUrl).not.toHaveBeenCalled();
  });
});

describe("getUploadUrlAction のサイズ検証", () => {
  it("5MB 以下の妥当なリクエストは URL を発行し、キーが本人配下になる", async () => {
    const result = await getUploadUrlAction("image/jpeg", 1 * MB);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.key.startsWith("user-1/")).toBe(true);
    }
  });

  it("5MB 超は拒否する", async () => {
    const result = await getUploadUrlAction("image/jpeg", 6 * MB);

    expect(result.ok).toBe(false);
  });

  it("NaN・負数・0・Infinity の申告を拒否する", async () => {
    for (const size of [Number.NaN, -1, 0, Number.POSITIVE_INFINITY]) {
      const result = await getUploadUrlAction("image/jpeg", size);

      expect(result.ok).toBe(false);
    }
    expect(mocks.createUploadUrl).not.toHaveBeenCalled();
  });

  it("許可外の Content-Type を拒否する", async () => {
    const result = await getUploadUrlAction("application/octet-stream", 1 * MB);

    expect(result.ok).toBe(false);
    expect(mocks.createUploadUrl).not.toHaveBeenCalled();
  });
});
