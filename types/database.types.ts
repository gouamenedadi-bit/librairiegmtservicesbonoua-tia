// Generated from the live schema. Regenerate after any migration with:
//   npx supabase gen types typescript --db-url "$SUPABASE_DB_URL" > types/database.types.ts
//   (then re-append the hand-written aliases at the bottom, and run
//   npx eslint --fix types/database.types.ts to format)
// (--linked works too once `supabase link` has been run interactively, but
// --db-url needs no login and works straight from .env.local's connection string.)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "categories": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"parent_id": string | null,"slug": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"parent_id"?: string | null,"slug": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"parent_id"?: string | null,"slug"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"import_runs": {
                  Row: {
                    "duplicates_found": NonNullable<Json>,"finished_at": string | null,"id": string,"notes": string | null,"rows_created": number,"rows_price_known": number,"rows_price_on_request": number,"rows_seen": number,"rows_updated": number,"sheet_name": string,"started_at": string
                  }
                  Insert: {
                    "duplicates_found"?: NonNullable<Json>,"finished_at"?: string | null,"id"?: string,"notes"?: string | null,"rows_created"?: number,"rows_price_known"?: number,"rows_price_on_request"?: number,"rows_seen"?: number,"rows_updated"?: number,"sheet_name": string,"started_at"?: string
                  }
                  Update: {
                    "duplicates_found"?: NonNullable<Json>,"finished_at"?: string | null,"id"?: string,"notes"?: string | null,"rows_created"?: number,"rows_price_known"?: number,"rows_price_on_request"?: number,"rows_seen"?: number,"rows_updated"?: number,"sheet_name"?: string,"started_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"order_items": {
                  Row: {
                    "id": string,"name_snapshot": string,"order_id": string,"product_id": string | null,"quantity": number,"sku_snapshot": string,"subtotal": number,"unit_price_snapshot": number
                  }
                  Insert: {
                    "id"?: string,"name_snapshot": string,"order_id": string,"product_id"?: string | null,"quantity": number,"sku_snapshot": string,"subtotal": number,"unit_price_snapshot": number
                  }
                  Update: {
                    "id"?: string,"name_snapshot"?: string,"order_id"?: string,"product_id"?: string | null,"quantity"?: number,"sku_snapshot"?: string,"subtotal"?: number,"unit_price_snapshot"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "created_at": string,"currency": string,"customer_id": string | null,"fulfillment_status": Database["public"]['Enums']["fulfillment_status"],"guest_address": string,"guest_name": string,"guest_phone": string,"id": string,"order_number": string,"paid_at": string | null,"payment_method": string,"payment_status": Database["public"]['Enums']["payment_status"],"total_amount": number,"wave_checkout_session_id": string | null,"wave_transaction_id": string | null
                  }
                  Insert: {
                    "created_at"?: string,"currency"?: string,"customer_id"?: string | null,"fulfillment_status"?: Database["public"]['Enums']["fulfillment_status"],"guest_address": string,"guest_name": string,"guest_phone": string,"id"?: string,"order_number"?: string,"paid_at"?: string | null,"payment_method"?: string,"payment_status"?: Database["public"]['Enums']["payment_status"],"total_amount"?: number,"wave_checkout_session_id"?: string | null,"wave_transaction_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"currency"?: string,"customer_id"?: string | null,"fulfillment_status"?: Database["public"]['Enums']["fulfillment_status"],"guest_address"?: string,"guest_name"?: string,"guest_phone"?: string,"id"?: string,"order_number"?: string,"paid_at"?: string | null,"payment_method"?: string,"payment_status"?: Database["public"]['Enums']["payment_status"],"total_amount"?: number,"wave_checkout_session_id"?: string | null,"wave_transaction_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"processed_webhook_events": {
                  Row: {
                    "event_id": string,"received_at": string
                  }
                  Insert: {
                    "event_id": string,"received_at"?: string
                  }
                  Update: {
                    "event_id"?: string,"received_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"product_images": {
                  Row: {
                    "alt_text": string | null,"content_hash": string,"created_at": string,"id": string,"is_primary": boolean,"match_confidence": number | null,"position": number,"product_id": string,"source": Database["public"]['Enums']["image_source"],"storage_path": string
                  }
                  Insert: {
                    "alt_text"?: string | null,"content_hash": string,"created_at"?: string,"id"?: string,"is_primary"?: boolean,"match_confidence"?: number | null,"position"?: number,"product_id": string,"source"?: Database["public"]['Enums']["image_source"],"storage_path": string
                  }
                  Update: {
                    "alt_text"?: string | null,"content_hash"?: string,"created_at"?: string,"id"?: string,"is_primary"?: boolean,"match_confidence"?: number | null,"position"?: number,"product_id"?: string,"source"?: Database["public"]['Enums']["image_source"],"storage_path"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_images_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_reviews": {
                  Row: {
                    "comment": string | null,"created_at": string,"id": string,"order_item_id": string,"product_id": string,"profile_id": string,"rating": number
                  }
                  Insert: {
                    "comment"?: string | null,"created_at"?: string,"id"?: string,"order_item_id": string,"product_id": string,"profile_id": string,"rating": number
                  }
                  Update: {
                    "comment"?: string | null,"created_at"?: string,"id"?: string,"order_item_id"?: string,"product_id"?: string,"profile_id"?: string,"rating"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_reviews_order_item_id_fkey"
      columns: ["order_item_id"]
isOneToOne: true
      referencedRelation: "order_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_reviews_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_reviews_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "catalog_synced_at": string | null,"category_id": string | null,"created_at": string,"description": string | null,"id": string,"is_active": boolean,"manually_edited_at": string | null,"name": string,"price": number | null,"price_status": Database["public"]['Enums']["price_status"],"search_vector": unknown,"sku": string,"slug": string,"source_code": string,"source_sheet": string,"stock_quantity": number | null,"type_raw": string | null,"updated_at": string,"variant_group_id": string | null,"variant_label": string | null
                  }
                  Insert: {
                    "catalog_synced_at"?: string | null,"category_id"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"manually_edited_at"?: string | null,"name": string,"price"?: number | null,"price_status"?: Database["public"]['Enums']["price_status"],"search_vector"?: never,"sku": string,"slug": string,"source_code": string,"source_sheet": string,"stock_quantity"?: number | null,"type_raw"?: string | null,"updated_at"?: string,"variant_group_id"?: string | null,"variant_label"?: string | null
                  }
                  Update: {
                    "catalog_synced_at"?: string | null,"category_id"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"manually_edited_at"?: string | null,"name"?: string,"price"?: number | null,"price_status"?: Database["public"]['Enums']["price_status"],"search_vector"?: never,"sku"?: string,"slug"?: string,"source_code"?: string,"source_sheet"?: string,"stock_quantity"?: number | null,"type_raw"?: string | null,"updated_at"?: string,"variant_group_id"?: string | null,"variant_label"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string | null,"id": string,"neighborhood": string | null,"phone": string | null,"role": Database["public"]['Enums']["profile_role"]
                  }
                  Insert: {
                    "created_at"?: string,"full_name"?: string | null,"id": string,"neighborhood"?: string | null,"phone"?: string | null,"role"?: Database["public"]['Enums']["profile_role"]
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string | null,"id"?: string,"neighborhood"?: string | null,"phone"?: string | null,"role"?: Database["public"]['Enums']["profile_role"]
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "can_review_order_item":
{ Args: { "p_order_item_id": string,"p_product_id": string }; Returns: boolean
                           },
"create_order":
{ Args: { "payload": Json }; Returns: {
              "order_id": string,"order_number": string,"total_amount": number
            }[]
                           },
"get_my_reviewable_purchases":
{ Args: Record<PropertyKey, never>; Returns: {
              "order_item_id": string,"ordered_at": string,"product_id": string,"product_name": string,"product_slug": string
            }[]
                           },
"get_order_status":
{ Args: { "p_order_id": string }; Returns: {
              "fulfillment_status": Database["public"]['Enums']["fulfillment_status"],"order_number": string,"payment_status": Database["public"]['Enums']["payment_status"],"total_amount": number
            }[]
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"cancel_unpaid_order":
{ Args: { "p_order_id": string }; Returns: boolean
                           },
"release_expired_orders":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"mark_order_paid":
{ Args: { "p_wave_checkout_session_id": string,"p_wave_transaction_id": string }; Returns: undefined
                           },
"upsert_category":
{ Args: { "p_name": string,"p_parent_id": string,"p_slug": string }; Returns: string
                           },
"upsert_imported_product":
{ Args: { "p_category_id": string,"p_name": string,"p_price": number,"p_price_status": Database["public"]['Enums']["price_status"],"p_sku": string,"p_slug": string,"p_source_code": string,"p_source_sheet": string,"p_type_raw": string }; Returns: {
              "product_id": string,"was_created": boolean
            }[]
                           }
          }
          Enums: {
            "fulfillment_status": "received"|"preparing"|"ready"|"delivered"|"cancelled","image_source": "auto_match"|"manual"|"placeholder","payment_status": "pending"|"processing"|"succeeded"|"failed"|"cancelled","price_status": "priced"|"on_request","profile_role": "customer"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "fulfillment_status": ["received", "preparing", "ready", "delivered", "cancelled"],"image_source": ["auto_match", "manual", "placeholder"],"payment_status": ["pending", "processing", "succeeded", "failed", "cancelled"],"price_status": ["priced", "on_request"],"profile_role": ["customer", "admin"]
          }
        }
} as const


// Convenience aliases the generator doesn't produce — kept here (not in the
// generated block above) so they survive a regeneration untouched.
export type FulfillmentStatus = Database["public"]["Enums"]["fulfillment_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type PriceStatus = Database["public"]["Enums"]["price_status"];
export type ProfileRole = Database["public"]["Enums"]["profile_role"];
