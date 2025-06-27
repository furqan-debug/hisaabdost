export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action_description: string
          action_type: string
          amount: number | null
          category: string | null
          created_at: string
          fund_type: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          amount?: number | null
          category?: string | null
          created_at?: string
          fund_type?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          amount?: number | null
          category?: string | null
          created_at?: string
          fund_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      budget_alerts: {
        Row: {
          budget_id: string
          created_at: string
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          threshold: number
          user_id: string
        }
        Insert: {
          budget_id: string
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          threshold?: number
          user_id: string
        }
        Update: {
          budget_id?: string
          created_at?: string
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          threshold?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_alerts_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          carry_forward: boolean | null
          category: string
          created_at: string
          id: string
          monthly_income: number
          period: string
          user_id: string
        }
        Insert: {
          amount: number
          carry_forward?: boolean | null
          category: string
          created_at?: string
          id?: string
          monthly_income?: number
          period: string
          user_id: string
        }
        Update: {
          amount?: number
          carry_forward?: boolean | null
          category?: string
          created_at?: string
          id?: string
          monthly_income?: number
          period?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          payment: string | null
          receipt_url: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          payment?: string | null
          receipt_url?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          payment?: string | null
          receipt_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_tips: {
        Row: {
          category: string
          created_at: string | null
          id: string
          tip_text: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          tip_text: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          tip_text?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string
          created_at: string
          current_amount: number
          deadline: string
          id: string
          target_amount: number
          title: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          current_amount?: number
          deadline: string
          id?: string
          target_amount: number
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_amount?: number
          deadline?: string
          id?: string
          target_amount?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          email_sent: boolean | null
          expense_total: number | null
          id: string
          notification_type: string
          sent_at: string | null
          tip_id: string | null
          user_id: string
        }
        Insert: {
          email_sent?: boolean | null
          expense_total?: number | null
          id?: string
          notification_type: string
          sent_at?: string | null
          tip_id?: string | null
          user_id: string
        }
        Update: {
          email_sent?: boolean | null
          expense_total?: number | null
          id?: string
          notification_type?: string
          sent_at?: string | null
          tip_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_tip_id_fkey"
            columns: ["tip_id"]
            isOneToOne: false
            referencedRelation: "financial_tips"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          body: string
          data: Json | null
          id: string
          results: Json | null
          sent_at: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          data?: Json | null
          id?: string
          results?: Json | null
          sent_at?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          data?: Json | null
          id?: string
          results?: Json | null
          sent_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          code: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean
        }
        Insert: {
          code?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
        }
        Update: {
          code?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          gender: string | null
          id: string
          income_date: number
          last_login_at: string | null
          monthly_income: number | null
          notification_time: string | null
          notification_timezone: string | null
          notifications_enabled: boolean | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          preferred_currency: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id: string
          income_date?: number
          last_login_at?: string | null
          monthly_income?: number | null
          notification_time?: string | null
          notification_timezone?: string | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          preferred_currency?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          income_date?: number
          last_login_at?: string | null
          monthly_income?: number | null
          notification_time?: string | null
          notification_timezone?: string | null
          notifications_enabled?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          preferred_currency?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receipt_extractions: {
        Row: {
          created_at: string
          date: string
          extraction_metadata: Json | null
          id: string
          merchant: string
          payment_method: string | null
          receipt_text: string | null
          receipt_url: string | null
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          extraction_metadata?: Json | null
          id?: string
          merchant?: string
          payment_method?: string | null
          receipt_text?: string | null
          receipt_url?: string | null
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          extraction_metadata?: Json | null
          id?: string
          merchant?: string
          payment_method?: string | null
          receipt_text?: string | null
          receipt_url?: string | null
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      receipt_items: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          id: string
          name: string
          receipt_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          id?: string
          name: string
          receipt_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          receipt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipt_extractions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_carryover_preferences: {
        Row: {
          auto_carryover_enabled: boolean | null
          created_at: string | null
          id: string
          processed_months: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_carryover_enabled?: boolean | null
          created_at?: string | null
          id?: string
          processed_months?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_carryover_enabled?: boolean | null
          created_at?: string | null
          id?: string
          processed_months?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_device_tokens: {
        Row: {
          created_at: string | null
          device_token: string
          id: string
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_token: string
          id?: string
          platform: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_token?: string
          id?: string
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wallet_additions: {
        Row: {
          amount: number
          carryover_month: string | null
          created_at: string
          date: string
          description: string | null
          fund_type: string | null
          id: string
          is_deleted_by_user: boolean | null
          user_id: string
        }
        Insert: {
          amount: number
          carryover_month?: string | null
          created_at?: string
          date?: string
          description?: string | null
          fund_type?: string | null
          id?: string
          is_deleted_by_user?: boolean | null
          user_id: string
        }
        Update: {
          amount?: number
          carryover_month?: string | null
          created_at?: string
          date?: string
          description?: string | null
          fund_type?: string | null
          id?: string
          is_deleted_by_user?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_tip: {
        Args: { category_filter?: string }
        Returns: string
      }
      trigger_daily_notifications: {
        Args: Record<PropertyKey, never>
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
