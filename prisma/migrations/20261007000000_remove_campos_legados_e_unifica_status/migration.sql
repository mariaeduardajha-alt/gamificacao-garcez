-- Unifica ActivityStatus e DemandStatus (valores idênticos) em ReviewStatus.
-- Escrita à mão: o SQL gerado pelo Prisma apagaria e recriaria a coluna "status",
-- perdendo os dados. Aqui a coluna é convertida preservando os valores.
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Activity" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Activity" ALTER COLUMN "status" TYPE "ReviewStatus" USING ("status"::text::"ReviewStatus");
ALTER TABLE "Activity" ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "Demand" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Demand" ALTER COLUMN "status" TYPE "ReviewStatus" USING ("status"::text::"ReviewStatus");
ALTER TABLE "Demand" ALTER COLUMN "status" SET DEFAULT 'PENDING';

DROP TYPE "ActivityStatus";
DROP TYPE "DemandStatus";

-- Remove campos legados: modelo antigo de kcal/pontos e revisão de exercícios
-- (exercícios são aprovados automaticamente ao serem registrados).
ALTER TABLE "Activity"
  DROP COLUMN "kcal",
  DROP COLUMN "reviewedBy",
  DROP COLUMN "reviewedAt",
  DROP COLUMN "reviewNote";

ALTER TABLE "Challenge"
  DROP COLUMN "bronzeKcal",
  DROP COLUMN "silverKcal",
  DROP COLUMN "goldKcal",
  DROP COLUMN "bronzePoints",
  DROP COLUMN "silverPoints",
  DROP COLUMN "goldPoints";
