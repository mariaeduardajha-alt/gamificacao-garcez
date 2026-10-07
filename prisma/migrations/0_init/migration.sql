-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DemandStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CAMINHADA', 'CORRIDA', 'CICLISMO', 'MUSCULACAO', 'FUNCIONAL', 'DANCA', 'NATACAO', 'ESPORTE', 'TREINO_CASA', 'TRILHA', 'OUTRA');

-- CreateEnum
CREATE TYPE "DemandWeight" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'EPIC');

-- CreateEnum
CREATE TYPE "GoalDirection" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatarUrl" TEXT,
    "sector" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ActivityType" NOT NULL,
    "kcal" INTEGER NOT NULL,
    "durationMin" INTEGER,
    "notes" TEXT,
    "proofUrl" TEXT,
    "status" "ActivityStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Demand" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "client" TEXT,
    "weight" "DemandWeight" NOT NULL,
    "points" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "proofUrl" TEXT,
    "notes" TEXT,
    "status" "DemandStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Demand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "bronzeKcal" INTEGER NOT NULL DEFAULT 24000,
    "silverKcal" INTEGER NOT NULL DEFAULT 30000,
    "goldKcal" INTEGER NOT NULL DEFAULT 34000,
    "bronzePoints" INTEGER NOT NULL DEFAULT 300,
    "silverPoints" INTEGER NOT NULL DEFAULT 600,
    "goldPoints" INTEGER NOT NULL DEFAULT 900,
    "bronzeActiveDays" INTEGER NOT NULL DEFAULT 48,
    "silverActiveDays" INTEGER NOT NULL DEFAULT 72,
    "goldActiveDays" INTEGER NOT NULL DEFAULT 96,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SectorGoal" (
    "id" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "indicator" TEXT NOT NULL,
    "current" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bronze" DOUBLE PRECISION NOT NULL,
    "silver" DOUBLE PRECISION NOT NULL,
    "gold" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT '',
    "direction" "GoalDirection" NOT NULL DEFAULT 'HIGHER_IS_BETTER',
    "avatarUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SectorGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Activity_userId_date_idx" ON "Activity"("userId", "date");

-- CreateIndex
CREATE INDEX "Activity_status_idx" ON "Activity"("status");

-- CreateIndex
CREATE INDEX "Demand_userId_completedAt_idx" ON "Demand"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "Demand_status_idx" ON "Demand"("status");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

