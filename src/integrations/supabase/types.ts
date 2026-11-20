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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      character_creation_messages: {
        Row: {
          content: string
          created_at: string
          creation_id: string
          id: string
          role: string
          step: string | null
        }
        Insert: {
          content: string
          created_at?: string
          creation_id: string
          id?: string
          role: string
          step?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          creation_id?: string
          id?: string
          role?: string
          step?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "character_creation_messages_creation_id_fkey"
            columns: ["creation_id"]
            isOneToOne: false
            referencedRelation: "created_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      character_overrides: {
        Row: {
          applied_at: string
          applied_by_email: string | null
          character_id: string
          id: string
          request_id: string | null
          sheet_patch: Json
          summary_patch: Json
        }
        Insert: {
          applied_at?: string
          applied_by_email?: string | null
          character_id: string
          id?: string
          request_id?: string | null
          sheet_patch?: Json
          summary_patch?: Json
        }
        Update: {
          applied_at?: string
          applied_by_email?: string | null
          character_id?: string
          id?: string
          request_id?: string | null
          sheet_patch?: Json
          summary_patch?: Json
        }
        Relationships: [
          {
            foreignKeyName: "character_overrides_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "level_up_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      created_characters: {
        Row: {
          approved_at: string | null
          approved_by_email: string | null
          created_at: string
          created_by_email: string | null
          draft_data: Json
          id: string
          name: string
          published_character_id: string | null
          published_quickref: Json | null
          published_sheet: Json | null
          published_summary: Json | null
          status: string
          submitted_at: string | null
          target_level: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by_email?: string | null
          created_at?: string
          created_by_email?: string | null
          draft_data?: Json
          id?: string
          name?: string
          published_character_id?: string | null
          published_quickref?: Json | null
          published_sheet?: Json | null
          published_summary?: Json | null
          status?: string
          submitted_at?: string | null
          target_level?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by_email?: string | null
          created_at?: string
          created_by_email?: string | null
          draft_data?: Json
          id?: string
          name?: string
          published_character_id?: string | null
          published_quickref?: Json | null
          published_sheet?: Json | null
          published_summary?: Json | null
          status?: string
          submitted_at?: string | null
          target_level?: number
          updated_at?: string
        }
        Relationships: []
      }
      level_up_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          request_id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          request_id: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          request_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "level_up_chat_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "level_up_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      level_up_requests: {
        Row: {
          approved_at: string | null
          character_id: string
          created_at: string
          enabled_at: string
          enabled_by_email: string | null
          from_level: number
          id: string
          status: string
          submitted_at: string | null
          to_level: number
        }
        Insert: {
          approved_at?: string | null
          character_id: string
          created_at?: string
          enabled_at?: string
          enabled_by_email?: string | null
          from_level: number
          id?: string
          status?: string
          submitted_at?: string | null
          to_level: number
        }
        Update: {
          approved_at?: string | null
          character_id?: string
          created_at?: string
          enabled_at?: string
          enabled_by_email?: string | null
          from_level?: number
          id?: string
          status?: string
          submitted_at?: string | null
          to_level?: number
        }
        Relationships: []
      }
      level_up_sheets: {
        Row: {
          created_at: string
          decisions: Json
          id: string
          request_id: string
          summary: string
        }
        Insert: {
          created_at?: string
          decisions?: Json
          id?: string
          request_id: string
          summary: string
        }
        Update: {
          created_at?: string
          decisions?: Json
          id?: string
          request_id?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "level_up_sheets_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "level_up_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      magia_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "magia_chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "magia_chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      magia_chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      tecnologia_chat_messages: {
        Row: {
          applied_override_id: string | null
          content: string
          created_at: string
          id: string
          pending_patch: Json | null
          role: string
          session_id: string
        }
        Insert: {
          applied_override_id?: string | null
          content: string
          created_at?: string
          id?: string
          pending_patch?: Json | null
          role: string
          session_id: string
        }
        Update: {
          applied_override_id?: string | null
          content?: string
          created_at?: string
          id?: string
          pending_patch?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      tecnologia_chat_sessions: {
        Row: {
          created_at: string
          created_by_email: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by_email?: string | null
          id?: string
          title?: string
        }
        Update: {
          created_at?: string
          created_by_email?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      voz_config: {
        Row: {
          enabled: boolean
          id: number
          model: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          id?: number
          model?: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          id?: number
          model?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
