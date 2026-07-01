-- CreateIndex
CREATE INDEX "Player_lastName_firstName_idx" ON "Player"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "Player_club_idx" ON "Player"("club");

-- CreateIndex
CREATE INDEX "Player_licence_idx" ON "Player"("licence");

-- CreateIndex
CREATE INDEX "Registration_playerId_idx" ON "Registration"("playerId");

-- CreateIndex
CREATE INDEX "Registration_playerId_tourId_idx" ON "Registration"("playerId", "tourId");

-- CreateIndex
CREATE INDEX "Registration_tourId_createdAt_idx" ON "Registration"("tourId", "createdAt");

-- CreateIndex
CREATE INDEX "Registration_tourId_presence_createdAt_idx" ON "Registration"("tourId", "presence", "createdAt");

-- CreateIndex
CREATE INDEX "Registration_tableauId_createdAt_idx" ON "Registration"("tableauId", "createdAt");

-- Enable trigram indexes for case-insensitive contains searches.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- CreateIndex
CREATE INDEX "Player_firstName_trgm_idx" ON "Player" USING GIN ("firstName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Player_lastName_trgm_idx" ON "Player" USING GIN ("lastName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Tour_name_trgm_idx" ON "Tour" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "TableauTemplate_name_trgm_idx" ON "TableauTemplate" USING GIN ("name" gin_trgm_ops);
