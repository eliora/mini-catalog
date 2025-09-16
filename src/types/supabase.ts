export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      orders: {
        Row: {
          created_at: string
          client_id: string
          id: string
          items: Json
          notes: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          client_id: string
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          client_id?: string
          id?: string
          items?: Json
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      prices: {
        Row: {
          cost_price: number | null
          created_at: string
          currency: string
          discount_price: number | null
          id: string
          price_tier: string | null
          product_ref: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          currency?: string
          discount_price?: number | null
          id?: string
          price_tier?: string | null
          product_ref: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          currency?: string
          discount_price?: number | null
          id?: string
          price_tier?: string | null
          product_ref?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_prices_product_ref"
            columns: ["product_ref"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["ref"]
          },
        ]
      }
      products: {
        Row: {
          active_ingredients: string | null
          active_ingredients_he: string | null
          created_at: string
          description: string | null
          description_he: string | null
          english_name: string | null
          french_name: string | null
          header: string | null
          hebrew_name: string | null
          id: string
          ingredients: string | null
          main_pic: string | null
          notice: string | null
          pics: Json | null
          product_line: string | null
          product_name: string | null
          product_name_2: string | null
          product_type: string | null
          qty: number | null
          ref: string
          short_description_he: string | null
          size: string | null
          skin_type_he: string | null
          type: string | null
          unit_price: number | null
          updated_at: string
          usage_instructions: string | null
          usage_instructions_he: string | null
        }
        Insert: {
          active_ingredients?: string | null
          active_ingredients_he?: string | null
          created_at?: string
          description?: string | null
          description_he?: string | null
          english_name?: string | null
          french_name?: string | null
          header?: string | null
          hebrew_name?: string | null
          id?: string
          ingredients?: string | null
          main_pic?: string | null
          notice?: string | null
          pics?: Json | null
          product_line?: string | null
          product_name?: string | null
          product_name_2?: string | null
          product_type?: string | null
          qty?: number | null
          ref: string
          short_description_he?: string | null
          size?: string | null
          skin_type_he?: string | null
          type?: string | null
          unit_price?: number | null
          updated_at?: string
          usage_instructions?: string | null
          usage_instructions_he?: string | null
        }
        Update: {
          active_ingredients?: string | null
          active_ingredients_he?: string | null
          created_at?: string
          description?: string | null
          description_he?: string | null
          english_name?: string | null
          french_name?: string | null
          header?: string | null
          hebrew_name?: string | null
          id?: string
          ingredients?: string | null
          main_pic?: string | null
          notice?: string | null
          pics?: Json | null
          product_line?: string | null
          product_name?: string | null
          product_name_2?: string | null
          product_type?: string | null
          qty?: number | null
          ref?: string
          short_description_he?: string | null
          size?: string | null
          skin_type_he?: string | null
          type?: string | null
          unit_price?: number | null
          updated_at?: string
          usage_instructions?: string | null
          usage_instructions_he?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          business_name: string | null
          phone_number: string | null
          address: Json | null
          user_roles: string[]
          status: string
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          business_name?: string | null
          phone_number?: string | null
          address?: Json | null
          user_roles?: string[]
          status?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          business_name?: string | null
          phone_number?: string | null
          address?: Json | null
          user_roles?: string[]
          status?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          company_address: string | null
          company_description: string | null
          company_email: string | null
          company_logo: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string
          currency: string | null
          id: string
          tax_rate: number | null
          updated_at: string
        }
        Insert: {
          company_address?: string | null
          company_description?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          tax_rate?: number | null
          updated_at?: string
        }
        Update: {
          company_address?: string | null
          company_description?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          tax_rate?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          user_role: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
          user_role?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          user_role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      current_user_role: {
        Row: {
          email: string | null
          is_admin: boolean | null
          role: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_user_role: {
        Args: { new_role: string; user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
