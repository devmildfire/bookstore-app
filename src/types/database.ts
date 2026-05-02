import type { Database } from './supabase'

// ─── Raw DB row types (generated) ────────────────────────────────────────────

export type DbTitle = Database['public']['Tables']['Titles']['Row']
export type DbTitleInsert = Database['public']['Tables']['Titles']['Insert']

export type DbAuthor = Database['public']['Tables']['Authors']['Row']
export type DbEbook = Database['public']['Tables']['Ebooks']['Row']
export type DbAudiobook = Database['public']['Tables']['Audiobooks']['Row']
export type DbPrintedBook = Database['public']['Tables']['PrintedBooks']['Row']
export type DbCardBook = Database['public']['Tables']['CardBooks']['Row']

export type DbCartItem = Database['public']['Tables']['Cart']['Row']
export type DbCartItemInsert = Database['public']['Tables']['Cart']['Insert']

export type DbOrder = Database['public']['Tables']['Orders']['Row']
export type DbOrderInsert = Database['public']['Tables']['Orders']['Insert']
export type DbOrderItem = Database['public']['Tables']['OrderItems']['Row']
export type DbOrderItemInsert = Database['public']['Tables']['OrderItems']['Insert']

export type DbPromocode = Database['public']['Tables']['Promocodes']['Row']

// ─── Enum types ───────────────────────────────────────────────────────────────

export type ProductCategory = Database['public']['Enums']['category']
