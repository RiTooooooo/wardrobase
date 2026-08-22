import "dotenv/config";

import { randomUUID } from "node:crypto";

import { CopyObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

/**
 * デモアカウントへサンプルデータを複製するシードスクリプト。
 *
 * SEED_SOURCE_EMAIL（既定: test@co.jp）のアイテム・スタイリング・コーデを
 * DEMO_USER_EMAIL のアカウントへコピーする。画像も S3 上で複製する。
 * 実行のたびにデモ側の既存データを消してから入れ直す（何度でも実行できる）。
 *
 * 使い方（.env の環境変数を読み込んで実行）:
 *   npx tsx prisma/seed-demo.ts
 *
 * 本番に対して実行する場合は DATABASE_URL / S3_* / DEMO_USER_EMAIL を
 * 本番の値にした状態で同じコマンドを実行する。
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`${key} が設定されていません。`);
  }
  return value;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requireEnv("DATABASE_URL") }),
});

const s3 = new S3Client({
  endpoint: requireEnv("S3_ENDPOINT"),
  region: requireEnv("S3_REGION"),
  credentials: {
    accessKeyId: requireEnv("S3_ACCESS_KEY"),
    secretAccessKey: requireEnv("S3_SECRET_KEY"),
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
});

const BUCKET = requireEnv("S3_BUCKET");

async function findUserId(email: string): Promise<string> {
  const user = await prisma.user.findFirst({ where: { email } });
  if (user === null) {
    throw new Error(`ユーザーが見つかりません: ${email}`);
  }
  return user.id;
}

async function wipeDemoData(demoId: string): Promise<void> {
  await prisma.wearLog.deleteMany({ where: { userId: demoId } });
  await prisma.outfit.deleteMany({ where: { userId: demoId } });
  await prisma.styling.deleteMany({ where: { userId: demoId } });
  await prisma.item.deleteMany({ where: { userId: demoId } });
}

async function copyImage(sourceKey: string, demoId: string): Promise<string> {
  const ext = sourceKey.split(".").pop() ?? "bin";
  const newKey = `${demoId}/${randomUUID()}.${ext}`;

  await s3.send(
    new CopyObjectCommand({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${sourceKey}`,
      Key: newKey,
    }),
  );

  return newKey;
}

function mustGet(idMap: Map<string, string>, key: string): string {
  const value = idMap.get(key);
  if (value === undefined) {
    throw new Error(`idMap に存在しないキー: ${key}`);
  }
  return value;
}

async function copyItems(
  sourceId: string,
  demoId: string,
): Promise<Map<string, string>> {
  const items = await prisma.item.findMany({
    where: { userId: sourceId, deletedAt: null },
  });
  const idMap = new Map<string, string>();

  for (const item of items) {
    const imagePath =
      item.imagePath === null ? null : await copyImage(item.imagePath, demoId);
    const created = await prisma.item.create({
      data: {
        userId: demoId,
        imagePath,
        name: item.name,
        category: item.category,
        subCategory: item.subCategory,
        color: item.color,
        seasons: item.seasons,
        brand: item.brand,
        price: item.price,
        purchasedAt: item.purchasedAt,
        memo: item.memo,
        status: item.status,
        createdAt: item.createdAt,
      },
    });
    idMap.set(item.id, created.id);
  }

  return idMap;
}

async function copyStylings(
  sourceId: string,
  demoId: string,
  idMap: Map<string, string>,
): Promise<number> {
  const stylings = await prisma.styling.findMany({
    where: { userId: sourceId, deletedAt: null },
    include: { items: true },
  });

  for (const styling of stylings) {
    const items = styling.items.filter((si) => idMap.has(si.itemId));
    await prisma.styling.create({
      data: {
        userId: demoId,
        name: styling.name,
        seasons: styling.seasons,
        memo: styling.memo,
        createdAt: styling.createdAt,
        items: {
          create: items.map((si) => ({
            itemId: mustGet(idMap, si.itemId),
            positionX: si.positionX,
            positionY: si.positionY,
            zIndex: si.zIndex,
            scale: si.scale,
          })),
        },
      },
    });
  }

  return stylings.length;
}

/** デモへ複製しないコーデの着用日（SEED_EXCLUDE_WORN_ON, カンマ区切りの YYYY-MM-DD） */
function excludedWornOnDates(): Set<string> {
  const raw = process.env.SEED_EXCLUDE_WORN_ON ?? "";

  return new Set(
    raw
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value !== ""),
  );
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function copyOutfits(
  sourceId: string,
  demoId: string,
  idMap: Map<string, string>,
): Promise<number> {
  const excluded = excludedWornOnDates();
  const outfits = await prisma.outfit.findMany({
    where: { userId: sourceId, deletedAt: null },
    include: { items: true },
  });

  let copied = 0;

  for (const outfit of outfits) {
    if (excluded.has(toDateKey(outfit.wornOn))) continue;
    copied += 1;
    const itemIds = outfit.items
      .filter((oi) => idMap.has(oi.itemId))
      .map((oi) => mustGet(idMap, oi.itemId));
    const created = await prisma.outfit.create({
      data: {
        userId: demoId,
        wornOn: outfit.wornOn,
        satisfaction: outfit.satisfaction,
        weather: outfit.weather,
        memo: outfit.memo,
        createdAt: outfit.createdAt,
        items: { create: itemIds.map((itemId) => ({ itemId })) },
      },
    });
    for (const itemId of itemIds) {
      await prisma.wearLog.upsert({
        where: { itemId_wornOn: { itemId, wornOn: outfit.wornOn } },
        create: {
          userId: demoId,
          itemId,
          wornOn: outfit.wornOn,
          outfitId: created.id,
        },
        update: {},
      });
    }
  }

  return copied;
}

async function main(): Promise<void> {
  const sourceEmail = process.env.SEED_SOURCE_EMAIL ?? "test@co.jp";
  const demoEmail = requireEnv("DEMO_USER_EMAIL");
  const sourceId = await findUserId(sourceEmail);
  const demoId = await findUserId(demoEmail);

  await wipeDemoData(demoId);
  const idMap = await copyItems(sourceId, demoId);
  const stylingCount = await copyStylings(sourceId, demoId, idMap);
  const outfitCount = await copyOutfits(sourceId, demoId, idMap);

  console.log(
    `複製完了: ${sourceEmail} → ${demoEmail} (items=${idMap.size}, stylings=${stylingCount}, outfits=${outfitCount})`,
  );
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
