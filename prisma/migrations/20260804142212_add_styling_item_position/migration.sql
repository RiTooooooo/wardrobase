-- AlterTable
ALTER TABLE "styling_items" ADD COLUMN     "position_x" DOUBLE PRECISION,
ADD COLUMN     "position_y" DOUBLE PRECISION,
ADD COLUMN     "z_index" INTEGER NOT NULL DEFAULT 0;
