import { describe, expect, it, vi } from "vitest";

import type { TransactionClient } from "./itemOwnership";
import { ownsAllItems } from "./itemOwnership";

const USER_ID = "user-1";

function makeTx(count: number): {
  tx: TransactionClient;
  countMock: ReturnType<typeof vi.fn>;
} {
  const countMock = vi.fn().mockResolvedValue(count);
  const tx = { item: { count: countMock } } as unknown as TransactionClient;

  return { tx, countMock };
}

describe("ownsAllItems", () => {
  it("userId と deletedAt:null で件数を数える", async () => {
    const { tx, countMock } = makeTx(2);

    await ownsAllItems(tx, USER_ID, ["a", "b"]);

    const where = countMock.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.deletedAt).toBeNull();
    expect(where.id).toEqual({ in: ["a", "b"] });
  });

  it("全て本人のアイテムなら true", async () => {
    const { tx } = makeTx(2);

    expect(await ownsAllItems(tx, USER_ID, ["a", "b"])).toBe(true);
  });

  it("他人（または存在しない）アイテムが混ざっていたら false", async () => {
    const { tx } = makeTx(1);

    expect(await ownsAllItems(tx, USER_ID, ["a", "someone-elses"])).toBe(false);
  });

  it("重複した itemId は1件として数える", async () => {
    const { tx, countMock } = makeTx(1);

    expect(await ownsAllItems(tx, USER_ID, ["a", "a"])).toBe(true);
    expect(countMock.mock.calls[0][0].where.id).toEqual({ in: ["a"] });
  });
});
