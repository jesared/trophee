-- Scope tableau templates to seasons so each season can define its own default set.
ALTER TABLE "TableauTemplate"
ADD COLUMN "seasonId" TEXT;

-- Keep existing templates usable by attaching them to the active season when one exists.
UPDATE "TableauTemplate"
SET "seasonId" = (
  SELECT "id"
  FROM "Season"
  WHERE "isActive" = true
  ORDER BY "year" DESC
  LIMIT 1
)
WHERE "seasonId" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "Season"
    WHERE "isActive" = true
  );

DROP INDEX IF EXISTS "TableauTemplate_name_key";

CREATE UNIQUE INDEX "TableauTemplate_seasonId_name_key"
ON "TableauTemplate"("seasonId", "name");

CREATE INDEX "TableauTemplate_seasonId_idx"
ON "TableauTemplate"("seasonId");

ALTER TABLE "TableauTemplate"
ADD CONSTRAINT "TableauTemplate_seasonId_fkey"
FOREIGN KEY ("seasonId") REFERENCES "Season"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
