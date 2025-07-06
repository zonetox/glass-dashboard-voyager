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
      optimization_history: {
        Row: {
          backup_url: string | null
          created_at: string | null
          desktop_speed_after: number | null
          desktop_speed_before: number | null
          fixes_applied: Json
          id: string
          mobile_speed_after: number | null
          mobile_speed_before: number | null
          report_url: string | null
          seo_score_after: number | null
          seo_score_before: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          website_url: string
        }
        Insert: {
          backup_url?: string | null
          created_at?: string | null
          desktop_speed_after?: number | null
          desktop_speed_before?: number | null
          fixes_applied?: Json
          id?: string
          mobile_speed_after?: number | null
          mobile_speed_before?: number | null
          report_url?: string | null
          seo_score_after?: number | null
          seo_score_before?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          website_url: string
        }
        Update: {
          backup_url?: string | null
          created_at?: string | null
          desktop_speed_after?: number | null
          desktop_speed_before?: number | null
          fixes_applied?: Json
          id?: string
          mobile_speed_after?: number | null
          mobile_speed_before?: number | null
          report_url?: string | null
          seo_score_after?: number | null
          seo_score_before?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          id: string
          seo_score: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          website_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          seo_score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          website_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          seo_score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      scan_results: {
        Row: {
          created_at: string | null
          id: string
          issues_count: number | null
          optimization_log_path: string | null
          pdf_report_path: string | null
          scan_data_path: string | null
          seo_score: number | null
          status: string | null
          user_id: string
          website_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          issues_count?: number | null
          optimization_log_path?: string | null
          pdf_report_path?: string | null
          scan_data_path?: string | null
          seo_score?: number | null
          status?: string | null
          user_id: string
          website_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          issues_count?: number | null
          optimization_log_path?: string | null
          pdf_report_path?: string | null
          scan_data_path?: string | null
          seo_score?: number | null
          status?: string | null
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      seo_analysis: {
        Row: {
          analysis_data: Json
          created_at: string | null
          id: string
          issues_found: number | null
          project_id: string
          recommendations: Json
        }
        Insert: {
          analysis_data: Json
          created_at?: string | null
          id?: string
          issues_found?: number | null
          project_id: string
          recommendations: Json
        }
        Update: {
          analysis_data?: Json
          created_at?: string | null
          id?: string
          issues_found?: number | null
          project_id?: string
          recommendations?: Json
        }
        Relationships: [
          {
            foreignKeyName: "seo_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ai_rewrites_limit: number
          created_at: string | null
          id: string
          optimizations_limit: number
          scans_limit: number
          tier: Database["public"]["Enums"]["user_tier"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_rewrites_limit?: number
          created_at?: string | null
          id?: string
          optimizations_limit?: number
          scans_limit?: number
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_rewrites_limit?: number
          created_at?: string | null
          id?: string
          optimizations_limit?: number
          scans_limit?: number
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          ai_rewrites_used: number
          created_at: string | null
          id: string
          optimizations_used: number
          reset_date: string
          scans_used: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_rewrites_used?: number
          created_at?: string | null
          id?: string
          optimizations_used?: number
          reset_date?: string
          scans_used?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_rewrites_used?: number
          created_at?: string | null
          id?: string
          optimizations_used?: number
          reset_date?: string
          scans_used?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_tier: "free" | "pro" | "agency"
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
    Enums: {
      user_tier: ["free", "pro", "agency"],
    },
  },
} as const
