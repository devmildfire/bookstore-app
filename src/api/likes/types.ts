// Polymorphic item types for the Likes table. New product types
// (subscription, course, etc.) just become new string values — no
// schema changes needed (Likes.item_type is plain TEXT).
export type LikeItemType = 'title' | 'box_set'
