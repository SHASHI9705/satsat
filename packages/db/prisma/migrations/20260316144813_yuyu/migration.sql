-- DropForeignKey
ALTER TABLE "public"."Login" DROP CONSTRAINT "Login_userId_fkey";

-- AlterTable
ALTER TABLE "Login" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Login" ADD CONSTRAINT "Login_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
