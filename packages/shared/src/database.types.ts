// Auto-generated Supabase database types.
//
// To regenerate from a running Supabase instance:
//   npx supabase gen types typescript --project-id <project-id> > packages/shared/src/database.types.ts
//
// Or from a local instance:
//   npx supabase gen types typescript --local > packages/shared/src/database.types.ts
//
// This placeholder defines the schema so TypeScript can check code before
// the remote project is connected.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string;
          role: "super_admin" | "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member";
          status: "active" | "invited" | "deactivated";
          department: "operations" | "social_media" | "creative" | "logistics" | "general" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role: "super_admin" | "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member";
          status?: "active" | "invited" | "deactivated";
          department?: "operations" | "social_media" | "creative" | "logistics" | "general" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          role?: "super_admin" | "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member";
          status?: "active" | "invited" | "deactivated";
          department?: "operations" | "social_media" | "creative" | "logistics" | "general" | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          user_id: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
          college: string | null;
          branch: string | null;
          graduation_year: number | null;
          skills: string[];
          github_url: string | null;
          linkedin_url: string | null;
          instagram_url: string | null;
          x_url: string | null;
          portfolio_url: string | null;
          contact_number: string | null;
          public_profile: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          college?: string | null;
          branch?: string | null;
          graduation_year?: number | null;
          skills?: string[];
          github_url?: string | null;
          linkedin_url?: string | null;
          instagram_url?: string | null;
          x_url?: string | null;
          portfolio_url?: string | null;
          contact_number?: string | null;
          public_profile?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          college?: string | null;
          branch?: string | null;
          graduation_year?: number | null;
          skills?: string[];
          github_url?: string | null;
          linkedin_url?: string | null;
          instagram_url?: string | null;
          x_url?: string | null;
          portfolio_url?: string | null;
          contact_number?: string | null;
          public_profile?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          role: "super_admin" | "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member";
          permission: string;
        };
        Insert: {
          role: "super_admin" | "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member";
          permission: string;
        };
        Update: {
          role?: "super_admin" | "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member";
          permission?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member";
          full_name: string;
          status: "pending" | "accepted" | "expired" | "revoked";
          invited_by: string;
          accepted_by: string | null;
          department: "operations" | "social_media" | "creative" | "logistics" | "general" | null;
          notes: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member";
          full_name: string;
          status?: "pending" | "accepted" | "expired" | "revoked";
          invited_by: string;
          accepted_by?: string | null;
          department?: "operations" | "social_media" | "creative" | "logistics" | "general" | null;
          notes?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "operations" | "social_media" | "creative" | "logistics" | "volunteer" | "member";
          full_name?: string;
          status?: "pending" | "accepted" | "expired" | "revoked";
          invited_by?: string;
          accepted_by?: string | null;
          department?: "operations" | "social_media" | "creative" | "logistics" | "general" | null;
          notes?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_accepted_by_fkey";
            columns: ["accepted_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string;
          action?: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          summary: string | null;
          description: string | null;
          cover_image_path: string | null;
          location_name: string | null;
          starts_at: string;
          ends_at: string | null;
          registration_url: string | null;
          status: "draft" | "published" | "completed";
          featured: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          summary?: string | null;
          description?: string | null;
          cover_image_path?: string | null;
          location_name?: string | null;
          starts_at: string;
          ends_at?: string | null;
          registration_url?: string | null;
          status?: "draft" | "published" | "completed";
          featured?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          summary?: string | null;
          description?: string | null;
          cover_image_path?: string | null;
          location_name?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          registration_url?: string | null;
          status?: "draft" | "published" | "completed";
          featured?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      event_images: {
        Row: {
          id: string;
          event_id: string;
          storage_path: string;
          alt_text: string | null;
          caption: string | null;
          sort_order: number;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          storage_path: string;
          alt_text?: string | null;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          storage_path?: string;
          alt_text?: string | null;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
          created_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_images_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_images_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          id: string;
          title: string;
          slug: string;
          summary: string | null;
          description: string | null;
          repository_url: string | null;
          live_url: string | null;
          cover_image_path: string | null;
          technologies: string[];
          status: "draft" | "published";
          featured: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          summary?: string | null;
          description?: string | null;
          repository_url?: string | null;
          live_url?: string | null;
          cover_image_path?: string | null;
          technologies?: string[];
          status?: "draft" | "published";
          featured?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          summary?: string | null;
          description?: string | null;
          repository_url?: string | null;
          live_url?: string | null;
          cover_image_path?: string | null;
          technologies?: string[];
          status?: "draft" | "published";
          featured?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      gallery_images: {
        Row: {
          id: string;
          storage_path: string;
          alt_text: string | null;
          caption: string | null;
          event_id: string | null;
          category: string;
          sort_order: number;
          status: "draft" | "published";
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          storage_path: string;
          alt_text?: string | null;
          caption?: string | null;
          event_id?: string | null;
          category?: string;
          sort_order?: number;
          status?: "draft" | "published";
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          storage_path?: string;
          alt_text?: string | null;
          caption?: string | null;
          event_id?: string | null;
          category?: string;
          sort_order?: number;
          status?: "draft" | "published";
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gallery_images_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gallery_images_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          id: number;
          content: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: number;
          content?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: number;
          content?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      certificate_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          background_storage_path: string;
          canvas_width: number;
          canvas_height: number;
          design_config: Json;
          status: "draft" | "active" | "archived";
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          background_storage_path: string;
          canvas_width: number;
          canvas_height: number;
          design_config?: Json;
          status?: "draft" | "active" | "archived";
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          background_storage_path?: string;
          canvas_width?: number;
          canvas_height?: number;
          design_config?: Json;
          status?: "draft" | "active" | "archived";
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "certificate_templates_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      certificate_batches: {
        Row: {
          id: string;
          name: string;
          template_id: string;
          certificate_title: string;
          event_name: string | null;
          issued_by: string;
          status: "pending" | "processing" | "completed" | "failed";
          total_count: number;
          success_count: number;
          failure_count: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          template_id: string;
          certificate_title: string;
          event_name?: string | null;
          issued_by: string;
          status?: "pending" | "processing" | "completed" | "failed";
          total_count?: number;
          success_count?: number;
          failure_count?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          template_id?: string;
          certificate_title?: string;
          event_name?: string | null;
          issued_by?: string;
          status?: "pending" | "processing" | "completed" | "failed";
          total_count?: number;
          success_count?: number;
          failure_count?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "certificate_batches_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "certificate_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificate_batches_issued_by_fkey";
            columns: ["issued_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      certificates: {
        Row: {
          id: string;
          certificate_number: string;
          verification_token: string;
          batch_id: string;
          template_id: string;
          recipient_name: string;
          recipient_email: string | null;
          certificate_title: string;
          event_name: string | null;
          issued_at: string;
          issued_by: string;
          status: "valid" | "revoked";
          file_storage_path: string | null;
          revoked_at: string | null;
          revoked_by: string | null;
          revocation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          certificate_number: string;
          verification_token: string;
          batch_id: string;
          template_id: string;
          recipient_name: string;
          recipient_email?: string | null;
          certificate_title: string;
          event_name?: string | null;
          issued_at?: string;
          issued_by: string;
          status?: "valid" | "revoked";
          file_storage_path?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          revocation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          certificate_number?: string;
          verification_token?: string;
          batch_id?: string;
          template_id?: string;
          recipient_name?: string;
          recipient_email?: string | null;
          certificate_title?: string;
          event_name?: string | null;
          issued_at?: string;
          issued_by?: string;
          status?: "valid" | "revoked";
          file_storage_path?: string | null;
          revoked_at?: string | null;
          revoked_by?: string | null;
          revocation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "certificates_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "certificate_batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "certificate_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_issued_by_fkey";
            columns: ["issued_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "certificates_revoked_by_fkey";
            columns: ["revoked_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          department: "operations" | "social_media" | "creative" | "logistics" | "general" | null;
          assigned_to: string | null;
          created_by: string;
          priority: "low" | "medium" | "high" | "urgent";
          status: "todo" | "in_progress" | "blocked" | "in_review" | "completed" | "cancelled";
          due_date: string | null;
          event_id: string | null;
          is_claimable: boolean;
          evidence: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          department?: "operations" | "social_media" | "creative" | "logistics" | "general" | null;
          assigned_to?: string | null;
          created_by: string;
          priority?: "low" | "medium" | "high" | "urgent";
          status?: "todo" | "in_progress" | "blocked" | "in_review" | "completed" | "cancelled";
          due_date?: string | null;
          event_id?: string | null;
          is_claimable?: boolean;
          evidence?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          department?: "operations" | "social_media" | "creative" | "logistics" | "general" | null;
          assigned_to?: string | null;
          created_by?: string;
          priority?: "low" | "medium" | "high" | "urgent";
          status?: "todo" | "in_progress" | "blocked" | "in_review" | "completed" | "cancelled";
          due_date?: string | null;
          event_id?: string | null;
          is_claimable?: boolean;
          evidence?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          author_id?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      event_budgets: {
        Row: {
          id: string;
          event_id: string;
          category: string;
          proposed_amount: number;
          approved_amount: number | null;
          spending_limit: number | null;
          approval_status: "pending" | "approved" | "rejected";
          approved_by: string | null;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          category: string;
          proposed_amount: number;
          approved_amount?: number | null;
          spending_limit?: number | null;
          approval_status?: "pending" | "approved" | "rejected";
          approved_by?: string | null;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          category?: string;
          proposed_amount?: number;
          approved_amount?: number | null;
          spending_limit?: number | null;
          approval_status?: "pending" | "approved" | "rejected";
          approved_by?: string | null;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_budgets_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_budgets_approved_by_fkey";
            columns: ["approved_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_budgets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          event_id: string | null;
          budget_id: string | null;
          category: string;
          description: string;
          amount: number;
          expense_date: string;
          vendor: string | null;
          receipt_storage_path: string | null;
          payment_method: "cash" | "upi" | "bank_transfer" | "card" | "other" | null;
          incurred_by: string;
          submitted_by: string;
          status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "reimbursed";
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          budget_id?: string | null;
          category: string;
          description: string;
          amount: number;
          expense_date: string;
          vendor?: string | null;
          receipt_storage_path?: string | null;
          payment_method?: "cash" | "upi" | "bank_transfer" | "card" | "other" | null;
          incurred_by: string;
          submitted_by: string;
          status?: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "reimbursed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          budget_id?: string | null;
          category?: string;
          description?: string;
          amount?: number;
          expense_date?: string;
          vendor?: string | null;
          receipt_storage_path?: string | null;
          payment_method?: "cash" | "upi" | "bank_transfer" | "card" | "other" | null;
          incurred_by?: string;
          submitted_by?: string;
          status?: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "reimbursed";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_budget_id_fkey";
            columns: ["budget_id"];
            isOneToOne: false;
            referencedRelation: "event_budgets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_incurred_by_fkey";
            columns: ["incurred_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      social_posts: {
        Row: {
          id: string;
          title: string;
          caption: string | null;
          platform: string[];
          campaign: string | null;
          event_id: string | null;
          asset_paths: string[];
          status: "draft" | "in_review" | "approved" | "published";
          scheduled_for: string | null;
          published_url: string | null;
          published_at: string | null;
          created_by: string;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          caption?: string | null;
          platform?: string[];
          campaign?: string | null;
          event_id?: string | null;
          asset_paths?: string[];
          status?: "draft" | "in_review" | "approved" | "published";
          scheduled_for?: string | null;
          published_url?: string | null;
          published_at?: string | null;
          created_by: string;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          caption?: string | null;
          platform?: string[];
          campaign?: string | null;
          event_id?: string | null;
          asset_paths?: string[];
          status?: "draft" | "in_review" | "approved" | "published";
          scheduled_for?: string | null;
          published_url?: string | null;
          published_at?: string | null;
          created_by?: string;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "social_posts_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_posts_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "social_posts_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      creative_assets: {
        Row: {
          id: string;
          title: string;
          asset_type: "poster" | "banner" | "thumbnail" | "certificate_design" | "social_graphic" | "other";
          storage_path: string;
          event_id: string | null;
          status: "draft" | "in_review" | "approved" | "rejected";
          reviewed_by: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          asset_type: "poster" | "banner" | "thumbnail" | "certificate_design" | "social_graphic" | "other";
          storage_path: string;
          event_id?: string | null;
          status?: "draft" | "in_review" | "approved" | "rejected";
          reviewed_by?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          asset_type?: "poster" | "banner" | "thumbnail" | "certificate_design" | "social_graphic" | "other";
          storage_path?: string;
          event_id?: string | null;
          status?: "draft" | "in_review" | "approved" | "rejected";
          reviewed_by?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "creative_assets_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creative_assets_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "creative_assets_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: { required_role?: string };
        Returns: boolean;
      };
      has_permission: {
        Args: { required_permission: string };
        Returns: boolean;
      };
      verify_certificate: {
        Args: { token: string };
        Returns: {
          certificate_number: string;
          recipient_name: string;
          certificate_title: string;
          event_name: string | null;
          issued_at: string;
          status: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
