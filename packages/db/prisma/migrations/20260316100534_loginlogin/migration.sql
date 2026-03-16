-- CreateTable
CREATE TABLE "Login" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "otp" TEXT,

    CONSTRAINT "Login_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT NOT NULL,
    "phone" VARCHAR(10) NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "positionApplied" TEXT NOT NULL,
    "jobProfileLink" TEXT NOT NULL,
    "passportPhoto" TEXT NOT NULL,
    "resumePdf" TEXT NOT NULL,
    "paid" BOOLEAN NOT NULL,
    "district" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Login_userId_key" ON "Login"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Login_phone_key" ON "Login"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_applicationId_key" ON "User"("applicationId");

-- AddForeignKey
ALTER TABLE "Login" ADD CONSTRAINT "Login_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
