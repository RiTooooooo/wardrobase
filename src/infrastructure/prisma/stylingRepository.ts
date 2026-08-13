import type { Item, Styling, StylingItem } from "@/generated/prisma/client";

import { prisma } from "./client";

export type StylingWithItems = Styling & {
  items: Array<StylingItem & { item: Item }>;
};

export type CreateStylingData = {
  name: string;
  itemIds: string[];
  seasons: Array<"SPRING" | "SUMMER" | "AUTUMN" | "WINTER">;
  memo?: string;
};

export type BoardItemData = {
  itemId: string;
  x: number;
  y: number;
  zIndex: number;
  scale: number;
};

export type CreateStylingBoardData = {
  name: string;
  items: BoardItemData[];
  seasons: Array<"SPRING" | "SUMMER" | "AUTUMN" | "WINTER">;
  memo?: string;
};

const INCLUDE_ITEMS = {
  items: { include: { item: true } },
} as const;

export async function findStylingsByUser(
  userId: string,
): Promise<StylingWithItems[]> {
  return prisma.styling.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: INCLUDE_ITEMS,
  });
}

export async function findStylingById(
  userId: string,
  id: string,
): Promise<StylingWithItems | null> {
  return prisma.styling.findFirst({
    where: { id, userId, deletedAt: null },
    include: INCLUDE_ITEMS,
  });
}

export async function createStyling(
  userId: string,
  data: CreateStylingData,
): Promise<Styling> {
  return prisma.styling.create({
    data: {
      userId,
      name: data.name,
      seasons: data.seasons,
      memo: data.memo ?? null,
      items: {
        create: data.itemIds.map((itemId) => ({ itemId })),
      },
    },
  });
}

export async function updateStyling(
  userId: string,
  id: string,
  data: CreateStylingData,
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.styling.updateMany({
      where: { id, userId, deletedAt: null },
      data: {
        name: data.name,
        seasons: data.seasons,
        memo: data.memo ?? null,
      },
    });

    if (result.count === 0) return 0;

    await tx.stylingItem.deleteMany({ where: { stylingId: id } });
    await tx.stylingItem.createMany({
      data: data.itemIds.map((itemId) => ({ stylingId: id, itemId })),
    });

    return result.count;
  });
}

export async function createStylingWithBoard(
  userId: string,
  data: CreateStylingBoardData,
): Promise<Styling> {
  return prisma.styling.create({
    data: {
      userId,
      name: data.name,
      seasons: data.seasons,
      memo: data.memo ?? null,
      items: {
        create: data.items.map((item) => ({
          itemId: item.itemId,
          positionX: item.x,
          positionY: item.y,
          zIndex: item.zIndex,
          scale: item.scale,
        })),
      },
    },
  });
}

export async function updateStylingBoard(
  userId: string,
  id: string,
  data: CreateStylingBoardData,
): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const result = await tx.styling.updateMany({
      where: { id, userId, deletedAt: null },
      data: {
        name: data.name,
        seasons: data.seasons,
        memo: data.memo ?? null,
      },
    });

    if (result.count === 0) return 0;

    await tx.stylingItem.deleteMany({ where: { stylingId: id } });
    await tx.stylingItem.createMany({
      data: data.items.map((item) => ({
        stylingId: id,
        itemId: item.itemId,
        positionX: item.x,
        positionY: item.y,
        zIndex: item.zIndex,
        scale: item.scale,
      })),
    });

    return result.count;
  });
}

export async function softDeleteStyling(
  userId: string,
  id: string,
): Promise<number> {
  const result = await prisma.styling.updateMany({
    where: { id, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  });

  return result.count;
}
