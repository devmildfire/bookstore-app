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
          id: number
          is_published: boolean | null
          price: number | null
          publish_date: string | null
          release_date: string | null
          title_id: number
        }
        Insert: {
          discount?: number | null
          id?: number
          is_published?: boolean | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          title_id: number
        }
        Update: {
          discount?: number | null
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
          id: number
          is_published: boolean | null
          price: number | null
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
          id?: number
          is_published?: boolean | null
          price?: number | null
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
          id?: number
          is_published?: boolean | null
          price?: number | null
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
          discount: number | null
          id: number
          is_published: boolean | null
          price: number | null
          publish_date: string | null
          release_date: string | null
          title_id: number
        }
        Insert: {
          discount?: number | null
          id?: number
          is_published?: boolean | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          title_id: number
        }
        Update: {
          discount?: number | null
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
          discount: number | null
          id: number
          is_published: boolean | null
          price: number | null
          publish_date: string | null
          release_date: string | null
          sold_out: boolean | null
          title_id: number
        }
        Insert: {
          discount?: number | null
          id?: number
          is_published?: boolean | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          sold_out?: boolean | null
          title_id: number
        }
        Update: {
          discount?: number | null
          id?: number
          is_published?: boolean | null
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
          title_first_release: string
          title_age_restriction: number
          title_lit_form: string
          title_thesis: string
          title_description: string
          author_names: string[]
          title_cover: string
          sold_out: boolean
          is_published: boolean
          publish_date: string
          release_date: string
          title_id: number
          discount: number
          price: number
          id: number
          product_type: string
          title_name: string
          title_slug: string
        }[]
      }
      get_catalog_books: {
        Args: {
          title_ids?: number[]
          sort_by?: string
          price_to?: number
          price_from?: number
          author_name?: string
          product_type_filter?: string
          search_term?: string
          result_offset?: number
          result_limit?: number
        }
        Returns: {
          title_slug: string
          title_name: string
          product_type: string
          title_id: number
          release_date: string
          publish_date: string
          is_published: boolean
          sold_out: boolean
          discount: number
          price: number
          id: number
          has_multiple_products: boolean
          total_count: number
          author_names: string[]
          title_first_release: string
          title_age_restriction: number
          title_lit_form: string
          title_thesis: string
          title_description: string
          title_cover: string
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
          from_user_id: string
          to_user_id: string
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
          title_name: string
          id: number
          price: number
          sold_out: boolean
          is_published: boolean
          publish_date: string
          release_date: string
          title_id: number
          product_type: string
          title_slug: string
          title_cover: string
          title_description: string
          title_thesis: string
          title_lit_form: string
          title_age_restriction: number
          title_first_release: string
          author_names: string[]
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

