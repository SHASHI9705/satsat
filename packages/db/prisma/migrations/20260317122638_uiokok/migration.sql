/*
  Warnings:

  - You are about to drop the column `name` on the `Login` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `Login` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Login` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `Login` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Login` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Login` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Login_phone_key";

-- AlterTable
ALTER TABLE "Login" DROP COLUMN "name",
DROP COLUMN "otp",
DROP COLUMN "phone",
DROP COLUMN "verified",
ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Login_email_key" ON "Login"("email");
