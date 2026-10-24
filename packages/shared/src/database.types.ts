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
          role: "super_admin" | "core_team" | "volunteer" | "member";
          status: "active" | "invited" | "deactivated";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          role: "super_admin" | "core_team" | "volunteer" | "member";
          status?: "active" | "invited" | "deactivated";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          role?: "super_admin" | "core_team" | "volunteer" | "member";
          status?: "active" | "invited" | "deactivated";
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          full_name?: string;
          avatar_url?: string | null;
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
          role: "super_admin" | "core_team" | "volunteer" | "member";
          permission: string;
        };
        Insert: {
          role: "super_admin" | "core_team" | "volunteer" | "member";
          permission: string;
        };
        Update: {
          role?: "super_admin" | "core_team" | "volunteer" | "member";
          permission?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          role: "core_team" | "volunteer" | "member";
          full_name: string;
          status: "pending" | "accepted" | "expired" | "revoked";
          invited_by: string;
          accepted_by: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: "core_team" | "volunteer" | "member";
          full_name: string;
          status?: "pending" | "accepted" | "expired" | "revoked";
          invited_by: string;
          accepted_by?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "core_team" | "volunteer" | "member";
          full_name?: string;
          status?: "pending" | "accepted" | "expired" | "revoked";
          invited_by?: string;
          accepted_by?: string | null;
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
