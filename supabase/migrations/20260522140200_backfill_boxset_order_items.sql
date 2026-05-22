-- One-shot backfill: expand pre-existing BoxSet OrderItems rows into
-- per-title children, mirroring what place_order now does on new
-- purchases. After expansion the parent BoxSet row is deleted so
-- the user sees only the contained titles.
--
-- Idempotent: if children already exist for an order's box set, this
-- migration just drops the parent row without re-inserting duplicates.

DO $$
DECLARE
  oi                   RECORD;
  v_box_set_id         INT;
  v_box_set_name       TEXT;
  v_resolved_book_id   TEXT;
  v_resolved_category  TEXT;
  bsb_row              RECORD;
BEGIN
  FOR oi IN
    SELECT id, order_id, book_id, quantity
      FROM "OrderItems"
     WHERE category = 'BoxSet'
  LOOP
    v_box_set_id := NULLIF(substring(oi.book_id FROM '-(\d+)$'), '')::int;
    IF v_box_set_id IS NULL THEN CONTINUE; END IF;

    SELECT name INTO v_box_set_name FROM "BoxSets" WHERE id = v_box_set_id;
    IF v_box_set_name IS NULL THEN CONTINUE; END IF;

    -- Already backfilled? Just drop the parent.
    IF EXISTS (
      SELECT 1 FROM "OrderItems"
       WHERE order_id = oi.order_id
         AND box_set_name = v_box_set_name
    ) THEN
      DELETE FROM "OrderItems" WHERE id = oi.id;
      CONTINUE;
    END IF;

    FOR bsb_row IN
      SELECT bsb.title_id, bsb.product_id, t.name AS title_name
        FROM "BoxSetBooks" bsb
        JOIN "Titles" t ON t.id = bsb.title_id
       WHERE bsb.box_set_id = v_box_set_id
       ORDER BY bsb.position, bsb.id
    LOOP
      v_resolved_book_id := COALESCE(
        bsb_row.product_id,
        default_edition_for_title(bsb_row.title_id)
      );
      IF v_resolved_book_id IS NULL THEN CONTINUE; END IF;
      v_resolved_category := substring(v_resolved_book_id FROM '^[^-]+');

      INSERT INTO "OrderItems" (order_id, book_id, name, price, quantity, category, box_set_name)
      VALUES (
        oi.order_id,
        v_resolved_book_id,
        bsb_row.title_name,
        0,
        oi.quantity,
        v_resolved_category,
        v_box_set_name
      );
    END LOOP;

    DELETE FROM "OrderItems" WHERE id = oi.id;
  END LOOP;
END $$;
