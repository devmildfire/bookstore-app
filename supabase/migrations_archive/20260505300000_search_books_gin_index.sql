-- GIN trigram indexes for search_books RPC.
-- pg_trgm enables index-accelerated ILIKE '%term%' queries on Titles.name and Authors.name.
-- Without these indexes search_books does a full sequential scan on both tables.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_titles_name_trgm
  ON "Titles" USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_authors_name_trgm
  ON "Authors" USING GIN (name gin_trgm_ops);
