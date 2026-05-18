export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      Audiobooks: {
        Row: {
          discount: number | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: number
          is_published: boolean | null
          price: number | null
          publish_date: string | null
          release_date: string | null
          title_id: number
        }
        Insert: {
          discount?: number | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: number
          is_published?: boolean | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          title_id: number
        }
        Update: {
          discount?: number | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: number
          is_published?: boolean | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Audiobooks_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: true
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      AudiobookWorkers: {
        Row: {
          audiobook_id: number
          id: number
          sort_order: number
          worker_id: number
        }
        Insert: {
          audiobook_id: number
          id?: number
          sort_order?: number
          worker_id: number
        }
        Update: {
          audiobook_id?: number
          id?: number
          sort_order?: number
          worker_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "AudiobookWorkers_audiobook_id_fkey"
            columns: ["audiobook_id"]
            isOneToOne: false
            referencedRelation: "Audiobooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AudiobookWorkers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "Workers"
            referencedColumns: ["id"]
          }
        ]
      }
      AuthorContacts: {
        Row: {
          author_id: number
          channel: Database["public"]["Enums"]["author_contact_channel"]
          id: number
          sort_order: number
          url: string
        }
        Insert: {
          author_id: number
          channel: Database["public"]["Enums"]["author_contact_channel"]
          id?: number
          sort_order?: number
          url: string
        }
        Update: {
          author_id?: number
          channel?: Database["public"]["Enums"]["author_contact_channel"]
          id?: number
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "AuthorContacts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "Authors"
            referencedColumns: ["id"]
          }
        ]
      }
      Authors: {
        Row: {
          bio: string | null
          birth_date: string | null
          city: string | null
          death_date: string | null
          id: number
          name: string
          nonsalable: boolean
          photo: string | null
          phrase: string | null
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          death_date?: string | null
          id?: number
          name: string
          nonsalable?: boolean
          photo?: string | null
          phrase?: string | null
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          death_date?: string | null
          id?: number
          name?: string
          nonsalable?: boolean
          photo?: string | null
          phrase?: string | null
        }
        Relationships: []
      }
      Awards: {
        Row: {
          id: number
          image: string | null
          is_active: boolean
          position: number
          slug: string
          title: string
        }
        Insert: {
          id?: number
          image?: string | null
          is_active?: boolean
          position?: number
          slug: string
          title: string
        }
        Update: {
          id?: number
          image?: string | null
          is_active?: boolean
          position?: number
          slug?: string
          title?: string
        }
        Relationships: []
      }
      Booktrailers: {
        Row: {
          has_poster: boolean
          id: number
          title_id: number
        }
        Insert: {
          has_poster?: boolean
          id?: number
          title_id: number
        }
        Update: {
          has_poster?: boolean
          id?: number
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Booktrailers_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: true
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      BoxSetBooks: {
        Row: {
          box_set_id: number
          id: number
          position: number
          title_id: number
        }
        Insert: {
          box_set_id: number
          id?: number
          position?: number
          title_id: number
        }
        Update: {
          box_set_id?: number
          id?: number
          position?: number
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "BoxSetBooks_box_set_id_fkey"
            columns: ["box_set_id"]
            isOneToOne: false
            referencedRelation: "BoxSets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BoxSetBooks_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      BoxSets: {
        Row: {
          description: string | null
          discount: number | null
          id: number
          image: string | null
          is_active: boolean
          is_published: boolean
          name: string
          position: number
          price: number
          publish_date: string | null
          slug: string
        }
        Insert: {
          description?: string | null
          discount?: number | null
          id?: number
          image?: string | null
          is_active?: boolean
          is_published?: boolean
          name: string
          position?: number
          price: number
          publish_date?: string | null
          slug: string
        }
        Update: {
          description?: string | null
          discount?: number | null
          id?: number
          image?: string | null
          is_active?: boolean
          is_published?: boolean
          name?: string
          position?: number
          price?: number
          publish_date?: string | null
          slug?: string
        }
        Relationships: []
      }
      CardBooks: {
        Row: {
          counter_color: string | null
          demo: string | null
          discount: number | null
          extra: string | null
          format: string | null
          id: number
          is_published: boolean | null
          packaging: string | null
          paper: string | null
          price: number | null
          printing_technique: string | null
          publish_date: string | null
          release_date: string | null
          sold: number | null
          sold_out: boolean | null
          title_id: number
        }
        Insert: {
          counter_color?: string | null
          demo?: string | null
          discount?: number | null
          extra?: string | null
          format?: string | null
          id?: number
          is_published?: boolean | null
          packaging?: string | null
          paper?: string | null
          price?: number | null
          printing_technique?: string | null
          publish_date?: string | null
          release_date?: string | null
          sold?: number | null
          sold_out?: boolean | null
          title_id: number
        }
        Update: {
          counter_color?: string | null
          demo?: string | null
          discount?: number | null
          extra?: string | null
          format?: string | null
          id?: number
          is_published?: boolean | null
          packaging?: string | null
          paper?: string | null
          price?: number | null
          printing_technique?: string | null
          publish_date?: string | null
          release_date?: string | null
          sold?: number | null
          sold_out?: boolean | null
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "CardBooks_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: true
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      CardBookWorkers: {
        Row: {
          card_book_id: number
          id: number
          sort_order: number
          worker_id: number
        }
        Insert: {
          card_book_id: number
          id?: number
          sort_order?: number
          worker_id: number
        }
        Update: {
          card_book_id?: number
          id?: number
          sort_order?: number
          worker_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "CardBookWorkers_card_book_id_fkey"
            columns: ["card_book_id"]
            isOneToOne: false
            referencedRelation: "CardBooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "CardBookWorkers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "Workers"
            referencedColumns: ["id"]
          }
        ]
      }
      Cart: {
        Row: {
          category: Database["public"]["Enums"]["category"]
          discount: number | null
          id: string
          name: string
          picture: string | null
          price: number | null
          quantity: number | null
          subtitle: string | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["category"]
          discount?: number | null
          id: string
          name: string
          picture?: string | null
          price?: number | null
          quantity?: number | null
          subtitle?: string | null
          user_id?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["category"]
          discount?: number | null
          id?: string
          name?: string
          picture?: string | null
          price?: number | null
          quantity?: number | null
          subtitle?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      Ebooks: {
        Row: {
          character_count: number | null
          discount: number | null
          formats: string[] | null
          id: number
          is_published: boolean | null
          price: number | null
          publish_date: string | null
          release_date: string | null
          title_id: number
        }
        Insert: {
          character_count?: number | null
          discount?: number | null
          formats?: string[] | null
          id?: number
          is_published?: boolean | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          title_id: number
        }
        Update: {
          character_count?: number | null
          discount?: number | null
          formats?: string[] | null
          id?: number
          is_published?: boolean | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Ebooks_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: true
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      EbookWorkers: {
        Row: {
          ebook_id: number
          id: number
          sort_order: number
          worker_id: number
        }
        Insert: {
          ebook_id: number
          id?: number
          sort_order?: number
          worker_id: number
        }
        Update: {
          ebook_id?: number
          id?: number
          sort_order?: number
          worker_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "EbookWorkers_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "Ebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "EbookWorkers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "Workers"
            referencedColumns: ["id"]
          }
        ]
      }
      featured_books: {
        Row: {
          created_at: string | null
          id: number
          sort_order: number
          title_id: number
        }
        Insert: {
          created_at?: string | null
          id?: never
          sort_order?: number
          title_id: number
        }
        Update: {
          created_at?: string | null
          id?: never
          sort_order?: number
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "featured_books_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: true
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      OrderItems: {
        Row: {
          book_id: string
          category: string | null
          id: number
          name: string
          order_id: number
          price: number
          quantity: number
        }
        Insert: {
          book_id: string
          category?: string | null
          id?: number
          name: string
          order_id: number
          price: number
          quantity?: number
        }
        Update: {
          book_id?: string
          category?: string | null
          id?: number
          name?: string
          order_id?: number
          price?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "OrderItems_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "Orders"
            referencedColumns: ["id"]
          }
        ]
      }
      Orders: {
        Row: {
          created_at: string
          delivery_email: string | null
          delivery_method: string | null
          id: number
          status: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_email?: string | null
          delivery_method?: string | null
          id?: number
          status?: string
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_email?: string | null
          delivery_method?: string | null
          id?: number
          status?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      PrintedBooks: {
        Row: {
          binding: string | null
          cover_material: string | null
          discount: number | null
          format: string | null
          id: number
          illustrations: string | null
          is_published: boolean | null
          page_count: number | null
          paper: string | null
          price: number | null
          publish_date: string | null
          release_date: string | null
          sold_out: boolean | null
          title_id: number
        }
        Insert: {
          binding?: string | null
          cover_material?: string | null
          discount?: number | null
          format?: string | null
          id?: number
          illustrations?: string | null
          is_published?: boolean | null
          page_count?: number | null
          paper?: string | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          sold_out?: boolean | null
          title_id: number
        }
        Update: {
          binding?: string | null
          cover_material?: string | null
          discount?: number | null
          format?: string | null
          id?: number
          illustrations?: string | null
          is_published?: boolean | null
          page_count?: number | null
          paper?: string | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          sold_out?: boolean | null
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "PrintedBooks_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: true
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      PrintedBookWorkers: {
        Row: {
          id: number
          printed_book_id: number
          sort_order: number
          worker_id: number
        }
        Insert: {
          id?: number
          printed_book_id: number
          sort_order?: number
          worker_id: number
        }
        Update: {
          id?: number
          printed_book_id?: number
          sort_order?: number
          worker_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "PrintedBookWorkers_printed_book_id_fkey"
            columns: ["printed_book_id"]
            isOneToOne: false
            referencedRelation: "PrintedBooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PrintedBookWorkers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "Workers"
            referencedColumns: ["id"]
          }
        ]
      }
      Subscriptions: {
        Row: {
          description: string | null
          discount: number | null
          id: number
          image: string | null
          is_active: boolean
          is_published: boolean
          name: string
          perks: string[]
          position: number
          price: number
          publish_date: string | null
          slug: string
        }
        Insert: {
          description?: string | null
          discount?: number | null
          id?: number
          image?: string | null
          is_active?: boolean
          is_published?: boolean
          name: string
          perks?: string[]
          position?: number
          price: number
          publish_date?: string | null
          slug: string
        }
        Update: {
          description?: string | null
          discount?: number | null
          id?: number
          image?: string | null
          is_active?: boolean
          is_published?: boolean
          name?: string
          perks?: string[]
          position?: number
          price?: number
          publish_date?: string | null
          slug?: string
        }
        Relationships: []
      }
      Titles: {
        Row: {
          age_restriction: number | null
          cover: string | null
          demo: string | null
          description: string | null
          first_release: string | null
          id: number
          is_compilation: boolean
          is_featured: boolean | null
          lit_form: string | null
          name: string
          slug: string | null
          thesis: string | null
          trailer: string | null
          trailer_poster: string | null
        }
        Insert: {
          age_restriction?: number | null
          cover?: string | null
          demo?: string | null
          description?: string | null
          first_release?: string | null
          id?: number
          is_compilation?: boolean
          is_featured?: boolean | null
          lit_form?: string | null
          name: string
          slug?: string | null
          thesis?: string | null
          trailer?: string | null
          trailer_poster?: string | null
        }
        Update: {
          age_restriction?: number | null
          cover?: string | null
          demo?: string | null
          description?: string | null
          first_release?: string | null
          id?: number
          is_compilation?: boolean
          is_featured?: boolean | null
          lit_form?: string | null
          name?: string
          slug?: string | null
          thesis?: string | null
          trailer?: string | null
          trailer_poster?: string | null
        }
        Relationships: []
      }
      Titles_Authors: {
        Row: {
          author_id: number
          id: number
          title_id: number
        }
        Insert: {
          author_id: number
          id?: number
          title_id: number
        }
        Update: {
          author_id?: number
          id?: number
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Titles_Authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "Authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Titles_Authors_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      Titles_Awards: {
        Row: {
          award_id: number
          id: number
          position: number
          title_id: number
        }
        Insert: {
          award_id: number
          id?: number
          position?: number
          title_id: number
        }
        Update: {
          award_id?: number
          id?: number
          position?: number
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Titles_Awards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "Awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Titles_Awards_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      Workers: {
        Row: {
          id: number
          job: string
          name: string
        }
        Insert: {
          id?: number
          job: string
          name: string
        }
        Update: {
          id?: number
          job?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_catalog_book_by_slug: {
        Args: {
          title_slug: string
        }
        Returns: {
          title_thesis: string
          title_description: string
          title_cover: string
          title_slug: string
          title_name: string
          product_type: string
          title_id: number
          release_date: string
          publish_date: string
          is_published: boolean
          author_names: string[]
          title_awards: Json
          edition_details: Json
          edition_workers: Json
          title_booktrailer: Json
          title_authors: Json
          title_first_release: string
          sold_out: boolean
          discount: number
          price: number
          id: number
          title_age_restriction: number
          title_lit_form: string
        }[]
      }
      get_catalog_books: {
        Args: {
          price_to?: number
          product_type_filters?: string[]
          author_names_filter?: string[]
          year_filters?: string[]
          result_limit?: number
          result_offset?: number
          search_term?: string
          product_type_filter?: string
          author_name?: string
          price_from?: number
          title_ids?: number[]
          sort_by?: string
        }
        Returns: {
          author_names: string[]
          total_count: number
          has_multiple_products: boolean
          title_cover: string
          id: number
          price: number
          discount: number
          sold_out: boolean
          is_published: boolean
          publish_date: string
          release_date: string
          title_id: number
          product_type: string
          title_name: string
          title_slug: string
          title_description: string
          title_thesis: string
          title_lit_form: string
          title_age_restriction: number
          title_first_release: string
        }[]
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      migrate_cart: {
        Args: {
          to_user_id: string
          from_user_id: string
        }
        Returns: undefined
      }
      search_books: {
        Args: {
          search_term: string
          result_limit?: number
          result_offset?: number
        }
        Returns: {
          author_names: string[]
          title_first_release: string
          title_age_restriction: number
          title_lit_form: string
          title_thesis: string
          title_description: string
          title_cover: string
          title_slug: string
          title_name: string
          id: number
          price: number
          sold_out: boolean
          is_published: boolean
          publish_date: string
          product_type: string
          release_date: string
          title_id: number
          total_count: number
        }[]
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: unknown
      }
    }
    Enums: {
      author_contact_channel:
        | "telegram"
        | "instagram"
        | "facebook"
        | "twitter"
        | "email"
      category:
        | "PrintBook"
        | "AudioBook"
        | "EBook"
        | "Book2.0"
        | "GiftCard"
        | "BoxSet"
        | "Subscription"
        | "Course"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

