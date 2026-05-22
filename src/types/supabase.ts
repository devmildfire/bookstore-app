export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      Audiobooks: {
        Row: {
          discount: number | null
          duration_seconds: number | null
          file_path: string | null
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
          file_path?: string | null
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
          file_path?: string | null
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
          },
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
          },
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
          },
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
          photo_blur: string | null
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
          photo_blur?: string | null
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
          photo_blur?: string | null
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
      BookContexts: {
        Row: {
          body: string
          heading: string
          id: number
          sort_order: number
          title_id: number
          url: string | null
        }
        Insert: {
          body: string
          heading: string
          id?: number
          sort_order?: number
          title_id: number
          url?: string | null
        }
        Update: {
          body?: string
          heading?: string
          id?: number
          sort_order?: number
          title_id?: number
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "BookContexts_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          },
        ]
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
          },
        ]
      }
      BoxSetBooks: {
        Row: {
          box_set_id: number
          id: number
          position: number
          product_id: string | null
          title_id: number
        }
        Insert: {
          box_set_id: number
          id?: number
          position?: number
          product_id?: string | null
          title_id: number
        }
        Update: {
          box_set_id?: number
          id?: number
          position?: number
          product_id?: string | null
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
          },
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
          file_path: string | null
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
          file_path?: string | null
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
          file_path?: string | null
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
          },
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
          },
        ]
      }
      Cart: {
        Row: {
          category: Database["public"]["Enums"]["category"]
          created_at: string
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
          created_at?: string
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
          created_at?: string
          discount?: number | null
          id?: string
          name?: string
          picture?: string | null
          price?: number | null
          quantity?: number | null
          subtitle?: string | null
          user_id?: string
        }
        Relationships: []
      }
      CartPromo: {
        Row: {
          applied_at: string
          promo_id: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          promo_id: string
          user_id: string
        }
        Update: {
          applied_at?: string
          promo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "CartPromo_promo_id_fkey"
            columns: ["promo_id"]
            isOneToOne: false
            referencedRelation: "PromoCodes"
            referencedColumns: ["id"]
          },
        ]
      }
      Ebooks: {
        Row: {
          character_count: number | null
          discount: number | null
          file_path: string | null
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
          file_path?: string | null
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
          file_path?: string | null
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
          },
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
          },
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
          },
        ]
      }
      Likes: {
        Row: {
          created_at: string
          item_id: number
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          item_id: number
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          item_id?: number
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      OrderItems: {
        Row: {
          book_id: string
          box_set_name: string | null
          category: string | null
          id: number
          name: string
          order_id: number
          price: number
          quantity: number
        }
        Insert: {
          book_id: string
          box_set_name?: string | null
          category?: string | null
          id?: number
          name: string
          order_id: number
          price: number
          quantity?: number
        }
        Update: {
          book_id?: string
          box_set_name?: string | null
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
          },
        ]
      }
      Orders: {
        Row: {
          book_discount_total: number
          created_at: string
          delivery_email: string | null
          delivery_method: string | null
          id: number
          original_total: number
          paid_at: string | null
          promo_code: string | null
          promo_discount: number
          shipping_building: string | null
          shipping_city: string | null
          shipping_name: string | null
          shipping_phone: string | null
          shipping_postal_code: string | null
          shipping_street: string | null
          status: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          book_discount_total?: number
          created_at?: string
          delivery_email?: string | null
          delivery_method?: string | null
          id?: number
          original_total?: number
          paid_at?: string | null
          promo_code?: string | null
          promo_discount?: number
          shipping_building?: string | null
          shipping_city?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_postal_code?: string | null
          shipping_street?: string | null
          status?: string
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          book_discount_total?: number
          created_at?: string
          delivery_email?: string | null
          delivery_method?: string | null
          id?: number
          original_total?: number
          paid_at?: string | null
          promo_code?: string | null
          promo_discount?: number
          shipping_building?: string | null
          shipping_city?: string | null
          shipping_name?: string | null
          shipping_phone?: string | null
          shipping_postal_code?: string | null
          shipping_street?: string | null
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
          },
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
          },
        ]
      }
      Profiles: {
        Row: {
          about: string | null
          avatar_path: string | null
          birthday: string | null
          city: string | null
          created_at: string
          full_name: string | null
          nickname: string
          phone: string | null
          recovery_email: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about?: string | null
          avatar_path?: string | null
          birthday?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          nickname?: string
          phone?: string | null
          recovery_email?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about?: string | null
          avatar_path?: string | null
          birthday?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          nickname?: string
          phone?: string | null
          recovery_email?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      PromoCodes: {
        Row: {
          code: string
          created_at: string
          discount_pct: number
          ends_at: string
          id: string
          kind: string
          starts_at: string
          target_product_id: string | null
          target_title_id: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_pct: number
          ends_at: string
          id?: string
          kind: string
          starts_at: string
          target_product_id?: string | null
          target_title_id?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_pct?: number
          ends_at?: string
          id?: string
          kind?: string
          starts_at?: string
          target_product_id?: string | null
          target_title_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "PromoCodes_target_title_id_fkey"
            columns: ["target_title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          },
        ]
      }
      Subscriptions: {
        Row: {
          description: string | null
          discount: number | null
          id: number
          image: string | null
          image_blur: string | null
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
          image_blur?: string | null
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
          image_blur?: string | null
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
          book_photos_blurs: Json | null
          cover: string | null
          cover_blur: string | null
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
          book_photos_blurs?: Json | null
          cover?: string | null
          cover_blur?: string | null
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
          book_photos_blurs?: Json | null
          cover?: string | null
          cover_blur?: string | null
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
          },
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
          },
        ]
      }
      TitleSimilarTitles: {
        Row: {
          id: number
          position: number
          similar_title_id: number
          title_id: number
        }
        Insert: {
          id?: number
          position?: number
          similar_title_id: number
          title_id: number
        }
        Update: {
          id?: number
          position?: number
          similar_title_id?: number
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "TitleSimilarTitles_similar_title_id_fkey"
            columns: ["similar_title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TitleSimilarTitles_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          },
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
      apply_promo_code: { Args: { input_code: string }; Returns: Json }
      box_set_is_physical: { Args: { p_box_set_id: number }; Returns: boolean }
      default_edition_for_title: {
        Args: { p_title_id: number }
        Returns: string
      }
      get_cart_with_title_ids: {
        Args: never
        Returns: {
          cart_id: string
          title_id: number
        }[]
      }
      get_catalog_book_by_slug: {
        Args: { title_slug: string }
        Returns: {
          author_names: string[]
          discount: number
          edition_details: Json
          edition_workers: Json
          id: number
          is_published: boolean
          price: number
          product_type: string
          publish_date: string
          release_date: string
          sold_out: boolean
          title_age_restriction: number
          title_authors: Json
          title_awards: Json
          title_booktrailer: Json
          title_contexts: Json
          title_cover: string
          title_cover_blur: string
          title_description: string
          title_first_release: string
          title_id: number
          title_is_compilation: boolean
          title_lit_form: string
          title_name: string
          title_slug: string
          title_thesis: string
        }[]
      }
      get_catalog_books: {
        Args: {
          author_name?: string
          author_names_filter?: string[]
          price_from?: number
          price_to?: number
          product_type_filter?: string
          product_type_filters?: string[]
          result_limit?: number
          result_offset?: number
          search_term?: string
          sort_by?: string
          title_ids?: number[]
          year_filters?: string[]
        }
        Returns: {
          author_names: string[]
          discount: number
          has_multiple_products: boolean
          id: number
          is_published: boolean
          price: number
          product_type: string
          publish_date: string
          release_date: string
          sold_out: boolean
          title_age_restriction: number
          title_cover: string
          title_cover_blur: string
          title_description: string
          title_first_release: string
          title_id: number
          title_lit_form: string
          title_name: string
          title_slug: string
          title_thesis: string
          total_count: number
        }[]
      }
      get_or_create_profile: {
        Args: never
        Returns: {
          about: string | null
          avatar_path: string | null
          birthday: string | null
          city: string | null
          created_at: string
          full_name: string | null
          nickname: string
          phone: string | null
          recovery_email: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "Profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_similar_books: {
        Args: { p_title_id: number }
        Returns: {
          author_names: string[]
          discount: number
          has_multiple_products: boolean
          id: number
          is_published: boolean
          price: number
          product_type: string
          publish_date: string
          release_date: string
          sold_out: boolean
          title_age_restriction: number
          title_cover: string
          title_cover_blur: string
          title_description: string
          title_first_release: string
          title_id: number
          title_lit_form: string
          title_name: string
          title_slug: string
          title_thesis: string
        }[]
      }
      migrate_anonymous_user: {
        Args: { from_user_id: string; to_user_id: string }
        Returns: undefined
      }
      migrate_cart: {
        Args: { from_user_id: string; to_user_id: string }
        Returns: undefined
      }
      place_order: {
        Args: {
          p_email: string
          p_shipping_building: string
          p_shipping_city: string
          p_shipping_name: string
          p_shipping_phone: string
          p_shipping_postal_code: string
          p_shipping_street: string
        }
        Returns: Json
      }
      search_books: {
        Args: {
          result_limit?: number
          result_offset?: number
          search_term: string
        }
        Returns: {
          author_names: string[]
          id: number
          is_published: boolean
          price: number
          publish_date: string
          release_date: string
          sold_out: boolean
          title_age_restriction: number
          title_cover: string
          title_cover_blur: string
          title_description: string
          title_first_release: string
          title_id: number
          title_lit_form: string
          title_name: string
          title_slug: string
          title_thesis: string
          total_count: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      toggle_like: {
        Args: { p_item_id: number; p_item_type: string }
        Returns: boolean
      }
    }
    Enums: {
      author_contact_channel:
        | "telegram"
        | "instagram"
        | "facebook"
        | "twitter"
        | "email"
        | "website"
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      author_contact_channel: [
        "telegram",
        "instagram",
        "facebook",
        "twitter",
        "email",
        "website",
      ],
      category: [
        "PrintBook",
        "AudioBook",
        "EBook",
        "Book2.0",
        "GiftCard",
        "BoxSet",
        "Subscription",
        "Course",
      ],
    },
  },
} as const

