import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  registerOutfit: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

vi.mock("@/application/outfit/registerOutfit", () => ({
  registerOutfit: mocks.registerOutfit,
}));

import { createOutfitAction } from "./actions";

const VALID_INPUT = {
  wornOn: "2026-08-01",
  itemIds: ["550e8400-e29b-41d4-a716-446655440000"],
  satisfaction: 4,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.headers.mockResolvedValue(new Headers());
  mocks.registerOutfit.mockResolvedValue("outfit-1");
});

describe("createOutfitAction の認可", () => {
  it("未ログインのとき失敗し、登録処理を呼ばない", async () => {
    mocks.getSession.mockResolvedValue(null);

    const result = await createOutfitAction(VALID_INPUT);

    expect(result.ok).toBe(false);
    expect(mocks.registerOutfit).not.toHaveBeenCalled();
  });

  it("セッションの userId を使う", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "session-user" } });

    await createOutfitAction(VALID_INPUT);

    expect(mocks.registerOutfit.mock.calls[0][0]).toBe("session-user");
  });
});

describe("createOutfitAction の入力検証", () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("正しい入力で成功し、idを返す", async () => {
    const result = await createOutfitAction(VALID_INPUT);

    expect(result).toEqual({ ok: true, id: "outfit-1" });
  });

  it("アイテムが空のとき弾く", async () => {
    const result = await createOutfitAction({
      ...VALID_INPUT,
      itemIds: [],
    });

    expect(result.ok).toBe(false);
    expect(mocks.registerOutfit).not.toHaveBeenCalled();
  });

  it("日付が無いとき弾く", async () => {
    const result = await createOutfitAction({
      ...VALID_INPUT,
      wornOn: "",
    });

    expect(result.ok).toBe(false);
  });
});
