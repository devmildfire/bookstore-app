-- Test-only fixtures (docs/testing/STRATEGY.md §6.1). Applied AFTER seed.sql in CI,
-- never in production. Idempotent — safe to re-run.

-- `featured_books` is not part of seed.sql (the prod data dump), so a fresh CI/test
-- DB has an empty home hero. Seed a handful of real seeded titles so the home page
-- renders its featured hero as it does in production. No-op if already populated.
insert into public.featured_books (title_id, sort_order)
select id, row_number() over (order by id)
from public."Titles"
where not exists (select 1 from public.featured_books)
order by id
limit 6;
