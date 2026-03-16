/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "jobProfileLink" DROP NOT NULL,
ALTER COLUMN "passportPhoto" DROP NOT NULL,
ALTER COLUMN "resumePdf" DROP NOT NULL,
ALTER COLUMN "paid" SET DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
