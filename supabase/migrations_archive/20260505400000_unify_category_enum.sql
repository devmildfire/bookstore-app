-- Unify the two conflicting category enums.
-- "productcategory" (PrintedBook | AudioBook | Ebook | CardBook) is only used
-- in Workers_Products.type and maps 1:1 to values already in the "category" enum.
-- Replace the column type and drop the orphan enum.

ALTER TABLE "Workers_Products"
  ALTER COLUMN type TYPE category
  USING (
    CASE type::text
      WHEN 'PrintedBook' THEN 'PrintBook'::category
      WHEN 'AudioBook'   THEN 'AudioBook'::category
      WHEN 'Ebook'       THEN 'EBook'::category
      WHEN 'CardBook'    THEN 'Book2.0'::category
    END
  );

DROP TYPE productcategory;
