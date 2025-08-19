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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          granted_at: string | null
          granted_by: string | null
          id: string
          is_super_admin: boolean | null
          revoked_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_super_admin?: boolean | null
          revoked_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_super_admin?: boolean | null
          revoked_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      callback_requests: {
        Row: {
          achternaam: string
          bericht: string | null
          created_at: string
          email: string
          id: string
          telefoonnummer: string
          updated_at: string
          voornaam: string
        }
        Insert: {
          achternaam: string
          bericht?: string | null
          created_at?: string
          email: string
          id?: string
          telefoonnummer: string
          updated_at?: string
          voornaam: string
        }
        Update: {
          achternaam?: string
          bericht?: string | null
          created_at?: string
          email?: string
          id?: string
          telefoonnummer?: string
          updated_at?: string
          voornaam?: string
        }
        Relationships: []
      }
      campaign_contacts: {
        Row: {
          campaign_id: string
          contact_id: string
          created_at: string | null
          custom_note: string | null
          ice_breaker_a: string | null
          ice_breaker_b: string | null
          last_response_at: string | null
          last_sent_at: string | null
          status: string | null
          step_index: number | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          contact_id: string
          created_at?: string | null
          custom_note?: string | null
          ice_breaker_a?: string | null
          ice_breaker_b?: string | null
          last_response_at?: string | null
          last_sent_at?: string | null
          status?: string | null
          step_index?: number | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          contact_id?: string
          created_at?: string | null
          custom_note?: string | null
          ice_breaker_a?: string | null
          ice_breaker_b?: string | null
          last_response_at?: string | null
          last_sent_at?: string | null
          status?: string | null
          step_index?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts_with_lead_data"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          ab_test_enabled: boolean | null
          audience_filter: Json | null
          auto_assign_enabled: boolean | null
          client_id: string
          created_at: string | null
          daily_limit: number | null
          description: string | null
          email_A: string | null
          email_B: string | null
          email_list_id: string | null
          followup_A: string | null
          followup_B: string | null
          id: string
          instantly_campaign_id: string | null
          instantly_id: string | null
          instantly_leadlist_id: string | null
          instantly_mailbox_id: string | null
          klaar_voor_instantly: boolean | null
          name: string
          prioritize_new_leads: boolean | null
          priority: number | null
          proposition_id: string | null
          status: string | null
          stop_on_reply: boolean | null
          subject_A: string | null
          subject_B: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          ab_test_enabled?: boolean | null
          audience_filter?: Json | null
          auto_assign_enabled?: boolean | null
          client_id: string
          created_at?: string | null
          daily_limit?: number | null
          description?: string | null
          email_A?: string | null
          email_B?: string | null
          email_list_id?: string | null
          followup_A?: string | null
          followup_B?: string | null
          id?: string
          instantly_campaign_id?: string | null
          instantly_id?: string | null
          instantly_leadlist_id?: string | null
          instantly_mailbox_id?: string | null
          klaar_voor_instantly?: boolean | null
          name: string
          prioritize_new_leads?: boolean | null
          priority?: number | null
          proposition_id?: string | null
          status?: string | null
          stop_on_reply?: boolean | null
          subject_A?: string | null
          subject_B?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          ab_test_enabled?: boolean | null
          audience_filter?: Json | null
          auto_assign_enabled?: boolean | null
          client_id?: string
          created_at?: string | null
          daily_limit?: number | null
          description?: string | null
          email_A?: string | null
          email_B?: string | null
          email_list_id?: string | null
          followup_A?: string | null
          followup_B?: string | null
          id?: string
          instantly_campaign_id?: string | null
          instantly_id?: string | null
          instantly_leadlist_id?: string | null
          instantly_mailbox_id?: string | null
          klaar_voor_instantly?: boolean | null
          name?: string
          prioritize_new_leads?: boolean | null
          priority?: number | null
          proposition_id?: string | null
          status?: string | null
          stop_on_reply?: boolean | null
          subject_A?: string | null
          subject_B?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_credits: {
        Row: {
          client_id: string
          created_at: string | null
          credit_type: string
          module: Database["public"]["Enums"]["app_module"]
          period_start: string
          reset_interval: Database["public"]["Enums"]["reset_interval"] | null
          updated_at: string | null
          used_this_period: number | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          credit_type: string
          module: Database["public"]["Enums"]["app_module"]
          period_start: string
          reset_interval?: Database["public"]["Enums"]["reset_interval"] | null
          updated_at?: string | null
          used_this_period?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          credit_type?: string
          module?: Database["public"]["Enums"]["app_module"]
          period_start?: string
          reset_interval?: Database["public"]["Enums"]["reset_interval"] | null
          updated_at?: string | null
          used_this_period?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "client_credits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_modules: {
        Row: {
          activated_at: string | null
          client_id: string
          module: Database["public"]["Enums"]["app_module"]
          tier: string
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          client_id: string
          module: Database["public"]["Enums"]["app_module"]
          tier: string
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          client_id?: string
          module?: Database["public"]["Enums"]["app_module"]
          tier?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_modules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_users: {
        Row: {
          client_id: string
          created_at: string | null
          email: string | null
          full_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          billing_date: string | null
          billing_status: string | null
          company_domain: string
          company_email: string
          company_name: string
          company_summary: string | null
          contactpersoon: string | null
          created_at: string | null
          enriched: boolean
          id: string
          last_credits_reset_at: string | null
          last_successful_payment_at: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          billing_date?: string | null
          billing_status?: string | null
          company_domain: string
          company_email: string
          company_name: string
          company_summary?: string | null
          contactpersoon?: string | null
          created_at?: string | null
          enriched?: boolean
          id?: string
          last_credits_reset_at?: string | null
          last_successful_payment_at?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_date?: string | null
          billing_status?: string | null
          company_domain?: string
          company_email?: string
          company_name?: string
          company_summary?: string | null
          contactpersoon?: string | null
          created_at?: string | null
          enriched?: boolean
          id?: string
          last_credits_reset_at?: string | null
          last_successful_payment_at?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_lists: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          filters: Json
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          filters?: Json
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          filters?: Json
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_lists_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          city: string | null
          client_id: string
          company_keywords: string[] | null
          company_linkedin: string | null
          company_name: string | null
          company_phone: string | null
          company_summary: string | null
          company_website: string | null
          contact_summary: string | null
          country: string | null
          created_at: string | null
          do_not_contact: boolean | null
          email: string | null
          employee_count: number | null
          first_name: string | null
          full_name: string | null
          function_group: string | null
          id: string
          industry: string | null
          last_name: string | null
          lead_id: string | null
          linkedin_url: string | null
          matchscore: number | null
          mobile_phone: string | null
          nurture: boolean | null
          nurture_reason: string | null
          organization_technologies: string[] | null
          seniority: string | null
          state: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          client_id: string
          company_keywords?: string[] | null
          company_linkedin?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_summary?: string | null
          company_website?: string | null
          contact_summary?: string | null
          country?: string | null
          created_at?: string | null
          do_not_contact?: boolean | null
          email?: string | null
          employee_count?: number | null
          first_name?: string | null
          full_name?: string | null
          function_group?: string | null
          id?: string
          industry?: string | null
          last_name?: string | null
          lead_id?: string | null
          linkedin_url?: string | null
          matchscore?: number | null
          mobile_phone?: string | null
          nurture?: boolean | null
          nurture_reason?: string | null
          organization_technologies?: string[] | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          client_id?: string
          company_keywords?: string[] | null
          company_linkedin?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_summary?: string | null
          company_website?: string | null
          contact_summary?: string | null
          country?: string | null
          created_at?: string | null
          do_not_contact?: boolean | null
          email?: string | null
          employee_count?: number | null
          first_name?: string | null
          full_name?: string | null
          function_group?: string | null
          id?: string
          industry?: string | null
          last_name?: string | null
          lead_id?: string | null
          linkedin_url?: string | null
          matchscore?: number | null
          mobile_phone?: string | null
          nurture?: boolean | null
          nurture_reason?: string | null
          organization_technologies?: string[] | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "available_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_logs: {
        Row: {
          change: number
          client_id: string | null
          created_at: string | null
          credit_type: string | null
          id: string
          module: Database["public"]["Enums"]["app_module"] | null
          reason: string | null
          related_id: string | null
        }
        Insert: {
          change: number
          client_id?: string | null
          created_at?: string | null
          credit_type?: string | null
          id?: string
          module?: Database["public"]["Enums"]["app_module"] | null
          reason?: string | null
          related_id?: string | null
        }
        Update: {
          change?: number
          client_id?: string | null
          created_at?: string | null
          credit_type?: string | null
          id?: string
          module?: Database["public"]["Enums"]["app_module"] | null
          reason?: string | null
          related_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_processing_log: {
        Row: {
          client_id: string
          created_at: string | null
          error: string | null
          id: string
          processing_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          error?: string | null
          id?: string
          processing_date: string
          status: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          error?: string | null
          id?: string
          processing_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_processing_log_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          city: string | null
          company_keywords: string | null
          company_linkedin: string | null
          company_name: string | null
          company_phone: string | null
          company_summary: string | null
          company_website: string | null
          country: string | null
          created_at: string | null
          diensten_en_expertise: string | null
          doelgroep_en_sectorfocus: string | null
          email: string
          employee_count: number | null
          first_name: string | null
          full_name: string | null
          function_group: string | null
          id: string
          industry: string | null
          klantcases_en_resultaten: string | null
          last_name: string | null
          linkedin_url: string | null
          locaties_en_marktpositie: string | null
          mobile_phone: string | null
          opvallende_haakjes_en_uitspraken: string | null
          organization_technologies: string | null
          positionering_en_kernboodschap: string | null
          seniority: string | null
          state: string | null
          status: string | null
          title: string | null
          tone_of_voice_en_stijl: string | null
          updated_at: string | null
          visie_missie_belofte: string | null
        }
        Insert: {
          city?: string | null
          company_keywords?: string | null
          company_linkedin?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_summary?: string | null
          company_website?: string | null
          country?: string | null
          created_at?: string | null
          diensten_en_expertise?: string | null
          doelgroep_en_sectorfocus?: string | null
          email: string
          employee_count?: number | null
          first_name?: string | null
          full_name?: string | null
          function_group?: string | null
          id?: string
          industry?: string | null
          klantcases_en_resultaten?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          locaties_en_marktpositie?: string | null
          mobile_phone?: string | null
          opvallende_haakjes_en_uitspraken?: string | null
          organization_technologies?: string | null
          positionering_en_kernboodschap?: string | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          tone_of_voice_en_stijl?: string | null
          updated_at?: string | null
          visie_missie_belofte?: string | null
        }
        Update: {
          city?: string | null
          company_keywords?: string | null
          company_linkedin?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_summary?: string | null
          company_website?: string | null
          country?: string | null
          created_at?: string | null
          diensten_en_expertise?: string | null
          doelgroep_en_sectorfocus?: string | null
          email?: string
          employee_count?: number | null
          first_name?: string | null
          full_name?: string | null
          function_group?: string | null
          id?: string
          industry?: string | null
          klantcases_en_resultaten?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          locaties_en_marktpositie?: string | null
          mobile_phone?: string | null
          opvallende_haakjes_en_uitspraken?: string | null
          organization_technologies?: string | null
          positionering_en_kernboodschap?: string | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          tone_of_voice_en_stijl?: string | null
          updated_at?: string | null
          visie_missie_belofte?: string | null
        }
        Relationships: []
      }
      module_pricing: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          is_standalone: boolean
          module_name: string
          module_slug: string
          monthly_price: number
          requires_lead_engine: boolean
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
          value_proposition: string[] | null
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_standalone?: boolean
          module_name: string
          module_slug: string
          monthly_price: number
          requires_lead_engine?: boolean
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          value_proposition?: string[] | null
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_standalone?: boolean
          module_name?: string
          module_slug?: string
          monthly_price?: number
          requires_lead_engine?: boolean
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
          value_proposition?: string[] | null
        }
        Relationships: []
      }
      module_tier_credits: {
        Row: {
          amount: number
          created_at: string | null
          credit_type: Database["public"]["Enums"]["credit_type_enum"]
          id: string
          module_tier_id: string
          reset_interval: Database["public"]["Enums"]["reset_interval_enum"]
          rollover_months: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          credit_type: Database["public"]["Enums"]["credit_type_enum"]
          id?: string
          module_tier_id: string
          reset_interval: Database["public"]["Enums"]["reset_interval_enum"]
          rollover_months?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          credit_type?: Database["public"]["Enums"]["credit_type_enum"]
          id?: string
          module_tier_id?: string
          reset_interval?: Database["public"]["Enums"]["reset_interval_enum"]
          rollover_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "module_tier_credits_module_tier_id_fkey"
            columns: ["module_tier_id"]
            isOneToOne: false
            referencedRelation: "module_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      module_tiers: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          module: Database["public"]["Enums"]["module_enum"]
          name: string | null
          tier: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module: Database["public"]["Enums"]["module_enum"]
          name?: string | null
          tier: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          module?: Database["public"]["Enums"]["module_enum"]
          name?: string | null
          tier?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pending_user_tasks: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          max_attempts: number
          next_retry_at: string | null
          payload: Json
          status: string
          task_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          payload: Json
          status?: string
          task_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string | null
          payload?: Json
          status?: string
          task_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      propositions: {
        Row: {
          active: boolean
          client_id: string
          description: string | null
          id: string
          inserted_at: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          client_id: string
          description?: string | null
          id?: string
          inserted_at?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          client_id?: string
          description?: string | null
          id?: string
          inserted_at?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          client_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          client_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          success: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          client_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      available_leads: {
        Row: {
          city: string | null
          company_keywords: string | null
          company_linkedin: string | null
          company_name: string | null
          company_phone: string | null
          company_summary: string | null
          company_website: string | null
          country: string | null
          created_at: string | null
          email: string | null
          employee_count: number | null
          first_name: string | null
          full_name: string | null
          function_group: string | null
          id: string | null
          industry: string | null
          last_name: string | null
          linkedin_url: string | null
          mobile_phone: string | null
          organization_technologies: string | null
          seniority: string | null
          state: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          company_keywords?: string | null
          company_linkedin?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_summary?: string | null
          company_website?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          employee_count?: number | null
          first_name?: string | null
          full_name?: string | null
          function_group?: string | null
          id?: string | null
          industry?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          mobile_phone?: string | null
          organization_technologies?: string | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          company_keywords?: string | null
          company_linkedin?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_summary?: string | null
          company_website?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          employee_count?: number | null
          first_name?: string | null
          full_name?: string | null
          function_group?: string | null
          id?: string | null
          industry?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          mobile_phone?: string | null
          organization_technologies?: string | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      client_available_credits: {
        Row: {
          client_id: string | null
          credit_type: Database["public"]["Enums"]["credit_type_enum"] | null
          module: Database["public"]["Enums"]["app_module"] | null
          monthly_limit: number | null
          remaining_credits: number | null
          reset_interval:
            | Database["public"]["Enums"]["reset_interval_enum"]
            | null
          rollover_months: number | null
          tier: string | null
          tier_name: string | null
          used_this_period: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts_with_lead_data: {
        Row: {
          city: string | null
          client_id: string | null
          company_keywords: string[] | null
          company_linkedin: string | null
          company_name: string | null
          company_phone: string | null
          company_summary: string | null
          company_website: string | null
          contact_summary: string | null
          country: string | null
          created_at: string | null
          do_not_contact: boolean | null
          email: string | null
          employee_count: number | null
          first_name: string | null
          full_name: string | null
          function_group: string | null
          id: string | null
          industry: string | null
          last_name: string | null
          lead_id: string | null
          linkedin_url: string | null
          matchscore: number | null
          mobile_phone: string | null
          nurture: boolean | null
          nurture_reason: string | null
          organization_technologies: string[] | null
          seniority: string | null
          state: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          client_id?: string | null
          company_keywords?: string[] | null
          company_linkedin?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_summary?: string | null
          company_website?: string | null
          contact_summary?: string | null
          country?: string | null
          created_at?: string | null
          do_not_contact?: boolean | null
          email?: string | null
          employee_count?: number | null
          first_name?: string | null
          full_name?: string | null
          function_group?: string | null
          id?: string | null
          industry?: string | null
          last_name?: string | null
          lead_id?: string | null
          linkedin_url?: string | null
          matchscore?: number | null
          mobile_phone?: string | null
          nurture?: boolean | null
          nurture_reason?: string | null
          organization_technologies?: string[] | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          client_id?: string | null
          company_keywords?: string[] | null
          company_linkedin?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_summary?: string | null
          company_website?: string | null
          contact_summary?: string | null
          country?: string | null
          created_at?: string | null
          do_not_contact?: boolean | null
          email?: string | null
          employee_count?: number | null
          first_name?: string | null
          full_name?: string | null
          function_group?: string | null
          id?: string | null
          industry?: string | null
          last_name?: string | null
          lead_id?: string | null
          linkedin_url?: string | null
          matchscore?: number | null
          mobile_phone?: string | null
          nurture?: boolean | null
          nurture_reason?: string | null
          organization_technologies?: string[] | null
          seniority?: string | null
          state?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "available_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_contact_to_campaign: {
        Args: { p_contact_id: string; p_campaign_id: string }
        Returns: Json
      }
      cleanup_completed_user_tasks: {
        Args: { older_than_days?: number }
        Returns: number
      }
      convert_lead_to_contact: {
        Args: { p_lead_id: string }
        Returns: Json
      }
      get_audience_contact_count: {
        Args: {
          p_client_id: string
          p_function_groups?: string[]
          p_industries?: string[]
          p_countries?: string[]
          p_min_employees?: number
          p_max_employees?: number
        }
        Returns: number
      }
      get_audience_contacts: {
        Args:
          | {
              p_client_id: string
              p_function_groups?: string[]
              p_industries?: string[]
              p_countries?: string[]
              p_min_employees?: number
              p_max_employees?: number
            }
          | {
              p_client_id: string
              p_function_groups?: string[]
              p_industries?: string[]
              p_countries?: string[]
              p_min_employees?: number
              p_max_employees?: number
              p_campaign_id?: string
            }
        Returns: {
          contact_id: string
        }[]
      }
      get_audience_filter_options: {
        Args: { p_client_id: string }
        Returns: {
          function_groups: string[]
          industries: string[]
          countries: string[]
        }[]
      }
      get_contact_list_count: {
        Args: { p_client_id: string; p_filters: Json }
        Returns: number
      }
      get_current_user_client_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_client_id_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role_safe: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_filtered_leads: {
        Args:
          | {
              p_search?: string
              p_industry?: string[]
              p_exclude_industry?: string[]
              p_job_titles?: string[]
              p_country?: string[]
              p_exclude_country?: string[]
              p_function_group?: string[]
              p_min_employees?: number
              p_max_employees?: number
              p_limit?: number
              p_offset?: number
            }
          | {
              p_search?: string
              p_industry?: string[]
              p_job_titles?: string[]
              p_country?: string[]
              p_function_group?: string[]
              p_min_employees?: number
              p_max_employees?: number
              p_limit?: number
              p_offset?: number
            }
          | {
              p_search?: string
              p_industry?: string[]
              p_job_titles?: string[]
              p_country?: string[]
              p_min_employees?: number
              p_max_employees?: number
              p_limit?: number
              p_offset?: number
            }
          | {
              p_search?: string
              p_industry?: string[]
              p_job_titles?: string[]
              p_country?: string
              p_min_employees?: number
              p_max_employees?: number
              p_limit?: number
              p_offset?: number
            }
        Returns: {
          id: string
          first_name: string
          last_name: string
          email: string
          company_name: string
          title: string
          industry: string
          country: string
          city: string
          company_linkedin: string
          company_website: string
          company_phone: string
          company_summary: string
          company_keywords: string
          linkedin_url: string
          mobile_phone: string
          full_name: string
          state: string
          seniority: string
          organization_technologies: string
          employee_count: number
          created_at: string
          updated_at: string
          total_count: number
        }[]
      }
      get_next_campaign_for_contact: {
        Args: { p_contact_id: string }
        Returns: string
      }
      get_user_role_for_client: {
        Args: { target_client_id: string }
        Returns: string
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_lead_converted: {
        Args: { p_lead_id: string; p_client_id?: string }
        Returns: boolean
      }
      is_super_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_security_event: {
        Args: {
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_client_id?: string
          p_success?: boolean
          p_error_message?: string
        }
        Returns: undefined
      }
      process_pending_user_tasks: {
        Args: { batch_size?: number }
        Returns: {
          processed_count: number
          success_count: number
          error_count: number
        }[]
      }
      retry_failed_user_tasks: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      user_has_client_access: {
        Args: { target_client_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_module: "lead_engine" | "marketing_engine" | "sales_engine"
      app_role: "admin" | "member" | "viewer"
      credit_type_enum: "leads" | "emails" | "linkedin"
      module_enum: "lead_engine" | "marketing_engine" | "sales_engine"
      reset_interval: "monthly" | "weekly"
      reset_interval_enum: "monthly" | "weekly"
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
      app_module: ["lead_engine", "marketing_engine", "sales_engine"],
      app_role: ["admin", "member", "viewer"],
      credit_type_enum: ["leads", "emails", "linkedin"],
      module_enum: ["lead_engine", "marketing_engine", "sales_engine"],
      reset_interval: ["monthly", "weekly"],
      reset_interval_enum: ["monthly", "weekly"],
    },
  },
} as const
