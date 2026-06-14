-- Index foreign-key columns that lacked a backing index (data-architecture audit F6).
-- Postgres does not auto-create indexes for FK columns; these are the join/filter paths
-- the catalog RPCs, order history, and commerce lookups hit. Cheap + additive; invisible
-- at today's scale but prevents seq-scan cliffs as the catalog/customers grow.

-- Catalog: every get_catalog_* / search / similar UNION ALL joins editions on title_id.
CREATE INDEX IF NOT EXISTS idx_ebooks_title_id        ON public."Ebooks" (title_id);
CREATE INDEX IF NOT EXISTS idx_audiobooks_title_id    ON public."Audiobooks" (title_id);
CREATE INDEX IF NOT EXISTS idx_printedbooks_title_id  ON public."PrintedBooks" (title_id);

-- Author join (resolved on every catalog row, both directions).
CREATE INDEX IF NOT EXISTS idx_titles_authors_title_id   ON public."Titles_Authors" (title_id);
CREATE INDEX IF NOT EXISTS idx_titles_authors_author_id  ON public."Titles_Authors" (author_id);

-- Commerce.
CREATE INDEX IF NOT EXISTS idx_orders_user_id                  ON public."Orders" (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_recurring_subscription_id ON public."Orders" (recurring_subscription_id);
CREATE INDEX IF NOT EXISTS idx_cartpromo_promo_id             ON public."CartPromo" (promo_id);
CREATE INDEX IF NOT EXISTS idx_giftcards_order_id            ON public."GiftCards" (order_id);
CREATE INDEX IF NOT EXISTS idx_giftcards_product_id          ON public."GiftCards" (product_id);
CREATE INDEX IF NOT EXISTS idx_ogca_gift_card_id             ON public."OrderGiftCardApplications" (gift_card_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_subscription_id ON public."UserSubscriptions" (subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_anchor_order_id ON public."UserSubscriptions" (anchor_order_id);

-- Misc FKs.
CREATE INDEX IF NOT EXISTS idx_promocodes_target_title_id    ON public."PromoCodes" (target_title_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_actor_user_id     ON public."AdminAuditLog" (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id           ON public."Subscribers" (user_id);
