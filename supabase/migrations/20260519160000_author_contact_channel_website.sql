-- Add 'website' channel to author_contact_channel.
--
-- The old chtivo.spb.ru site links several authors out to non-social URLs
-- (vk.com pages, Patreon, LiveJournal, Overdrive) under the "Контакты" row.
-- Those need a channel that isn't one of the existing telegram/instagram/
-- facebook/twitter/email values.
--
-- Must run as its own migration so the new enum value is committed before
-- the next migration uses it (Postgres does not allow a newly-added enum
-- value to be used in the same transaction that adds it).

ALTER TYPE author_contact_channel ADD VALUE IF NOT EXISTS 'website';
