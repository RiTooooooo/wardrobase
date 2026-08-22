import { readFileSync } from "node:fs";
import { join } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
  $transaction: vi.fn(),
}));

vi.mock("./client", () => ({
  prisma: {
    styling: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
      create: mocks.create,
      updateMany: mocks.updateMany,
    },
    $transaction: mocks.$transaction,
  },
}));

import {
  createStyling,
  findStylingById,
  findStylingsByUser,
  softDeleteStyling,
  updateStylingBoard,
} from "./stylingRepository";

const USER_ID = "user-1";
const STYLING_ID = "styling-1";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findMany.mockResolvedValue([]);
  mocks.findFirst.mockResolvedValue(null);
  mocks.updateMany.mockResolvedValue({ count: 1 });
});

describe("userId による絞り込み", () => {
  it("findStylingsByUser は userId と deletedAt:null で絞る", async () => {
    await findStylingsByUser(USER_ID);

    const where = mocks.findMany.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.deletedAt).toBeNull();
  });

  it("findStylingById は id だけでなく userId でも絞る", async () => {
    await findStylingById(USER_ID, STYLING_ID);

    const where = mocks.findFirst.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.id).toBe(STYLING_ID);
    expect(where.deletedAt).toBeNull();
  });

  it("softDeleteStyling は where に userId を含める", async () => {
    await softDeleteStyling(USER_ID, STYLING_ID);

    const where = mocks.updateMany.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.id).toBe(STYLING_ID);
  });
});

describe("他人のデータを操作できないこと", () => {
  it("softDeleteStyling は該当が無いとき0件を返す", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    const count = await softDeleteStyling(USER_ID, "someone-elses-styling");

    expect(count).toBe(0);
  });
});

describe("アイテムの所有チェック", () => {
  function makeTx(ownedCount: number): Record<string, Record<string, ReturnType<typeof vi.fn>>> {
    return {
      item: { count: vi.fn().mockResolvedValue(ownedCount) },
      styling: {
        create: vi.fn().mockResolvedValue({ id: STYLING_ID }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      stylingItem: { deleteMany: vi.fn(), createMany: vi.fn() },
    };
  }

  function useTx(tx: ReturnType<typeof makeTx>): void {
    mocks.$transaction.mockImplementation(
      (fn: (t: unknown) => Promise<unknown>) => fn(tx),
    );
  }

  it("他人のアイテムが混ざっていたら createStyling は作成せず null", async () => {
    const tx = makeTx(1);
    useTx(tx);

    const result = await createStyling(USER_ID, {
      name: "test",
      itemIds: ["a", "b"],
      seasons: [],
    });

    expect(result).toBeNull();
    expect(tx.styling.create).not.toHaveBeenCalled();
  });

  it("他人のアイテムが混ざっていたら updateStylingBoard は更新せず 0", async () => {
    const tx = makeTx(1);
    useTx(tx);

    const result = await updateStylingBoard(USER_ID, STYLING_ID, {
      name: "test",
      items: [
        { itemId: "a", x: 0, y: 0, zIndex: 0, scale: 1 },
        { itemId: "b", x: 0, y: 0, zIndex: 1, scale: 1 },
      ],
      seasons: [],
    });

    expect(result).toBe(0);
    expect(tx.styling.updateMany).not.toHaveBeenCalled();
  });
});

describe("禁止された API を使っていないこと", () => {
  function readSourceWithoutComments(): string {
    const source = readFileSync(
      join(import.meta.dirname, "stylingRepository.ts"),
      "utf8",
    );

    return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  }

  it("findUnique を使っていない", () => {
    expect(readSourceWithoutComments()).not.toContain("findUnique(");
  });
});
