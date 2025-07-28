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
      ab_tests: {
        Row: {
          created_at: string
          ctr_data: Json | null
          end_date: string | null
          id: string
          original_description: string
          original_title: string
          start_date: string
          status: string
          updated_at: string
          url: string
          user_id: string
          version_a: Json
          version_b: Json
          winner_version: string | null
        }
        Insert: {
          created_at?: string
          ctr_data?: Json | null
          end_date?: string | null
          id?: string
          original_description: string
          original_title: string
          start_date?: string
          status?: string
          updated_at?: string
          url: string
          user_id: string
          version_a: Json
          version_b: Json
          winner_version?: string | null
        }
        Update: {
          created_at?: string
          ctr_data?: Json | null
          end_date?: string | null
          id?: string
          original_description?: string
          original_title?: string
          start_date?: string
          status?: string
          updated_at?: string
          url?: string
          user_id?: string
          version_a?: Json
          version_b?: Json
          winner_version?: string | null
        }
        Relationships: []
      }
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
      ai_content_logs: {
        Row: {
          article_length: number | null
          created_at: string
          error_message: string | null
          id: string
          intent: string
          keyword: string
          meta_description: string | null
          success: boolean
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          article_length?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          intent: string
          keyword: string
          meta_description?: string | null
          success?: boolean
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          article_length?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          intent?: string
          keyword?: string
          meta_description?: string | null
          success?: boolean
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string
          data: Json | null
          domain: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          severity: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          domain: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          severity?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          domain?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          severity?: string
          type?: string
          updated_at?: string
          user_id?: string
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
      auto_links: {
        Row: {
          ai_score: number
          anchor_text: string
          created_at: string
          from_article_id: string
          id: string
          position: number
          status: string
          to_article_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_score?: number
          anchor_text: string
          created_at?: string
          from_article_id: string
          id?: string
          position: number
          status?: string
          to_article_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_score?: number
          anchor_text?: string
          created_at?: string
          from_article_id?: string
          id?: string
          position?: number
          status?: string
          to_article_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      content_assignments: {
        Row: {
          content_plan_id: string
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          status: string
          updated_at: string
          writer_id: string
        }
        Insert: {
          content_plan_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          writer_id: string
        }
        Update: {
          content_plan_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
          writer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_assignments_content_plan_id_fkey"
            columns: ["content_plan_id"]
            isOneToOne: false
            referencedRelation: "content_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      content_drafts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          last_saved_at: string
          plan_id: string
          published_sites: Json | null
          scheduled_date: string | null
          status: string
          target_sites: string[] | null
          updated_at: string
          writer_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          last_saved_at?: string
          plan_id: string
          published_sites?: Json | null
          scheduled_date?: string | null
          status?: string
          target_sites?: string[] | null
          updated_at?: string
          writer_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          last_saved_at?: string
          plan_id?: string
          published_sites?: Json | null
          scheduled_date?: string | null
          status?: string
          target_sites?: string[] | null
          updated_at?: string
          writer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_drafts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "content_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      content_feedback: {
        Row: {
          comment: string
          created_at: string
          draft_id: string
          id: string
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          comment: string
          created_at?: string
          draft_id: string
          id?: string
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          comment?: string
          created_at?: string
          draft_id?: string
          id?: string
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_feedback_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "content_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_intent: {
        Row: {
          confidence: number
          content_id: string
          created_at: string
          generated_at: string
          id: string
          intent_type: string
          updated_at: string
        }
        Insert: {
          confidence: number
          content_id: string
          created_at?: string
          generated_at?: string
          id?: string
          intent_type: string
          updated_at?: string
        }
        Update: {
          confidence?: number
          content_id?: string
          created_at?: string
          generated_at?: string
          id?: string
          intent_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_plans: {
        Row: {
          content_length: string
          created_at: string
          id: string
          main_keyword: string
          main_topic: string
          plan_date: string
          search_intent: string
          secondary_keywords: string[] | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_length: string
          created_at?: string
          id?: string
          main_keyword: string
          main_topic: string
          plan_date: string
          search_intent: string
          secondary_keywords?: string[] | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_length?: string
          created_at?: string
          id?: string
          main_keyword?: string
          main_topic?: string
          plan_date?: string
          search_intent?: string
          secondary_keywords?: string[] | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_configurations: {
        Row: {
          access_token_encrypted: string | null
          api_endpoint: string | null
          api_key_encrypted: string
          created_at: string
          crm_name: string
          crm_type: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          refresh_token_encrypted: string | null
          settings: Json | null
          sync_frequency: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          api_endpoint?: string | null
          api_key_encrypted: string
          created_at?: string
          crm_name: string
          crm_type: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token_encrypted?: string | null
          settings?: Json | null
          sync_frequency?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          api_endpoint?: string | null
          api_key_encrypted?: string
          created_at?: string
          crm_name?: string
          crm_type?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          refresh_token_encrypted?: string | null
          settings?: Json | null
          sync_frequency?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_sync_logs: {
        Row: {
          created_at: string
          crm_config_id: string
          crm_object_id: string | null
          error_message: string | null
          id: string
          request_data: Json | null
          response_data: Json | null
          status: string
          sync_duration_ms: number | null
          sync_type: string
          tracking_data_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          crm_config_id: string
          crm_object_id?: string | null
          error_message?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
          sync_duration_ms?: number | null
          sync_type: string
          tracking_data_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          crm_config_id?: string
          crm_object_id?: string | null
          error_message?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
          sync_duration_ms?: number | null
          sync_type?: string
          tracking_data_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_crm_sync_logs_config"
            columns: ["crm_config_id"]
            isOneToOne: false
            referencedRelation: "crm_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_crm_sync_logs_tracking"
            columns: ["tracking_data_id"]
            isOneToOne: false
            referencedRelation: "seo_tracking_data"
            referencedColumns: ["id"]
          },
        ]
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
      feature_usage: {
        Row: {
          created_at: string
          feature_type: Database["public"]["Enums"]["feature_type"]
          id: string
          period_end: string
          period_start: string
          tokens_used: number | null
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feature_type: Database["public"]["Enums"]["feature_type"]
          id?: string
          period_end?: string
          period_start?: string
          tokens_used?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          feature_type?: Database["public"]["Enums"]["feature_type"]
          id?: string
          period_end?: string
          period_start?: string
          tokens_used?: number | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
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
      keyword_tracking_configs: {
        Row: {
          created_at: string
          domain: string
          id: string
          is_active: boolean | null
          keywords: string[]
          last_tracked_at: string | null
          next_track_at: string | null
          target_urls: Json | null
          tracking_frequency: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          is_active?: boolean | null
          keywords: string[]
          last_tracked_at?: string | null
          next_track_at?: string | null
          target_urls?: Json | null
          tracking_frequency?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          is_active?: boolean | null
          keywords?: string[]
          last_tracked_at?: string | null
          next_track_at?: string | null
          target_urls?: Json | null
          tracking_frequency?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      package_features: {
        Row: {
          created_at: string
          custom_limit: number | null
          custom_price_vnd: number | null
          feature_type: Database["public"]["Enums"]["feature_type"]
          id: string
          is_enabled: boolean | null
          package_id: string
        }
        Insert: {
          created_at?: string
          custom_limit?: number | null
          custom_price_vnd?: number | null
          feature_type: Database["public"]["Enums"]["feature_type"]
          id?: string
          is_enabled?: boolean | null
          package_id: string
        }
        Update: {
          created_at?: string
          custom_limit?: number | null
          custom_price_vnd?: number | null
          feature_type?: Database["public"]["Enums"]["feature_type"]
          id?: string
          is_enabled?: boolean | null
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_features_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
        ]
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
      posts: {
        Row: {
          ai_score: number | null
          categories: string[] | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          keyword: string
          language: string
          meta_description: string | null
          meta_title: string | null
          outline: Json | null
          published_at: string | null
          reading_time: number | null
          scheduled_at: string | null
          slug: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
          wordpress_post_id: number | null
          wordpress_url: string | null
        }
        Insert: {
          ai_score?: number | null
          categories?: string[] | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          keyword: string
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          outline?: Json | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
          wordpress_post_id?: number | null
          wordpress_url?: string | null
        }
        Update: {
          ai_score?: number | null
          categories?: string[] | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          keyword?: string
          language?: string
          meta_description?: string | null
          meta_title?: string | null
          outline?: Json | null
          published_at?: string | null
          reading_time?: number | null
          scheduled_at?: string | null
          slug?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
          wordpress_post_id?: number | null
          wordpress_url?: string | null
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
      rankings: {
        Row: {
          created_at: string
          current_rank: number | null
          difficulty_score: number | null
          domain: string
          id: string
          keyword: string
          previous_rank: number | null
          search_volume: number | null
          serp_data: Json | null
          target_url: string | null
          tracked_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_rank?: number | null
          difficulty_score?: number | null
          domain: string
          id?: string
          keyword: string
          previous_rank?: number | null
          search_volume?: number | null
          serp_data?: Json | null
          target_url?: string | null
          tracked_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_rank?: number | null
          difficulty_score?: number | null
          domain?: string
          id?: string
          keyword?: string
          previous_rank?: number | null
          search_volume?: number | null
          serp_data?: Json | null
          target_url?: string | null
          tracked_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      seo_tracking_data: {
        Row: {
          bounce_rate: number | null
          browser: string | null
          campaign_id: string | null
          city: string | null
          conversion_goal: string | null
          conversion_value: number | null
          country: string | null
          created_at: string
          crm_contact_id: string | null
          crm_deal_id: string | null
          device_type: string | null
          domain: string
          id: string
          ip_address: unknown | null
          keyword: string | null
          page_url: string
          page_views: number | null
          referrer: string | null
          session_id: string | null
          sync_error: string | null
          synced_to_crm: boolean | null
          updated_at: string
          user_agent: string | null
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visit_duration: number | null
          visited_at: string
          visitor_id: string | null
        }
        Insert: {
          bounce_rate?: number | null
          browser?: string | null
          campaign_id?: string | null
          city?: string | null
          conversion_goal?: string | null
          conversion_value?: number | null
          country?: string | null
          created_at?: string
          crm_contact_id?: string | null
          crm_deal_id?: string | null
          device_type?: string | null
          domain: string
          id?: string
          ip_address?: unknown | null
          keyword?: string | null
          page_url: string
          page_views?: number | null
          referrer?: string | null
          session_id?: string | null
          sync_error?: string | null
          synced_to_crm?: boolean | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visit_duration?: number | null
          visited_at?: string
          visitor_id?: string | null
        }
        Update: {
          bounce_rate?: number | null
          browser?: string | null
          campaign_id?: string | null
          city?: string | null
          conversion_goal?: string | null
          conversion_value?: number | null
          country?: string | null
          created_at?: string
          crm_contact_id?: string | null
          crm_deal_id?: string | null
          device_type?: string | null
          domain?: string
          id?: string
          ip_address?: unknown | null
          keyword?: string | null
          page_url?: string
          page_views?: number | null
          referrer?: string | null
          session_id?: string | null
          sync_error?: string | null
          synced_to_crm?: boolean | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visit_duration?: number | null
          visited_at?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      subscription_features: {
        Row: {
          ai_model: string | null
          created_at: string
          description: string | null
          feature_type: Database["public"]["Enums"]["feature_type"]
          id: string
          name: string
          suggested_limit: number | null
          suggested_price_vnd: number
          updated_at: string
          uses_ai_tokens: boolean | null
        }
        Insert: {
          ai_model?: string | null
          created_at?: string
          description?: string | null
          feature_type: Database["public"]["Enums"]["feature_type"]
          id?: string
          name: string
          suggested_limit?: number | null
          suggested_price_vnd?: number
          updated_at?: string
          uses_ai_tokens?: boolean | null
        }
        Update: {
          ai_model?: string | null
          created_at?: string
          description?: string | null
          feature_type?: Database["public"]["Enums"]["feature_type"]
          id?: string
          name?: string
          suggested_limit?: number | null
          suggested_price_vnd?: number
          updated_at?: string
          uses_ai_tokens?: boolean | null
        }
        Relationships: []
      }
      subscription_packages: {
        Row: {
          base_price_vnd: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_recommended: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          base_price_vnd?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_recommended?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          base_price_vnd?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_recommended?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
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
      translations: {
        Row: {
          ai_quality_score: number
          created_at: string
          id: string
          lang: string
          original_id: string
          published_at: string | null
          status: string
          translated_content: string
          translated_meta: Json | null
          translated_title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_quality_score?: number
          created_at?: string
          id?: string
          lang: string
          original_id: string
          published_at?: string | null
          status?: string
          translated_content: string
          translated_meta?: Json | null
          translated_title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_quality_score?: number
          created_at?: string
          id?: string
          lang?: string
          original_id?: string
          published_at?: string | null
          status?: string
          translated_content?: string
          translated_meta?: Json | null
          translated_title?: string
          updated_at?: string
          user_id?: string
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
      user_autopilot: {
        Row: {
          auto_fix_seo: boolean
          auto_generate_schema: boolean
          auto_update_content: boolean
          backup_before_fix: boolean
          created_at: string
          enabled: boolean
          frequency_days: number
          id: string
          send_reports: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_fix_seo?: boolean
          auto_generate_schema?: boolean
          auto_update_content?: boolean
          backup_before_fix?: boolean
          created_at?: string
          enabled?: boolean
          frequency_days?: number
          id?: string
          send_reports?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_fix_seo?: boolean
          auto_generate_schema?: boolean
          auto_update_content?: boolean
          backup_before_fix?: boolean
          created_at?: string
          enabled?: boolean
          frequency_days?: number
          id?: string
          send_reports?: boolean
          updated_at?: string
          user_id?: string
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
          backup_codes: string[] | null
          business_address: string | null
          business_category: string | null
          business_description: string | null
          business_hours: Json | null
          business_name: string | null
          business_phone: string | null
          business_type: string | null
          business_website: string | null
          coordinates: Json | null
          created_at: string | null
          email_verified: boolean | null
          google_my_business_url: string | null
          id: string
          last_login_at: string | null
          optimizations_limit: number
          scans_limit: number
          tier: Database["public"]["Enums"]["user_tier"]
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_rewrites_limit?: number
          backup_codes?: string[] | null
          business_address?: string | null
          business_category?: string | null
          business_description?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          business_type?: string | null
          business_website?: string | null
          coordinates?: Json | null
          created_at?: string | null
          email_verified?: boolean | null
          google_my_business_url?: string | null
          id?: string
          last_login_at?: string | null
          optimizations_limit?: number
          scans_limit?: number
          tier?: Database["public"]["Enums"]["user_tier"]
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_rewrites_limit?: number
          backup_codes?: string[] | null
          business_address?: string | null
          business_category?: string | null
          business_description?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          business_type?: string | null
          business_website?: string | null
          coordinates?: Json | null
          created_at?: string | null
          email_verified?: boolean | null
          google_my_business_url?: string | null
          id?: string
          last_login_at?: string | null
          optimizations_limit?: number
          scans_limit?: number
          tier?: Database["public"]["Enums"]["user_tier"]
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
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
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          end_date: string | null
          id: string
          package_id: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          package_id: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          end_date?: string | null
          id?: string
          package_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "subscription_packages"
            referencedColumns: ["id"]
          },
        ]
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
      wordpress_sites: {
        Row: {
          application_password: string
          created_at: string
          default_category: string | null
          default_status: string | null
          id: string
          site_name: string
          site_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_password: string
          created_at?: string
          default_category?: string | null
          default_status?: string | null
          id?: string
          site_name: string
          site_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          application_password?: string
          created_at?: string
          default_category?: string | null
          default_status?: string | null
          id?: string
          site_name?: string
          site_url?: string
          updated_at?: string
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
      check_feature_access: {
        Args: {
          user_id: string
          feature: Database["public"]["Enums"]["feature_type"]
        }
        Returns: {
          has_access: boolean
          remaining_usage: number
          total_limit: number
        }[]
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
      promote_user_to_admin: {
        Args: { _email: string }
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
      feature_type:
        | "seo_audit"
        | "ai_rewrite"
        | "ai_meta"
        | "ai_content_plan"
        | "ai_blog"
        | "image_alt"
        | "technical_seo"
        | "pdf_export"
        | "whitelabel"
      organization_role: "admin" | "editor" | "viewer"
      subscription_status: "active" | "inactive" | "cancelled" | "expired"
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
      feature_type: [
        "seo_audit",
        "ai_rewrite",
        "ai_meta",
        "ai_content_plan",
        "ai_blog",
        "image_alt",
        "technical_seo",
        "pdf_export",
        "whitelabel",
      ],
      organization_role: ["admin", "editor", "viewer"],
      subscription_status: ["active", "inactive", "cancelled", "expired"],
      user_tier: ["free", "pro", "agency"],
    },
  },
} as const
