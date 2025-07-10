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
      data_mappings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          mappings: Json
          source_integration: string
          target_integration: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          mappings?: Json
          source_integration: string
          target_integration: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          mappings?: Json
          source_integration?: string
          target_integration?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_data_mappings_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_properties: {
        Row: {
          created_at: string
          default_value: Json | null
          display_conditions: Json | null
          id: string
          integration_id: string
          is_dynamic: boolean | null
          is_required: boolean | null
          property_name: string
          property_type: string
          resource_locator: Json | null
          tenant_id: string
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          default_value?: Json | null
          display_conditions?: Json | null
          id?: string
          integration_id: string
          is_dynamic?: boolean | null
          is_required?: boolean | null
          property_name: string
          property_type: string
          resource_locator?: Json | null
          tenant_id: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          default_value?: Json | null
          display_conditions?: Json | null
          id?: string
          integration_id?: string
          is_dynamic?: boolean | null
          is_required?: boolean | null
          property_name?: string
          property_type?: string
          resource_locator?: Json | null
          tenant_id?: string
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_properties_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_logs: {
        Row: {
          data: Json | null
          execution_id: string
          id: string
          level: string
          message: string
          step_id: string
          timestamp: string
        }
        Insert: {
          data?: Json | null
          execution_id: string
          id?: string
          level: string
          message: string
          step_id: string
          timestamp?: string
        }
        Update: {
          data?: Json | null
          execution_id?: string
          id?: string
          level?: string
          message?: string
          step_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_logs_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      execution_metrics: {
        Row: {
          additional_data: Json | null
          execution_id: string
          id: string
          integration_id: string
          metric_type: string
          metric_unit: string
          metric_value: number
          recorded_at: string
          step_id: string
          tenant_id: string
          workflow_id: string
        }
        Insert: {
          additional_data?: Json | null
          execution_id: string
          id?: string
          integration_id: string
          metric_type: string
          metric_unit: string
          metric_value: number
          recorded_at?: string
          step_id: string
          tenant_id: string
          workflow_id: string
        }
        Update: {
          additional_data?: Json | null
          execution_id?: string
          id?: string
          integration_id?: string
          metric_type?: string
          metric_unit?: string
          metric_value?: number
          recorded_at?: string
          step_id?: string
          tenant_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "execution_metrics_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "execution_metrics_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      file_metadata: {
        Row: {
          bucket_name: string
          checksum: string | null
          created_at: string
          expires_at: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          integration_id: string | null
          is_processed: boolean | null
          metadata: Json | null
          mime_type: string
          processing_result: Json | null
          processing_status: string | null
          tenant_id: string
          updated_at: string
          uploaded_by: string | null
          usage_context: string | null
          workflow_id: string | null
        }
        Insert: {
          bucket_name: string
          checksum?: string | null
          created_at?: string
          expires_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          integration_id?: string | null
          is_processed?: boolean | null
          metadata?: Json | null
          mime_type: string
          processing_result?: Json | null
          processing_status?: string | null
          tenant_id: string
          updated_at?: string
          uploaded_by?: string | null
          usage_context?: string | null
          workflow_id?: string | null
        }
        Update: {
          bucket_name?: string
          checksum?: string | null
          created_at?: string
          expires_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          integration_id?: string | null
          is_processed?: boolean | null
          metadata?: Json | null
          mime_type?: string
          processing_result?: Json | null
          processing_status?: string | null
          tenant_id?: string
          updated_at?: string
          uploaded_by?: string | null
          usage_context?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_metadata_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_metadata_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_functions: {
        Row: {
          cache_duration: number | null
          created_at: string
          description: string | null
          error_mapping: Json | null
          execution_timeout: number | null
          function_config: Json
          function_name: string
          function_type: string
          id: string
          input_parameters: Json
          is_active: boolean | null
          is_cached: boolean | null
          output_format: Json | null
          rate_limit: Json | null
          tenant_id: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          cache_duration?: number | null
          created_at?: string
          description?: string | null
          error_mapping?: Json | null
          execution_timeout?: number | null
          function_config: Json
          function_name: string
          function_type: string
          id?: string
          input_parameters: Json
          is_active?: boolean | null
          is_cached?: boolean | null
          output_format?: Json | null
          rate_limit?: Json | null
          tenant_id: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          cache_duration?: number | null
          created_at?: string
          description?: string | null
          error_mapping?: Json | null
          execution_timeout?: number | null
          function_config?: Json
          function_name?: string
          function_type?: string
          id?: string
          input_parameters?: Json
          is_active?: boolean | null
          is_cached?: boolean | null
          output_format?: Json | null
          rate_limit?: Json | null
          tenant_id?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "helper_functions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          duration: number | null
          error: string | null
          id: string
          input: Json
          integration_id: string
          output: Json | null
          retry_count: number
          started_at: string
          status: string
          tenant_id: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          error?: string | null
          id?: string
          input?: Json
          integration_id: string
          output?: Json | null
          retry_count?: number
          started_at?: string
          status: string
          tenant_id: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration?: number | null
          error?: string | null
          id?: string
          input?: Json
          integration_id?: string
          output?: Json | null
          retry_count?: number
          started_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_integration_executions_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_integration_executions_workflow_id"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_migrations: {
        Row: {
          backup_data: Json | null
          completed_at: string | null
          created_at: string
          credentials_count: number | null
          error_details: Json | null
          id: string
          migration_batch_id: string
          migration_config: Json | null
          migration_log: Json | null
          migration_status: string
          migration_type: string
          source_integration_id: string
          started_at: string | null
          target_integration_id: string
          tenant_id: string
          updated_at: string
          workflow_count: number | null
        }
        Insert: {
          backup_data?: Json | null
          completed_at?: string | null
          created_at?: string
          credentials_count?: number | null
          error_details?: Json | null
          id?: string
          migration_batch_id: string
          migration_config?: Json | null
          migration_log?: Json | null
          migration_status?: string
          migration_type: string
          source_integration_id: string
          started_at?: string | null
          target_integration_id: string
          tenant_id: string
          updated_at?: string
          workflow_count?: number | null
        }
        Update: {
          backup_data?: Json | null
          completed_at?: string | null
          created_at?: string
          credentials_count?: number | null
          error_details?: Json | null
          id?: string
          migration_batch_id?: string
          migration_config?: Json | null
          migration_log?: Json | null
          migration_status?: string
          migration_type?: string
          source_integration_id?: string
          started_at?: string | null
          target_integration_id?: string
          tenant_id?: string
          updated_at?: string
          workflow_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_migrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_packages: {
        Row: {
          category: string
          changelog: Json | null
          created_at: string
          description: string | null
          display_name: string
          documentation_url: string | null
          download_count: number | null
          icon_url: string | null
          id: string
          installation_config: Json
          is_active: boolean | null
          is_verified: boolean | null
          min_halo_version: string | null
          package_config: Json
          package_name: string
          package_version: string
          price_per_month: number | null
          pricing_model: string | null
          rating: number | null
          rating_count: number | null
          screenshots: string[] | null
          support_url: string | null
          tags: string[] | null
          updated_at: string
          vendor_email: string | null
          vendor_name: string
        }
        Insert: {
          category: string
          changelog?: Json | null
          created_at?: string
          description?: string | null
          display_name: string
          documentation_url?: string | null
          download_count?: number | null
          icon_url?: string | null
          id?: string
          installation_config: Json
          is_active?: boolean | null
          is_verified?: boolean | null
          min_halo_version?: string | null
          package_config: Json
          package_name: string
          package_version?: string
          price_per_month?: number | null
          pricing_model?: string | null
          rating?: number | null
          rating_count?: number | null
          screenshots?: string[] | null
          support_url?: string | null
          tags?: string[] | null
          updated_at?: string
          vendor_email?: string | null
          vendor_name: string
        }
        Update: {
          category?: string
          changelog?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string
          documentation_url?: string | null
          download_count?: number | null
          icon_url?: string | null
          id?: string
          installation_config?: Json
          is_active?: boolean | null
          is_verified?: boolean | null
          min_halo_version?: string | null
          package_config?: Json
          package_name?: string
          package_version?: string
          price_per_month?: number | null
          pricing_model?: string | null
          rating?: number | null
          rating_count?: number | null
          screenshots?: string[] | null
          support_url?: string | null
          tags?: string[] | null
          updated_at?: string
          vendor_email?: string | null
          vendor_name?: string
        }
        Relationships: []
      }
      marketplace_reviews: {
        Row: {
          created_at: string
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          is_visible: boolean | null
          package_id: string
          rating: number
          reported_count: number | null
          review_text: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          is_visible?: boolean | null
          package_id: string
          rating: number
          reported_count?: number | null
          review_text?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          is_visible?: boolean | null
          package_id?: string
          rating?: number
          reported_count?: number | null
          review_text?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "marketplace_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_configs: {
        Row: {
          client_id: string
          client_secret: string
          created_at: string
          id: string
          is_active: boolean
          redirect_uri: string | null
          scopes: string[] | null
          service_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          client_secret: string
          created_at?: string
          id?: string
          is_active?: boolean
          redirect_uri?: string | null
          scopes?: string[] | null
          service_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          client_secret?: string
          created_at?: string
          id?: string
          is_active?: boolean
          redirect_uri?: string | null
          scopes?: string[] | null
          service_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      oauth_states: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          service_id: string
          state: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          service_id: string
          state: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          service_id?: string
          state?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_oauth_states_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      operation_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          error_handling: Json | null
          id: string
          input_schema: Json
          is_active: boolean | null
          is_system_template: boolean | null
          operation_config: Json
          output_schema: Json
          retry_config: Json | null
          tags: string[] | null
          template_name: string
          tenant_id: string
          updated_at: string
          usage_count: number | null
          version: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          error_handling?: Json | null
          id?: string
          input_schema: Json
          is_active?: boolean | null
          is_system_template?: boolean | null
          operation_config: Json
          output_schema: Json
          retry_config?: Json | null
          tags?: string[] | null
          template_name: string
          tenant_id: string
          updated_at?: string
          usage_count?: number | null
          version?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          error_handling?: Json | null
          id?: string
          input_schema?: Json
          is_active?: boolean | null
          is_system_template?: boolean | null
          operation_config?: Json
          output_schema?: Json
          retry_config?: Json | null
          tags?: string[] | null
          template_name?: string
          tenant_id?: string
          updated_at?: string
          usage_count?: number | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operation_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          id: string
          is_acknowledged: boolean | null
          is_resolved: boolean | null
          message: string
          metric_data: Json | null
          related_entity_id: string | null
          related_entity_type: string | null
          resolved_at: string | null
          severity: string
          tenant_id: string
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          message: string
          metric_data?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          severity: string
          tenant_id: string
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          is_acknowledged?: boolean | null
          is_resolved?: boolean | null
          message?: string
          metric_data?: Json | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          severity?: string
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_benchmarks: {
        Row: {
          baseline_value: number
          benchmark_type: string
          calculation_period: string
          created_at: string
          current_value: number
          id: string
          integration_id: string | null
          last_calculated: string
          metric_name: string
          sample_size: number
          tenant_id: string
          threshold_critical: number | null
          threshold_warning: number | null
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          baseline_value: number
          benchmark_type: string
          calculation_period: string
          created_at?: string
          current_value: number
          id?: string
          integration_id?: string | null
          last_calculated?: string
          metric_name: string
          sample_size: number
          tenant_id: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          baseline_value?: number
          benchmark_type?: string
          calculation_period?: string
          created_at?: string
          current_value?: number
          id?: string
          integration_id?: string | null
          last_calculated?: string
          metric_name?: string
          sample_size?: number
          tenant_id?: string
          threshold_critical?: number | null
          threshold_warning?: number | null
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_benchmarks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_benchmarks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      system_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          priority: number | null
          tags: string[] | null
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          priority?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          priority?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      tenant_credentials: {
        Row: {
          auth_type: string | null
          created_at: string
          credentials: Json
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          name: string
          scopes: string[] | null
          service_type: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          auth_type?: string | null
          created_at?: string
          credentials: Json
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          scopes?: string[] | null
          service_type: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          auth_type?: string | null
          created_at?: string
          credentials?: Json
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          scopes?: string[] | null
          service_type?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_credentials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_features: {
        Row: {
          created_at: string
          current_usage: number | null
          feature_config: Json | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          last_reset: string | null
          reset_period: string | null
          tenant_id: string
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          created_at?: string
          current_usage?: number | null
          feature_config?: Json | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          last_reset?: string | null
          reset_period?: string | null
          tenant_id: string
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          created_at?: string
          current_usage?: number | null
          feature_config?: Json | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          last_reset?: string | null
          reset_period?: string | null
          tenant_id?: string
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_features_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_knowledge_bases: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          tags: string[] | null
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          tags?: string[] | null
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          tags?: string[] | null
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_knowledge_bases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_marketplace_installs: {
        Row: {
          custom_settings: Json | null
          id: string
          installation_config: Json | null
          installed_at: string
          installed_version: string
          is_active: boolean | null
          last_updated: string
          package_id: string
          tenant_id: string
        }
        Insert: {
          custom_settings?: Json | null
          id?: string
          installation_config?: Json | null
          installed_at?: string
          installed_version: string
          is_active?: boolean | null
          last_updated?: string
          package_id: string
          tenant_id: string
        }
        Update: {
          custom_settings?: Json | null
          id?: string
          installation_config?: Json | null
          installed_at?: string
          installed_version?: string
          is_active?: boolean | null
          last_updated?: string
          package_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_marketplace_installs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "marketplace_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_marketplace_installs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_quotas: {
        Row: {
          created_at: string
          current_usage: number | null
          hard_limit: number | null
          id: string
          last_reset: string | null
          quota_limit: number
          reset_period: string | null
          resource_type: string
          soft_limit: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_usage?: number | null
          hard_limit?: number | null
          id?: string
          last_reset?: string | null
          quota_limit: number
          reset_period?: string | null
          resource_type: string
          soft_limit?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_usage?: number | null
          hard_limit?: number | null
          id?: string
          last_reset?: string | null
          quota_limit?: number
          reset_period?: string | null
          resource_type?: string
          soft_limit?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_quotas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          masp_provider_data: Json | null
          name: string
          settings: Json | null
          subdomain: string
          updated_at: string
          white_label_config: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          masp_provider_data?: Json | null
          name: string
          settings?: Json | null
          subdomain: string
          updated_at?: string
          white_label_config?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          masp_provider_data?: Json | null
          name?: string
          settings?: Json | null
          subdomain?: string
          updated_at?: string
          white_label_config?: Json | null
        }
        Relationships: []
      }
      webhook_environments: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_production: boolean
          name: string
          tenant_id: string
          updated_at: string
          url: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_production?: boolean
          name: string
          tenant_id: string
          updated_at?: string
          url: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_production?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
          url?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_webhook_environments_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_webhook_environments_workflow_id"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_executions: {
        Row: {
          duration: number
          error: string | null
          executed_at: string
          id: string
          request: Json
          response: Json | null
          status: string
          webhook_id: string
        }
        Insert: {
          duration?: number
          error?: string | null
          executed_at?: string
          id?: string
          request: Json
          response?: Json | null
          status: string
          webhook_id: string
        }
        Update: {
          duration?: number
          error?: string | null
          executed_at?: string
          id?: string
          request?: Json
          response?: Json | null
          status?: string
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_webhook_executions_webhook_id"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          body: string | null
          created_at: string
          headers: Json
          id: string
          is_active: boolean
          method: string
          retries: number
          tenant_id: string
          timeout: number
          updated_at: string
          url: string
          workflow_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          headers?: Json
          id?: string
          is_active?: boolean
          method: string
          retries?: number
          tenant_id: string
          timeout?: number
          updated_at?: string
          url: string
          workflow_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          headers?: Json
          id?: string
          is_active?: boolean
          method?: string
          retries?: number
          tenant_id?: string
          timeout?: number
          updated_at?: string
          url?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_webhooks_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_webhooks_workflow_id"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_conversions: {
        Row: {
          conversion_notes: string | null
          conversion_status: string
          converted_steps: Json | null
          created_at: string
          id: string
          manual_review_required: boolean | null
          migration_id: string
          original_steps: Json
          reviewed_at: string | null
          reviewed_by: string | null
          tenant_id: string
          updated_at: string
          validation_results: Json | null
          workflow_id: string
        }
        Insert: {
          conversion_notes?: string | null
          conversion_status?: string
          converted_steps?: Json | null
          created_at?: string
          id?: string
          manual_review_required?: boolean | null
          migration_id: string
          original_steps: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          tenant_id: string
          updated_at?: string
          validation_results?: Json | null
          workflow_id: string
        }
        Update: {
          conversion_notes?: string | null
          conversion_status?: string
          converted_steps?: Json | null
          created_at?: string
          id?: string
          manual_review_required?: boolean | null
          migration_id?: string
          original_steps?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          tenant_id?: string
          updated_at?: string
          validation_results?: Json | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_conversions_migration_id_fkey"
            columns: ["migration_id"]
            isOneToOne: false
            referencedRelation: "integration_migrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_conversions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_conversions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: string | null
          id: string
          input: Json
          output: Json | null
          started_at: string
          status: string
          tenant_id: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          id?: string
          input?: Json
          output?: Json | null
          started_at?: string
          status?: string
          tenant_id: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: string | null
          id?: string
          input?: Json
          output?: Json | null
          started_at?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          last_executed: string | null
          name: string
          status: string | null
          steps: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          last_executed?: string | null
          name: string
          status?: string | null
          steps?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          last_executed?: string | null
          name?: string
          status?: string | null
          steps?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_performance_metrics: {
        Args: { _tenant_id: string; _time_period?: unknown }
        Returns: Json
      }
      check_tenant_quota: {
        Args: {
          _tenant_id: string
          _resource_type: string
          _usage_increment?: number
        }
        Returns: Json
      }
      cleanup_expired_files: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_tenant_quota_usage: {
        Args: {
          _tenant_id: string
          _resource_type: string
          _usage_change: number
        }
        Returns: boolean
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
