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
    outfit: {
      findMany: mocks.findMany,
      findFirst: mocks.findFirst,
      create: mocks.create,
      updateMany: mocks.updateMany,
    },
    $transaction: mocks.$transaction,
  },
}));

import {
  createOutfit,
  findOutfitById,
  findOutfitsByUser,
  updateOutfit,
} from "./outfitRepository";

const USER_ID = "user-1";
const OUTFIT_ID = "outfit-1";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.findMany.mockResolvedValue([]);
  mocks.findFirst.mockResolvedValue(null);
});

describe("userId による絞り込み", () => {
  it("findOutfitsByUser は userId と deletedAt:null で絞る", async () => {
    await findOutfitsByUser(USER_ID);

    const where = mocks.findMany.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.deletedAt).toBeNull();
  });

  it("findOutfitById は id だけでなく userId でも絞る", async () => {
    await findOutfitById(USER_ID, OUTFIT_ID);

    const where = mocks.findFirst.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(where.id).toBe(OUTFIT_ID);
    expect(where.deletedAt).toBeNull();
  });
});

describe("アイテムの所有チェック", () => {
  function makeTx(ownedCount: number): Record<string, Record<string, ReturnType<typeof vi.fn>>> {
    return {
      item: { count: vi.fn().mockResolvedValue(ownedCount) },
      outfit: {
        create: vi.fn().mockResolvedValue({ id: OUTFIT_ID }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      outfitItem: { deleteMany: vi.fn(), createMany: vi.fn() },
      wearLog: { upsert: vi.fn(), deleteMany: vi.fn() },
    };
  }

  function useTx(tx: ReturnType<typeof makeTx>): void {
    mocks.$transaction.mockImplementation(
      (fn: (t: unknown) => Promise<unknown>) => fn(tx),
    );
  }

  const DATA = { wornOn: new Date("2026-08-01"), itemIds: ["a", "b"] };

  it("createOutfit は紐付け前に本人のアイテムか検証する", async () => {
    const tx = makeTx(2);
    useTx(tx);

    await createOutfit(USER_ID, DATA);

    const where = tx.item.count.mock.calls[0][0].where;
    expect(where.userId).toBe(USER_ID);
    expect(tx.outfit.create).toHaveBeenCalled();
  });

  it("他人のアイテムが混ざっていたら createOutfit は作成せず null", async () => {
    const tx = makeTx(1);
    useTx(tx);

    expect(await createOutfit(USER_ID, DATA)).toBeNull();
    expect(tx.outfit.create).not.toHaveBeenCalled();
  });

  it("他人のアイテムが混ざっていたら updateOutfit は更新せず 0", async () => {
    const tx = makeTx(1);
    useTx(tx);

    expect(await updateOutfit(USER_ID, OUTFIT_ID, DATA)).toBe(0);
    expect(tx.outfit.updateMany).not.toHaveBeenCalled();
  });
});

describe("禁止された API を使っていないこと", () => {
  function readSourceWithoutComments(): string {
    const source = readFileSync(
      join(import.meta.dirname, "outfitRepository.ts"),
      "utf8",
    );

    return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  }

  it("findUnique を使っていない", () => {
    expect(readSourceWithoutComments()).not.toContain("findUnique(");
  });
});
