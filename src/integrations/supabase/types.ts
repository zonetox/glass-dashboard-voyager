export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      api_logs: {
        Row: {
          api_name: string
          created_at: string
          domain: string | null
          endpoint: string | null
          error_message: string | null
          id: string
          method: string | null
          request_payload: Json | null
          response_data: Json | null
          response_time_ms: number | null
          status_code: number | null
          success: boolean | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          api_name: string
          created_at?: string
          domain?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          request_payload?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
          success?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          api_name?: string
          created_at?: string
          domain?: string | null
          endpoint?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          request_payload?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
          success?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      api_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          permissions: Json | null
          rate_limit_per_hour: number | null
          token_hash: string
          token_name: string
          token_prefix: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          permissions?: Json | null
          rate_limit_per_hour?: number | null
          token_hash: string
          token_name: string
          token_prefix: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          permissions?: Json | null
          rate_limit_per_hour?: number | null
          token_hash?: string
          token_name?: string
          token_prefix?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          created_at: string | null
          endpoint: string
          hour_bucket: string | null
          id: string
          request_count: number | null
          token_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          hour_bucket?: string | null
          id?: string
          request_count?: number | null
          token_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          hour_bucket?: string | null
          id?: string
          request_count?: number | null
          token_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "api_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      backups: {
        Row: {
          ai_suggested_data: Json
          created_at: string
          id: string
          original_data: Json
          type: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          ai_suggested_data: Json
          created_at?: string
          id?: string
          original_data: Json
          type: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          ai_suggested_data?: Json
          created_at?: string
          id?: string
          original_data?: Json
          type?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      competitor_analysis: {
        Row: {
          analysis_data: Json
          competitor_data: Json
          competitor_urls: Json
          created_at: string | null
          id: string
          insights: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
          user_site_data: Json
          user_website_url: string
        }
        Insert: {
          analysis_data: Json
          competitor_data: Json
          competitor_urls: Json
          created_at?: string | null
          id?: string
          insights?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          user_site_data: Json
          user_website_url: string
        }
        Update: {
          analysis_data?: Json
          competitor_data?: Json
          competitor_urls?: Json
          created_at?: string | null
          id?: string
          insights?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          user_site_data?: Json
          user_website_url?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          content: string | null
          created_at: string
          email: string
          error_message: string | null
          id: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          body: string
          created_at: string
          email: string
          error_message: string | null
          id: string
          send_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["email_status"] | null
          subject: string
          type: Database["public"]["Enums"]["email_type"] | null
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          send_at: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"] | null
          subject: string
          type?: Database["public"]["Enums"]["email_type"] | null
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          send_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["email_status"] | null
          subject?: string
          type?: Database["public"]["Enums"]["email_type"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      event_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          id: string
          ip_address: string | null
          page_url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          ip_address?: string | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fullscan_results: {
        Row: {
          completed_pages: number | null
          created_at: string | null
          id: string
          organization_id: string | null
          root_domain: string
          scan_data: Json
          status: string | null
          summary_stats: Json | null
          total_pages: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_pages?: number | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          root_domain: string
          scan_data?: Json
          status?: string | null
          summary_stats?: Json | null
          total_pages?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_pages?: number | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          root_domain?: string
          scan_data?: Json
          status?: string | null
          summary_stats?: Json | null
          total_pages?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fullscan_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      organization_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          ai_enabled: boolean
          created_at: string | null
          id: string
          monthly_limit: number
          name: string
          pdf_enabled: boolean
          price_vnd: number
          updated_at: string | null
        }
        Insert: {
          ai_enabled?: boolean
          created_at?: string | null
          id: string
          monthly_limit?: number
          name: string
          pdf_enabled?: boolean
          price_vnd?: number
          updated_at?: string | null
        }
        Update: {
          ai_enabled?: boolean
          created_at?: string | null
          id?: string
          monthly_limit?: number
          name?: string
          pdf_enabled?: boolean
          price_vnd?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          seo_score: number | null
          status: string | null
          updated_at: string | null
          user_id: string
          website_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          seo_score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          website_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          seo_score?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          website_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          file_url: string
          id: string
          include_ai: boolean | null
          report_type: string | null
          scan_id: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          include_ai?: boolean | null
          report_type?: string | null
          scan_id?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          include_ai?: boolean | null
          report_type?: string | null
          scan_id?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      scan_comparisons: {
        Row: {
          alert_sent: boolean | null
          created_at: string | null
          current_seo_score: number | null
          fixed_issues: Json | null
          id: string
          new_issues: Json | null
          previous_seo_score: number | null
          scan_date: string | null
          score_change: number | null
          user_id: string
          website_url: string
        }
        Insert: {
          alert_sent?: boolean | null
          created_at?: string | null
          current_seo_score?: number | null
          fixed_issues?: Json | null
          id?: string
          new_issues?: Json | null
          previous_seo_score?: number | null
          scan_date?: string | null
          score_change?: number | null
          user_id: string
          website_url: string
        }
        Update: {
          alert_sent?: boolean | null
          created_at?: string | null
          current_seo_score?: number | null
          fixed_issues?: Json | null
          id?: string
          new_issues?: Json | null
          previous_seo_score?: number | null
          scan_date?: string | null
          score_change?: number | null
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
      scans: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          id: string
          seo: Json | null
          url: string
          user_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          id?: string
          seo?: Json | null
          url: string
          user_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          id?: string
          seo?: Json | null
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      scheduled_scans: {
        Row: {
          auto_optimize: boolean | null
          created_at: string | null
          email_alerts: boolean | null
          frequency_days: number
          id: string
          is_active: boolean | null
          last_scan_at: string | null
          next_scan_at: string
          updated_at: string | null
          user_id: string
          website_url: string
        }
        Insert: {
          auto_optimize?: boolean | null
          created_at?: string | null
          email_alerts?: boolean | null
          frequency_days?: number
          id?: string
          is_active?: boolean | null
          last_scan_at?: string | null
          next_scan_at: string
          updated_at?: string | null
          user_id: string
          website_url: string
        }
        Update: {
          auto_optimize?: boolean | null
          created_at?: string | null
          email_alerts?: boolean | null
          frequency_days?: number
          id?: string
          is_active?: boolean | null
          last_scan_at?: string | null
          next_scan_at?: string
          updated_at?: string | null
          user_id?: string
          website_url?: string
        }
        Relationships: []
      }
      semantic_results: {
        Row: {
          created_at: string
          entities: Json | null
          id: string
          main_topic: string | null
          missing_topics: Json | null
          search_intent: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entities?: Json | null
          id?: string
          main_topic?: string | null
          missing_topics?: Json | null
          search_intent?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          entities?: Json | null
          id?: string
          main_topic?: string | null
          missing_topics?: Json | null
          search_intent?: string | null
          updated_at?: string
          url?: string
          user_id?: string
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
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway: string
          id: string
          plan_id: string
          raw_data: Json
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway: string
          id?: string
          plan_id: string
          raw_data: Json
          status: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway?: string
          id?: string
          plan_id?: string
          raw_data?: Json
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          plan_id: string
          start_date: string
          updated_at: string | null
          used_count: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id: string
          start_date?: string
          updated_at?: string | null
          used_count?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string
          updated_at?: string | null
          used_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ai_rewrites_limit: number
          created_at: string | null
          email_verified: boolean | null
          id: string
          last_login_at: string | null
          optimizations_limit: number
          scans_limit: number
          tier: Database["public"]["Enums"]["user_tier"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_rewrites_limit?: number
          created_at?: string | null
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          optimizations_limit?: number
          scans_limit?: number
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_rewrites_limit?: number
          created_at?: string | null
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          optimizations_limit?: number
          scans_limit?: number
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          plan_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan_id?: string | null
          status: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          plan_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
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
      check_api_rate_limit: {
        Args: { _token_id: string; _endpoint: string; _rate_limit: number }
        Returns: boolean
      }
      get_user_current_plan: {
        Args: { _user_id: string }
        Returns: {
          plan_id: string
          plan_name: string
          monthly_limit: number
          pdf_enabled: boolean
          ai_enabled: boolean
          used_count: number
          remaining_count: number
        }[]
      }
      get_user_plan_summary: {
        Args: { _user_id: string }
        Returns: {
          plan_name: string
          scans_used: number
          scans_limit: number
          scans_remaining: number
          reset_date: string
          is_premium: boolean
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_user_usage: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          _user_id: string
          _action: string
          _details?: Json
          _ip_address?: unknown
          _user_agent?: string
        }
        Returns: undefined
      }
      promote_to_admin: {
        Args: { _user_email: string }
        Returns: boolean
      }
      record_api_usage: {
        Args: { _token_id: string; _user_id: string; _endpoint: string }
        Returns: undefined
      }
      reset_monthly_usage: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "member"
      email_status: "queued" | "sent" | "failed"
      email_type: "onboarding" | "reminder" | "promo"
      organization_role: "admin" | "editor" | "viewer"
      user_tier: "free" | "pro" | "agency"
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
    Enums: {
      app_role: ["admin", "member"],
      email_status: ["queued", "sent", "failed"],
      email_type: ["onboarding", "reminder", "promo"],
      organization_role: ["admin", "editor", "viewer"],
      user_tier: ["free", "pro", "agency"],
    },
  },
} as const
