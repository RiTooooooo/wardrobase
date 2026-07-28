-- CreateEnum
CREATE TYPE "Category" AS ENUM ('TOPS', 'BOTTOMS', 'OUTER', 'SHOES', 'BAG', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SPRING', 'SUMMER', 'AUTUMN', 'WINTER');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'CANDIDATE_FOR_DISPOSAL', 'ARCHIVED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "image_path" TEXT,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "sub_category" TEXT,
    "color" TEXT NOT NULL,
    "seasons" "Season"[],
    "brand" TEXT,
    "price" INTEGER,
    "purchased_at" DATE,
    "memo" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outfits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "worn_on" DATE NOT NULL,
    "satisfaction" INTEGER,
    "weather" TEXT,
    "memo" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outfits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outfit_items" (
    "outfit_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "outfit_items_pkey" PRIMARY KEY ("outfit_id","item_id")
);

-- CreateTable
CREATE TABLE "stylings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "seasons" "Season"[],
    "memo" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stylings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "styling_items" (
    "styling_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,

    CONSTRAINT "styling_items_pkey" PRIMARY KEY ("styling_id","item_id")
);

-- CreateTable
CREATE TABLE "wear_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "worn_on" DATE NOT NULL,
    "outfit_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wear_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "items_user_id_deleted_at_idx" ON "items"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "items_user_id_category_idx" ON "items"("user_id", "category");

-- CreateIndex
CREATE INDEX "outfits_user_id_worn_on_idx" ON "outfits"("user_id", "worn_on");

-- CreateIndex
CREATE INDEX "outfit_items_item_id_idx" ON "outfit_items"("item_id");

-- CreateIndex
CREATE INDEX "stylings_user_id_deleted_at_idx" ON "stylings"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "styling_items_item_id_idx" ON "styling_items"("item_id");

-- CreateIndex
CREATE INDEX "wear_logs_user_id_worn_on_idx" ON "wear_logs"("user_id", "worn_on");

-- CreateIndex
CREATE UNIQUE INDEX "wear_logs_item_id_worn_on_key" ON "wear_logs"("item_id", "worn_on");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfits" ADD CONSTRAINT "outfits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_items" ADD CONSTRAINT "outfit_items_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_items" ADD CONSTRAINT "outfit_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stylings" ADD CONSTRAINT "stylings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "styling_items" ADD CONSTRAINT "styling_items_styling_id_fkey" FOREIGN KEY ("styling_id") REFERENCES "stylings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "styling_items" ADD CONSTRAINT "styling_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wear_logs" ADD CONSTRAINT "wear_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wear_logs" ADD CONSTRAINT "wear_logs_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wear_logs" ADD CONSTRAINT "wear_logs_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- Prisma スキーマでは表現できない制約（手動追記）
-- 変更時は docs/spec.md「Prisma で表現できない制約」も更新すること
-- ============================================================

-- 満足度は 1〜5 の範囲（未入力は許容）
ALTER TABLE "outfits" ADD CONSTRAINT "satisfaction_range"
  CHECK ("satisfaction" IS NULL OR "satisfaction" BETWEEN 1 AND 5);
