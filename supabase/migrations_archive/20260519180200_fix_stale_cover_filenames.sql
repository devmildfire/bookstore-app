-- Fix two Titles rows that referenced a non-existent cover.
--
-- Both pointed at `segamegadrive.png` which never existed in the `covers`
-- bucket. The bucket has `segamegadrive.jpg` (just a wrong extension on the
-- DB side), and `igra-v-mayaki` had the wrong filename entirely — its real
-- cover on the old site is `igra-v-mayaki-cover.png`, uploaded into the
-- bucket as `igra-v-mayaki.png`.
--
-- `cover_blur` is cleared on both rows so the blur back-fill script
-- (scripts/sync-cover-blurs.mjs) re-computes them on next run.

UPDATE "Titles" SET cover = 'segamegadrive.jpg', cover_blur = NULL
WHERE slug = 'segamegadrive' AND cover = 'segamegadrive.png';

UPDATE "Titles" SET cover = 'igra-v-mayaki.png', cover_blur = NULL
WHERE slug = 'igra-v-mayaki' AND cover = 'segamegadrive.png';
