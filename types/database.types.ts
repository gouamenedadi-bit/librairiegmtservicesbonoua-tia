// Hand-written to match supabase/migrations/*.sql until real Supabase
// credentials are available. Once the project is linked, regenerate with:
//   npx supabase gen types typescript --linked > types/database.types.ts
//
// `Relationships: []` on every table is required scaffolding, not an
// omission: @supabase/postgrest-js's GenericTable type requires that field
// to structurally match, or the whole Database generic silently collapses
// to `never` everywhere it's used (see postgrest-js src/types/common/common.ts).
// We have no declared FK relationships for embedded-resource typing here,
// so an empty array is correct, not a placeholder to fill in later.

export type PriceStatus = "priced" | "on_request";
export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "cancelled";
export type FulfillmentStatus = "received" | "preparing" | "ready" | "delivered" | "cancelled";
export type ProfileRole = "customer" | "admin";
export type ImageSource = "auto_match" | "manual" | "placeholder";

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          source_sheet: string;
          source_code: string;
          type_raw: string | null;
          sku: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          price: number | null;
          price_status: PriceStatus;
          stock_quantity: number | null;
          is_active: boolean;
          catalog_synced_at: string | null;
          manually_edited_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_sheet: string;
          source_code: string;
          type_raw?: string | null;
          sku: string;
          name: string;
          slug: string;
          description?: string | null;
          category_id?: string | null;
          price?: number | null;
          price_status?: PriceStatus;
          stock_quantity?: number | null;
          is_active?: boolean;
          catalog_synced_at?: string | null;
          manually_edited_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          storage_path: string;
          position: number;
          is_primary: boolean;
          content_hash: string;
          match_confidence: number | null;
          source: ImageSource;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          storage_path: string;
          position?: number;
          is_primary?: boolean;
          content_hash: string;
          match_confidence?: number | null;
          source?: ImageSource;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: ProfileRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: ProfileRole;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          guest_name: string;
          guest_phone: string;
          guest_address: string;
          payment_method: string;
          payment_status: PaymentStatus;
          fulfillment_status: FulfillmentStatus;
          wave_checkout_session_id: string | null;
          wave_transaction_id: string | null;
          currency: string;
          total_amount: number;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          guest_name: string;
          guest_phone: string;
          guest_address: string;
          payment_method?: string;
          payment_status?: PaymentStatus;
          fulfillment_status?: FulfillmentStatus;
          wave_checkout_session_id?: string | null;
          wave_transaction_id?: string | null;
          currency?: string;
          total_amount?: number;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          sku_snapshot: string;
          name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          sku_snapshot: string;
          name_snapshot: string;
          unit_price_snapshot: number;
          quantity: number;
          subtotal: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [];
      };
      import_runs: {
        Row: {
          id: string;
          started_at: string;
          finished_at: string | null;
          sheet_name: string;
          rows_seen: number;
          rows_created: number;
          rows_updated: number;
          rows_price_known: number;
          rows_price_on_request: number;
          duplicates_found: unknown;
          notes: string | null;
        };
        Insert: {
          id?: string;
          started_at?: string;
          finished_at?: string | null;
          sheet_name: string;
          rows_seen?: number;
          rows_created?: number;
          rows_updated?: number;
          rows_price_known?: number;
          rows_price_on_request?: number;
          duplicates_found?: unknown;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["import_runs"]["Insert"]>;
        Relationships: [];
      };
      processed_webhook_events: {
        Row: { event_id: string; received_at: string };
        Insert: { event_id: string; received_at?: string };
        Update: Partial<Database["public"]["Tables"]["processed_webhook_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order: {
        Args: { payload: unknown };
        Returns: { order_id: string; order_number: string; total_amount: number }[];
      };
      mark_order_paid: {
        Args: { p_wave_checkout_session_id: string; p_wave_transaction_id: string };
        Returns: void;
      };
      get_order_status: {
        Args: { p_order_id: string };
        Returns: {
          order_number: string;
          payment_status: PaymentStatus;
          fulfillment_status: FulfillmentStatus;
          total_amount: number;
        }[];
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      upsert_imported_product: {
        Args: {
          p_source_sheet: string;
          p_source_code: string;
          p_sku: string;
          p_name: string;
          p_slug: string;
          p_category_id: string;
          p_type_raw: string | null;
          p_price: number | null;
          p_price_status: PriceStatus;
        };
        Returns: { id: string; was_created: boolean }[];
      };
      upsert_category: {
        Args: { p_slug: string; p_name: string; p_parent_id: string | null };
        Returns: string;
      };
    };
    Enums: {
      price_status: PriceStatus;
      payment_status: PaymentStatus;
      fulfillment_status: FulfillmentStatus;
      profile_role: ProfileRole;
      image_source: ImageSource;
    };
  };
};
