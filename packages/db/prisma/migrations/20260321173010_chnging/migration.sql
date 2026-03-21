/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `applicationId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fatherName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `jobProfileLink` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `paid` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passportPhoto` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `positionApplied` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resumePdf` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `salarySlip` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Login` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `firstname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Login" DROP CONSTRAINT "Login_userId_fkey";

-- DropIndex
DROP INDEX "public"."User_applicationId_key";

-- DropIndex
DROP INDEX "public"."User_email_key";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "address",
DROP COLUMN "applicationId",
DROP COLUMN "district",
DROP COLUMN "email",
DROP COLUMN "experience",
DROP COLUMN "fatherName",
DROP COLUMN "gender",
DROP COLUMN "jobProfileLink",
DROP COLUMN "name",
DROP COLUMN "paid",
DROP COLUMN "passportPhoto",
DROP COLUMN "positionApplied",
DROP COLUMN "resumePdf",
DROP COLUMN "salarySlip",
DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "lastname" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "public"."Login";

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "positionApplied" TEXT NOT NULL,
    "jobProfileLink" TEXT,
    "passportPhoto" TEXT,
    "resumePdf" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "district" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "salarySlip" TEXT,
    "gender" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicationId_key" ON "Application"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_email_key" ON "Application"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
