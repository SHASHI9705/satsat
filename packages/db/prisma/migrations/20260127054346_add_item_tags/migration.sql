-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
