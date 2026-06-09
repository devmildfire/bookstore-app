-- Cover dimensions on Articles. Stored at upload time so the
-- /dino-magazine masonry can lay each card out at its image's natural
-- aspect ratio (matches the natural-aspect masonry decision in
-- docs/plans/dino-magazine.md).
ALTER TABLE "Articles"
  ADD COLUMN IF NOT EXISTS cover_width  integer,
  ADD COLUMN IF NOT EXISTS cover_height integer;
