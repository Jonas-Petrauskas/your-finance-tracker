-- CreateTable
CREATE TABLE "Month" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "bankBalanceCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "Month_year_month_key" ON "Month"("year", "month");

-- Seed November 2026 from existing Settings.bankBalanceCents (if any)
INSERT INTO "Month" ("id", "year", "month", "bankBalanceCents", "createdAt", "updatedAt")
SELECT
  'seed_november_2026',
  2026,
  11,
  COALESCE((SELECT "bankBalanceCents" FROM "Settings" WHERE "id" = 1), 0),
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP;

-- Recreate RecurringItem with monthId (SQLite cannot add NOT NULL FK cleanly)
CREATE TABLE "new_RecurringItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "monthId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "billingDay" INTEGER,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RecurringItem_monthId_fkey" FOREIGN KEY ("monthId") REFERENCES "Month" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_RecurringItem" (
  "id", "monthId", "name", "amountCents", "direction", "category",
  "billingDay", "notes", "active", "createdAt", "updatedAt"
)
SELECT
  "id",
  'seed_november_2026',
  "name",
  "amountCents",
  "direction",
  "category",
  "billingDay",
  "notes",
  "active",
  "createdAt",
  "updatedAt"
FROM "RecurringItem";

DROP TABLE "RecurringItem";
ALTER TABLE "new_RecurringItem" RENAME TO "RecurringItem";
CREATE INDEX "RecurringItem_monthId_idx" ON "RecurringItem"("monthId");

-- Drop bankBalanceCents from Settings
CREATE TABLE "new_Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "currency" TEXT NOT NULL DEFAULT 'EUR'
);

INSERT INTO "new_Settings" ("id", "currency")
SELECT "id", "currency" FROM "Settings";

DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
