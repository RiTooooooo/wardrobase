import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { PrismaPg } from "@prisma/adapter-pg";
import { parse } from "dotenv";

import { PrismaClient } from "../src/generated/prisma/client";

/**
 * ローカルのサンプルデータを本番のデモアカウントへ転送するスクリプト。
 *
 * 転送元: .env の環境（ローカルDB + MinIO）の SEED_SOURCE_EMAIL（既定: test@co.jp）
 * 転送先: .env.production.local の環境（本番DB + 本番S3）の DEMO_USER_EMAIL
 *
 * 画像はローカルS3からダウンロードして本番S3へアップロードし直す。
 * 実行のたびに転送先のデモデータを全削除してから入れ直す（何度でも実行できる）。
 * SEED_EXCLUDE_WORN_ON（.env）の日付のコーデは転送しない。
 *
 * 使い方（.env.production.local に DATABASE_URL / S3_* / DEMO_USER_EMAIL が必要）:
 *   npm run transfer:demo
 */

type EnvMap = Record<string, string | undefined>;

function loadEnvFile(fileName: string): EnvMap {
  return parse(readFileSync(resolve(process.cwd(), fileName), "utf8"));
}

function requireKey(env: EnvMap, fileName: string, key: string): string {
  const value = env[key];
  if (value === undefined || value === "") {
    throw new Error(`${fileName} に ${key} がありません。`);
  }
  return value;
}

function createDb(connectionString: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

type Storage = { s3: S3Client; bucket: string };

function createStorage(env: EnvMap, fileName: string): Storage {
  return {
    s3: new S3Client({
      endpoint: requireKey(env, fileName, "S3_ENDPOINT"),
      region: requireKey(env, fileName, "S3_REGION"),
      credentials: {
        accessKeyId: requireKey(env, fileName, "S3_ACCESS_KEY"),
        secretAccessKey: requireKey(env, fileName, "S3_SECRET_KEY"),
      },
      forcePathStyle: env.S3_FORCE_PATH_STYLE === "true",
    }),
    bucket: requireKey(env, fileName, "S3_BUCKET"),
  };
}

function confirm(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim() === "yes");
    });
  });
}

async function findUserId(db: PrismaClient, email: string): Promise<string> {
  const user = await db.user.findFirst({ where: { email } });
  if (user === null) {
    throw new Error(`ユーザーが見つかりません: ${email}`);
  }
  return user.id;
}

async function wipeDemoData(db: PrismaClient, demoId: string): Promise<void> {
  await db.wearLog.deleteMany({ where: { userId: demoId } });
  await db.outfit.deleteMany({ where: { userId: demoId } });
  await db.styling.deleteMany({ where: { userId: demoId } });
  await db.item.deleteMany({ where: { userId: demoId } });
}

async function transferImage(
  source: Storage,
  dest: Storage,
  sourceKey: string,
  demoId: string,
): Promise<string> {
  const response = await source.s3.send(
    new GetObjectCommand({ Bucket: source.bucket, Key: sourceKey }),
  );
  if (response.Body === undefined) {
    throw new Error(`画像を取得できません: ${sourceKey}`);
  }

  const ext = sourceKey.split(".").pop() ?? "bin";
  const newKey = `${demoId}/${randomUUID()}.${ext}`;

  await dest.s3.send(
    new PutObjectCommand({
      Bucket: dest.bucket,
      Key: newKey,
      Body: Buffer.from(await response.Body.transformToByteArray()),
      ContentType: response.ContentType ?? "image/png",
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

type Context = {
  sourceDb: PrismaClient;
  destDb: PrismaClient;
  sourceStorage: Storage;
  destStorage: Storage;
  sourceId: string;
  demoId: string;
};

async function copyItems(ctx: Context): Promise<Map<string, string>> {
  const items = await ctx.sourceDb.item.findMany({
    where: { userId: ctx.sourceId, deletedAt: null },
  });
  const idMap = new Map<string, string>();

  for (const item of items) {
    const imagePath =
      item.imagePath === null
        ? null
        : await transferImage(
            ctx.sourceStorage,
            ctx.destStorage,
            item.imagePath,
            ctx.demoId,
          );
    const created = await ctx.destDb.item.create({
      data: {
        userId: ctx.demoId,
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
  ctx: Context,
  idMap: Map<string, string>,
): Promise<number> {
  const stylings = await ctx.sourceDb.styling.findMany({
    where: { userId: ctx.sourceId, deletedAt: null },
    include: { items: true },
  });

  for (const styling of stylings) {
    const items = styling.items.filter((si) => idMap.has(si.itemId));
    await ctx.destDb.styling.create({
      data: {
        userId: ctx.demoId,
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

function excludedWornOnDates(sourceEnv: EnvMap): Set<string> {
  const raw = process.env.SEED_EXCLUDE_WORN_ON ?? sourceEnv.SEED_EXCLUDE_WORN_ON ?? "";

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
  ctx: Context,
  idMap: Map<string, string>,
  excluded: Set<string>,
): Promise<number> {
  const outfits = await ctx.sourceDb.outfit.findMany({
    where: { userId: ctx.sourceId, deletedAt: null },
    include: { items: true },
  });

  let copied = 0;

  for (const outfit of outfits) {
    if (excluded.has(toDateKey(outfit.wornOn))) continue;
    copied += 1;

    const itemIds = outfit.items
      .filter((oi) => idMap.has(oi.itemId))
      .map((oi) => mustGet(idMap, oi.itemId));
    const created = await ctx.destDb.outfit.create({
      data: {
        userId: ctx.demoId,
        wornOn: outfit.wornOn,
        satisfaction: outfit.satisfaction,
        weather: outfit.weather,
        memo: outfit.memo,
        createdAt: outfit.createdAt,
        items: { create: itemIds.map((itemId) => ({ itemId })) },
      },
    });
    for (const itemId of itemIds) {
      await ctx.destDb.wearLog.upsert({
        where: { itemId_wornOn: { itemId, wornOn: outfit.wornOn } },
        create: {
          userId: ctx.demoId,
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
  const sourceEnv = loadEnvFile(".env");
  const destFile = process.env.DEST_ENV_FILE ?? ".env.production.local";
  const destEnv = loadEnvFile(destFile);

  const sourceEmail = process.env.SEED_SOURCE_EMAIL ?? "test@co.jp";
  const demoEmail = requireKey(destEnv, destFile, "DEMO_USER_EMAIL");
  const sourceDbUrl = requireKey(sourceEnv, ".env", "DATABASE_URL");
  const destDbUrl = requireKey(destEnv, destFile, "DATABASE_URL");
  const sourceHost = new URL(sourceDbUrl).hostname;
  const destHost = new URL(destDbUrl).hostname;

  console.log(`転送元: ${sourceEmail} @ ${sourceHost}（.env）`);
  console.log(`転送先: ${demoEmail} @ ${destHost}（${destFile}）※既存データは全削除`);

  if (!(await confirm("実行してよければ yes と入力: "))) {
    console.log("中止しました。");
    return;
  }

  const ctx: Context = {
    sourceDb: createDb(sourceDbUrl),
    destDb: createDb(destDbUrl),
    sourceStorage: createStorage(sourceEnv, ".env"),
    destStorage: createStorage(destEnv, destFile),
    sourceId: "",
    demoId: "",
  };

  try {
    ctx.sourceId = await findUserId(ctx.sourceDb, sourceEmail);
    ctx.demoId = await findUserId(ctx.destDb, demoEmail);

    await wipeDemoData(ctx.destDb, ctx.demoId);
    const idMap = await copyItems(ctx);
    const stylingCount = await copyStylings(ctx, idMap);
    const outfitCount = await copyOutfits(
      ctx,
      idMap,
      excludedWornOnDates(sourceEnv),
    );

    console.log(
      `転送完了: items=${idMap.size}, stylings=${stylingCount}, outfits=${outfitCount}`,
    );
  } finally {
    await ctx.sourceDb.$disconnect();
    await ctx.destDb.$disconnect();
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
