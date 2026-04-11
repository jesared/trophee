-- Add the reference time directly on templates
ALTER TABLE "TableauTemplate"
ADD COLUMN "startTime" TEXT;

-- Backfill template times from existing tableaux when possible
UPDATE "TableauTemplate" AS template
SET "startTime" = source."startTime"
FROM (
  SELECT
    "templateId",
    to_char(MIN("startTime"), 'HH24:MI') AS "startTime"
  FROM "Tableau"
  GROUP BY "templateId"
) AS source
WHERE template."id" = source."templateId"
  AND template."startTime" IS NULL;

-- Prevent duplicate template assignments on the same tour
CREATE UNIQUE INDEX "Tableau_tourId_templateId_key"
ON "Tableau"("tourId", "templateId");
