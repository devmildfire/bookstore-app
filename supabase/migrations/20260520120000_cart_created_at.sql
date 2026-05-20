-- Add a created_at column to the Cart table so rows can be ordered by
-- insertion time. Without an explicit ORDER BY, Postgres returns rows in
-- physical heap order which shifts whenever a row is UPDATEd (an UPDATE is
-- internally a delete + insert of a new tuple version). That made cart rows
-- visibly rearrange whenever the user changed an item's quantity.

ALTER TABLE "Cart"
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS cart_user_created_at_idx
  ON "Cart" (user_id, created_at);
