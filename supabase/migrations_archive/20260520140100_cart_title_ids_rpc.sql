-- RPC: get_cart_with_title_ids
-- Returns (cart_id, title_id) pairs for the current user's cart, joining
-- Cart against the four edition tables (Ebooks, Audiobooks, PrintedBooks,
-- CardBooks) by category. Used by the promo-codes feature to match
-- title-target item codes against the cart.
--
-- Cart.id is formatted as '<Category>-<edition_id>' (e.g. 'EBook-10',
-- 'Book2.0-33'). We split on '-' to extract the edition id.
--
-- SECURITY INVOKER: the function runs with the caller's privileges, so
-- the Cart RLS policy implicitly filters cart_rows to the caller's rows.

CREATE OR REPLACE FUNCTION get_cart_with_title_ids()
RETURNS TABLE(cart_id TEXT, title_id INTEGER)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH cart_rows AS (
    SELECT
      id,
      category,
      NULLIF(SPLIT_PART(id, '-', 2), '')::integer AS edition_id
    FROM "Cart"
  )
  SELECT cr.id AS cart_id, e.title_id
    FROM cart_rows cr
    JOIN "Ebooks" e ON cr.category = 'EBook' AND e.id = cr.edition_id
  UNION ALL
  SELECT cr.id, a.title_id
    FROM cart_rows cr
    JOIN "Audiobooks" a ON cr.category = 'AudioBook' AND a.id = cr.edition_id
  UNION ALL
  SELECT cr.id, p.title_id
    FROM cart_rows cr
    JOIN "PrintedBooks" p ON cr.category = 'PrintBook' AND p.id = cr.edition_id
  UNION ALL
  SELECT cr.id, b.title_id
    FROM cart_rows cr
    JOIN "CardBooks" b ON cr.category = 'Book2.0' AND b.id = cr.edition_id;
$$;

GRANT EXECUTE ON FUNCTION get_cart_with_title_ids() TO anon, authenticated;
