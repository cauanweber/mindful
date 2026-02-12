-- AlterTable
ALTER TABLE "Task" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing ordering by current API behavior
WITH ordered_tasks AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) AS row_num
  FROM "Task"
)
UPDATE "Task"
SET "sortOrder" = ordered_tasks.row_num
FROM ordered_tasks
WHERE "Task"."id" = ordered_tasks."id";

WITH ordered_notes AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "updatedAt" DESC) AS row_num
  FROM "Note"
)
UPDATE "Note"
SET "sortOrder" = ordered_notes.row_num
FROM ordered_notes
WHERE "Note"."id" = ordered_notes."id";

-- CreateIndex
CREATE INDEX "Task_userId_sortOrder_idx" ON "Task"("userId", "sortOrder");

-- CreateIndex
CREATE INDEX "Note_userId_sortOrder_idx" ON "Note"("userId", "sortOrder");
