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
          counter_color: string | null
          demo: string | null
          discount: number | null
          duration: number | null
          extra: string | null
          file_volume: number | null
          id: number
          is_published: boolean | null
          price: number | null
          publish_date: string | null
          release_date: string | null
          sold: number | null
          src: string | null
          title_id: number
        }
        Insert: {
          counter_color?: string | null
          demo?: string | null
          discount?: number | null
          duration?: number | null
          extra?: string | null
          file_volume?: number | null
          id?: number
          is_published?: boolean | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          sold?: number | null
          src?: string | null
          title_id: number
        }
        Update: {
          counter_color?: string | null
          demo?: string | null
          discount?: number | null
          duration?: number | null
          extra?: string | null
          file_volume?: number | null
          id?: number
          is_published?: boolean | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          sold?: number | null
          src?: string | null
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
          photo?: string | null
          phrase?: string | null
        }
        Relationships: []
      }
      AuthorsContacts: {
        Row: {
          author_id: number
          contact: string | null
          id: number
          type: Database["public"]["Enums"]["contacttypes"]
        }
        Insert: {
          author_id: number
          contact?: string | null
          id?: number
          type: Database["public"]["Enums"]["contacttypes"]
        }
        Update: {
          author_id?: number
          contact?: string | null
          id?: number
          type?: Database["public"]["Enums"]["contacttypes"]
        }
        Relationships: [
          {
            foreignKeyName: "authorscontacts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "Authors"
            referencedColumns: ["id"]
          }
        ]
      }
      Awards: {
        Row: {
          id: number
          source: string | null
          title: string | null
        }
        Insert: {
          id?: number
          source?: string | null
          title?: string | null
        }
        Update: {
          id?: number
          source?: string | null
          title?: string | null
        }
        Relationships: []
      }
      BoxSets: {
        Row: {
          description: string | null
          discount: number | null
          id: number
          name: string | null
          price: number | null
        }
        Insert: {
          description?: string | null
          discount?: number | null
          id?: number
          name?: string | null
          price?: number | null
        }
        Update: {
          description?: string | null
          discount?: number | null
          id?: number
          name?: string | null
          price?: number | null
        }
        Relationships: []
      }
      BoxSets_Books: {
        Row: {
          box_set: number
          category: Database["public"]["Enums"]["category"]
          title_id: number
        }
        Insert: {
          box_set: number
          category: Database["public"]["Enums"]["category"]
          title_id: number
        }
        Update: {
          box_set?: number
          category?: Database["public"]["Enums"]["category"]
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "BoxSets_Books_box_set_fkey"
            columns: ["box_set"]
            isOneToOne: false
            referencedRelation: "BoxSets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "BoxSets_Books_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
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
        }
        Insert: {
          category: Database["public"]["Enums"]["category"]
          discount?: number | null
          id?: string
          name: string
          picture?: string | null
          price?: number | null
          quantity?: number | null
          subtitle?: string | null
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
        }
        Relationships: []
      }
      Courses: {
        Row: {
          description: string | null
          duration: number | null
          format: string | null
          id: number
          lecctor: string | null
          name: string
          price: number | null
          thesis: string | null
        }
        Insert: {
          description?: string | null
          duration?: number | null
          format?: string | null
          id?: number
          lecctor?: string | null
          name: string
          price?: number | null
          thesis?: string | null
        }
        Update: {
          description?: string | null
          duration?: number | null
          format?: string | null
          id?: number
          lecctor?: string | null
          name?: string
          price?: number | null
          thesis?: string | null
        }
        Relationships: []
      }
      Ebooks: {
        Row: {
          characters: number | null
          counter_color: string | null
          demo: string | null
          discount: number | null
          extra: string | null
          file_volume: number | null
          id: number
          is_published: boolean | null
          ISBN: string | null
          price: number | null
          publish_date: string | null
          release_date: string | null
          sold: number | null
          src: string | null
          title_id: number
        }
        Insert: {
          characters?: number | null
          counter_color?: string | null
          demo?: string | null
          discount?: number | null
          extra?: string | null
          file_volume?: number | null
          id?: number
          is_published?: boolean | null
          ISBN?: string | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          sold?: number | null
          src?: string | null
          title_id: number
        }
        Update: {
          characters?: number | null
          counter_color?: string | null
          demo?: string | null
          discount?: number | null
          extra?: string | null
          file_volume?: number | null
          id?: number
          is_published?: boolean | null
          ISBN?: string | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          sold?: number | null
          src?: string | null
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
      Extentions: {
        Row: {
          extention: string
          id: number
          type: Database["public"]["Enums"]["digitaleditionextentiontype"]
        }
        Insert: {
          extention: string
          id?: number
          type?: Database["public"]["Enums"]["digitaleditionextentiontype"]
        }
        Update: {
          extention?: string
          id?: number
          type?: Database["public"]["Enums"]["digitaleditionextentiontype"]
        }
        Relationships: []
      }
      GiftCards: {
        Row: {
          amount: number | null
          id: string
          price: number | null
          title: string | null
        }
        Insert: {
          amount?: number | null
          id?: string
          price?: number | null
          title?: string | null
        }
        Update: {
          amount?: number | null
          id?: string
          price?: number | null
          title?: string | null
        }
        Relationships: []
      }
      MagazineArticles: {
        Row: {
          author_id: number | null
          id: number
          picture: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          author_id?: number | null
          id?: number
          picture?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          author_id?: number | null
          id?: number
          picture?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magazinearticles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "Authors"
            referencedColumns: ["id"]
          }
        ]
      }
      OrderItems: {
        Row: {
          discount: number | null
          id: number
          name: string | null
          order_id: number | null
          price: number | null
          quantity: number | null
          summ: number | null
          type: Database["public"]["Enums"]["category"] | null
        }
        Insert: {
          discount?: number | null
          id?: number
          name?: string | null
          order_id?: number | null
          price?: number | null
          quantity?: number | null
          summ?: number | null
          type?: Database["public"]["Enums"]["category"] | null
        }
        Update: {
          discount?: number | null
          id?: number
          name?: string | null
          order_id?: number | null
          price?: number | null
          quantity?: number | null
          summ?: number | null
          type?: Database["public"]["Enums"]["category"] | null
        }
        Relationships: [
          {
            foreignKeyName: "orderitems_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "Orders"
            referencedColumns: ["id"]
          }
        ]
      }
      Orders: {
        Row: {
          adress: string | null
          cart_id: string | null
          created_at: string
          email: string | null
          id: number
          name: string | null
          phone: string | null
          status: string | null
          summ: number | null
        }
        Insert: {
          adress?: string | null
          cart_id?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          phone?: string | null
          status?: string | null
          summ?: number | null
        }
        Update: {
          adress?: string | null
          cart_id?: string | null
          created_at?: string
          email?: string | null
          id?: number
          name?: string | null
          phone?: string | null
          status?: string | null
          summ?: number | null
        }
        Relationships: []
      }
      Photos: {
        Row: {
          blurHash: string | null
          caption: string | null
          category: Database["public"]["Enums"]["category"] | null
          id: number
          source: string
          title_id: number
        }
        Insert: {
          blurHash?: string | null
          caption?: string | null
          category?: Database["public"]["Enums"]["category"] | null
          id?: number
          source: string
          title_id: number
        }
        Update: {
          blurHash?: string | null
          caption?: string | null
          category?: Database["public"]["Enums"]["category"] | null
          id?: number
          source?: string
          title_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Photos_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      PrintedBooks: {
        Row: {
          counter_color: string | null
          demo: string | null
          discount: number | null
          extra: string | null
          id: number
          is_published: boolean | null
          ISBN: string | null
          lit_form: string | null
          pages: number | null
          price: number | null
          publish_date: string | null
          release_date: string | null
          sold: number | null
          title_id: number
        }
        Insert: {
          counter_color?: string | null
          demo?: string | null
          discount?: number | null
          extra?: string | null
          id?: number
          is_published?: boolean | null
          ISBN?: string | null
          lit_form?: string | null
          pages?: number | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          sold?: number | null
          title_id: number
        }
        Update: {
          counter_color?: string | null
          demo?: string | null
          discount?: number | null
          extra?: string | null
          id?: number
          is_published?: boolean | null
          ISBN?: string | null
          lit_form?: string | null
          pages?: number | null
          price?: number | null
          publish_date?: string | null
          release_date?: string | null
          sold?: number | null
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
      PrintedCover: {
        Row: {
          blurHash: string | null
          id: number
          PrintedBookID: number | null
          shade: Database["public"]["Enums"]["covershade"] | null
          source: string | null
        }
        Insert: {
          blurHash?: string | null
          id?: number
          PrintedBookID?: number | null
          shade?: Database["public"]["Enums"]["covershade"] | null
          source?: string | null
        }
        Update: {
          blurHash?: string | null
          id?: number
          PrintedBookID?: number | null
          shade?: Database["public"]["Enums"]["covershade"] | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "printedcover_printedbookid_fkey"
            columns: ["PrintedBookID"]
            isOneToOne: false
            referencedRelation: "PrintedBooks"
            referencedColumns: ["id"]
          }
        ]
      }
      PrintOptions: {
        Row: {
          bindings: string | null
          cover: string | null
          id: number
          illustrations: string | null
          paper: string | null
          PrintedBookID: number | null
        }
        Insert: {
          bindings?: string | null
          cover?: string | null
          id?: number
          illustrations?: string | null
          paper?: string | null
          PrintedBookID?: number | null
        }
        Update: {
          bindings?: string | null
          cover?: string | null
          id?: number
          illustrations?: string | null
          paper?: string | null
          PrintedBookID?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "printoptions_printedbookid_fkey"
            columns: ["PrintedBookID"]
            isOneToOne: false
            referencedRelation: "PrintedBooks"
            referencedColumns: ["id"]
          }
        ]
      }
      PrintSize: {
        Row: {
          height: number | null
          id: number
          PrintOptionsID: number | null
          width: number | null
        }
        Insert: {
          height?: number | null
          id?: number
          PrintOptionsID?: number | null
          width?: number | null
        }
        Update: {
          height?: number | null
          id?: number
          PrintOptionsID?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "printsize_printoptionsid_fkey"
            columns: ["PrintOptionsID"]
            isOneToOne: false
            referencedRelation: "PrintOptions"
            referencedColumns: ["id"]
          }
        ]
      }
      Promocodes: {
        Row: {
          code: string
          discount: number | null
          end_date: string | null
          id: number
          product_name: string | null
          product_type: Database["public"]["Enums"]["category"] | null
          start_date: string | null
          type: Database["public"]["Enums"]["promotype"] | null
        }
        Insert: {
          code: string
          discount?: number | null
          end_date?: string | null
          id?: number
          product_name?: string | null
          product_type?: Database["public"]["Enums"]["category"] | null
          start_date?: string | null
          type?: Database["public"]["Enums"]["promotype"] | null
        }
        Update: {
          code?: string
          discount?: number | null
          end_date?: string | null
          id?: number
          product_name?: string | null
          product_type?: Database["public"]["Enums"]["category"] | null
          start_date?: string | null
          type?: Database["public"]["Enums"]["promotype"] | null
        }
        Relationships: []
      }
      Subscriptions: {
        Row: {
          description: string | null
          id: number
          name: string | null
          payment: number | null
          period: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          name?: string | null
          payment?: number | null
          period?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          name?: string | null
          payment?: number | null
          period?: string | null
        }
        Relationships: []
      }
      Titles: {
        Row: {
          age_restriction: number | null
          cover: string | null
          description: string | null
          first_release: string | null
          id: number
          is_featured: boolean | null
          name: string
          slug: string | null
          thesis: string | null
          trailer: string | null
        }
        Insert: {
          age_restriction?: number | null
          cover?: string | null
          description?: string | null
          first_release?: string | null
          id?: number
          is_featured?: boolean | null
          name?: string
          slug?: string | null
          thesis?: string | null
          trailer?: string | null
        }
        Update: {
          age_restriction?: number | null
          cover?: string | null
          description?: string | null
          first_release?: string | null
          id?: number
          is_featured?: boolean | null
          name?: string
          slug?: string | null
          thesis?: string | null
          trailer?: string | null
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
            foreignKeyName: "titles_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "Authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "titles_authors_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          }
        ]
      }
      TitlesAwards: {
        Row: {
          award_id: number | null
          id: number
          title_id: number | null
        }
        Insert: {
          award_id?: number | null
          id?: number
          title_id?: number | null
        }
        Update: {
          award_id?: number | null
          id?: number
          title_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "titlesawards_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "Awards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "titlesawards_title_id_fkey"
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
          job: string | null
          name: string | null
          surname: string | null
        }
        Insert: {
          id?: number
          job?: string | null
          name?: string | null
          surname?: string | null
        }
        Update: {
          id?: number
          job?: string | null
          name?: string | null
          surname?: string | null
        }
        Relationships: []
      }
      Workers_Products: {
        Row: {
          id: number
          title_ID: number | null
          type: Database["public"]["Enums"]["productcategory"] | null
          worker_ID: number | null
        }
        Insert: {
          id?: number
          title_ID?: number | null
          type?: Database["public"]["Enums"]["productcategory"] | null
          worker_ID?: number | null
        }
        Update: {
          id?: number
          title_ID?: number | null
          type?: Database["public"]["Enums"]["productcategory"] | null
          worker_ID?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Workers_Products_title_ID_fkey"
            columns: ["title_ID"]
            isOneToOne: false
            referencedRelation: "Titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Workers_Products_worker_ID_fkey"
            columns: ["worker_ID"]
            isOneToOne: false
            referencedRelation: "Workers"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      audiobookext:
        | "MP3"
        | "AAX"
        | "M4A"
        | "M4B"
        | "AAC"
        | "M4P"
        | "OGG"
        | "WMA"
      category:
        | "PrintBook"
        | "AudioBook"
        | "EBook"
        | "Book2.0"
        | "GiftCard"
        | "BoxSet"
        | "Subscription"
        | "Course"
      contacttypes:
        | "e-mail"
        | "phone"
        | "mail"
        | "telegram"
        | "X"
        | "facebook"
        | "instagram"
        | "web"
      covershade: "light" | "dark"
      digitaleditionextentiontype: "audio" | "ebook"
      ebookext:
        | "epub"
        | "fb2"
        | "cbr"
        | "opf"
        | "mobi"
        | "orb"
        | "ibooks"
        | "edt"
      productcategory: "PrintedBook" | "AudioBook" | "Ebook" | "CardBook"
      promotype: "cart" | "item"
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

