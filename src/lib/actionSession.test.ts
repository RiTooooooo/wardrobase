import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

import { requireWritableUserId } from "./actionSession";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("DEMO_USER_EMAIL", "demo@example.com");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("requireWritableUserId", () => {
  it("未ログインなら拒否する", async () => {
    mocks.getSession.mockResolvedValue(null);

    const result = await requireWritableUserId();

    expect("error" in result).toBe(true);
  });

  it("デモアカウントの書き込みを拒否する", async () => {
    mocks.getSession.mockResolvedValue({
      user: { id: "demo-id", email: "demo@example.com" },
    });

    const result = await requireWritableUserId();

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error.message).toContain("デモアカウント");
    }
  });

  it("通常ユーザーには userId を返す", async () => {
    mocks.getSession.mockResolvedValue({
      user: { id: "user-1", email: "me@example.com" },
    });

    const result = await requireWritableUserId();

    expect(result).toEqual({ userId: "user-1" });
  });
});
