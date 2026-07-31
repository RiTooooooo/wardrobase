import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  registerItem: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

vi.mock("@/application/item/registerItem", () => ({
  registerItem: mocks.registerItem,
}));

import { createItemAction } from "./actions";

const VALID_INPUT = {
  name: "Tシャツ",
  category: "TOPS",
  color: "WHITE",
  seasons: ["SPRING"],
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.headers.mockResolvedValue(new Headers());
  mocks.registerItem.mockResolvedValue("item-1");
});

describe("createItemAction の認可", () => {
  it("未ログインのとき失敗し、登録処理を呼ばない", async () => {
    mocks.getSession.mockResolvedValue(null);

    const result = await createItemAction(VALID_INPUT);

    expect(result.ok).toBe(false);
    expect(mocks.registerItem).not.toHaveBeenCalled();
  });

  it("クライアントが送った userId ではなくセッションの userId を使う", async () => {
    mocks.getSession.mockResolvedValue({ user: { id: "session-user" } });

    await createItemAction({ ...VALID_INPUT, userId: "attacker-supplied" });

    expect(mocks.registerItem.mock.calls[0][0]).toBe("session-user");
  });
});

describe("createItemAction の入力検証", () => {
  beforeEach(() => {
    mocks.getSession.mockResolvedValue({ user: { id: "user-1" } });
  });

  it("正しい入力で成功し、idを返す", async () => {
    const result = await createItemAction(VALID_INPUT);

    expect(result).toEqual({ ok: true, id: "item-1" });
  });

  it("不正な入力を弾き、登録処理を呼ばない", async () => {
    const result = await createItemAction({ ...VALID_INPUT, category: "HAT" });

    expect(result.ok).toBe(false);
    expect(mocks.registerItem).not.toHaveBeenCalled();
  });

  it("アイテム名が空のとき弾く", async () => {
    const result = await createItemAction({ ...VALID_INPUT, name: "" });

    expect(result.ok).toBe(false);
  });
});
