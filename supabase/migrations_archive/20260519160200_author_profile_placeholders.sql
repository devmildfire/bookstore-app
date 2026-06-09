-- Placeholder profile data for every Authors row that has no real profile.
--
-- The "Об авторе" section on the book page is suppressed when an author has
-- no bio, no photo, and no contacts (see src/app/books/[slug]/page.tsx). That
-- left ~138 authors hidden — both the named ones whose old-site book pages
-- have no Об авторе block (Достоевский, Толстой, Платонов, Гофман, …) and
-- the long list of pseudonymous anthology contributors from Худшее / Худшее-2.
--
-- We fill those rows with a uniform placeholder: a stock silhouette portrait
-- (authors/placeholder.jpg, uploaded by scripts/upload-author-placeholder.mjs)
-- and a short stub bio explaining the absence. Curated rows are untouched
-- thanks to COALESCE(NULLIF(...), placeholder). Re-running this migration is
-- a no-op.
--
-- The Издательство Чтиво (id = 11) "author" is intentionally skipped — it's
-- the fallback publisher credit used on anthologies and shouldn't render an
-- author section.

UPDATE "Authors" SET
  bio   = COALESCE(NULLIF(bio,   ''), 'Биография автора находится в разработке. Произведения автора можно найти в каталоге Издательства «Чтиво».'),
  photo = COALESCE(NULLIF(photo, ''), 'placeholder.jpg')
WHERE id <> 11
  AND (
    (bio IS NULL OR bio = '')
    OR (photo IS NULL OR photo = '')
  );
