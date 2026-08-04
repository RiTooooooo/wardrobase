import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  registerStyling: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

vi.mock("@/application/styling/registerStyling", () => ({
  registerStyling: mocks.registerStyling,
}));

import { createStylingAction } from "./actions";

const VALID_INPUT = {
  name: "仕事の日の定番",
  itemIds: ["550e8400-e29b-41d4-a716-446655440000"],
  seasons: ["SPRING"],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.headers.mockResolvedValue(new Headers());
  mocks.registerStyling.mockResolvedValue("styling-1");
});

describe("createStylingAction の認可", () => {
  it("未ログインのとき失敗し、登録処理を呼ばない", async () => {
    mocks.getSession.mockResolvedValue(null);

    const result = await createStylingAction(VALID_INPUT);

    expect(result.ok).toBe(false);
    expect(mocks.registerStyling).not.toHaveBeenCalled();
  });

  it("セッションの userId を使う", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "session-user" } });

    await createStylingAction(VALID_INPUT);

    expect(mocks.registerStyling.mock.calls[0][0]).toBe("session-user");
  });
});

describe("createStylingAction の入力検証", () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("正しい入力で成功し、idを返す", async () => {
    const result = await createStylingAction(VALID_INPUT);

    expect(result).toEqual({ ok: true, id: "styling-1" });
  });

  it("名前が空のとき弾く", async () => {
    const result = await createStylingAction({
      ...VALID_INPUT,
      name: "",
    });

    expect(result.ok).toBe(false);
    expect(mocks.registerStyling).not.toHaveBeenCalled();
  });

  it("アイテムが空のとき弾く", async () => {
    const result = await createStylingAction({
      ...VALID_INPUT,
      itemIds: [],
    });

    expect(result.ok).toBe(false);
    expect(mocks.registerStyling).not.toHaveBeenCalled();
  });
});
