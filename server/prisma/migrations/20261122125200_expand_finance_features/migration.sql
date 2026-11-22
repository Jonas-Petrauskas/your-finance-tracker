-- Month Kraken snapshots (safe if re-run fails on existing DBs that already have columns)
ALTER TABLE "Month" ADD COLUMN "krakenBalanceCents" INTEGER;
ALTER TABLE "Month" ADD COLUMN "krakenEarnCents" INTEGER;
ALTER TABLE "Month" ADD COLUMN "krakenSpotCents" INTEGER;
ALTER TABLE "Month" ADD COLUMN "krakenSnapshottedAt" DATETIME;

-- Item paid + one-off
ALTER TABLE "RecurringItem" ADD COLUMN "paid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RecurringItem" ADD COLUMN "oneOff" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "RecurringTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "direction" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "billingDay" INTEGER,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Goal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "targetCents" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
