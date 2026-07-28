import { readFileSync } from "node:fs";
import { join } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("./client", () => ({
  prisma: { item: mocks },
}));

import {
  createItem,
  findItemById,
  findItemsByUser,
  softDeleteItem,
  updateItem,
} from "./itemRepository";

const USER_ID = "user-1";
const OTHER_ID = "item-1";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findMany.mockResolvedValue([]);
  mocks.findFirst.mockResolvedValue(null);
  mocks.create.mockResolvedValue({});
  mocks.updateMany.mockResolvedValue({ count: 1 });
});

/**
 * RLS が無いため「userId で絞り忘れる」＝「他人のデータが見える」。
 * 全ての関数が userId で絞っていることを機械的に検証する（conventions.md §5）。
 */
describe("userId による絞り込み", () => {
  it("findItemsByUser は userId と deletedAt:null で絞る", async () => {
    await findItemsByUser(USER_ID);

    const where = mocks.findMany.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.deletedAt).toBeNull();
  });

  it("findItemById は id だけでなく userId でも絞る", async () => {
    await findItemById(USER_ID, OTHER_ID);

    const where = mocks.findFirst.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.id).toBe(OTHER_ID);
    expect(where.deletedAt).toBeNull();
  });

  it("updateItem は where に userId を含める", async () => {
    await updateItem(USER_ID, OTHER_ID, { name: "新しい名前" });

    const where = mocks.updateMany.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.id).toBe(OTHER_ID);
  });

  it("softDeleteItem は where に userId を含める", async () => {
    await softDeleteItem(USER_ID, OTHER_ID);

    const where = mocks.updateMany.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.id).toBe(OTHER_ID);
  });

  it("createItem は引数の userId を必ず設定する", async () => {
    await createItem(USER_ID, {
      name: "Tシャツ",
      category: "TOPS",
      color: "ホワイト",
      seasons: ["SPRING"],
    });

    const data = mocks.create.mock.calls[0][0].data;
    expect(data.userId).toBe(USER_ID);
  });
});

describe("他人のデータを操作できないこと", () => {
  it("updateItem は該当が無いとき0件を返す", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    const count = await updateItem(USER_ID, "someone-elses-item", {
      name: "書き換え",
    });

    expect(count).toBe(0);
  });

  it("softDeleteItem は該当が無いとき0件を返す", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    const count = await softDeleteItem(USER_ID, "someone-elses-item");

    expect(count).toBe(0);
  });
});

describe("禁止された API を使っていないこと", () => {
  /** コメントは検査対象から外す。規約の説明文にAPI名が出てくるため */
  function readSourceWithoutComments(): string {
    const source = readFileSync(
      join(import.meta.dirname, "itemRepository.ts"),
      "utf8",
    );

    return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  }

  it("findUnique を使っていない", () => {
    expect(readSourceWithoutComments()).not.toContain("findUnique(");
  });

  it("物理削除（delete / deleteMany）を使っていない", () => {
    const source = readSourceWithoutComments();

    expect(source).not.toContain(".delete(");
    expect(source).not.toContain(".deleteMany(");
  });
});
