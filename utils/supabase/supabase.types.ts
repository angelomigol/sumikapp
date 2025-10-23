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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          program_batch_id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          program_batch_id: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          program_batch_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "batch_requirements_compliance_summary"
            referencedColumns: ["program_batch_id"]
          },
          {
            foreignKeyName: "announcements_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "program_batch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "program_batch_overview_dashboard"
            referencedColumns: ["batch_id"]
          },
        ]
      }
      batch_requirements: {
        Row: {
          created_at: string | null
          id: string
          is_mandatory: boolean | null
          program_batch_id: string
          requirement_type_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          program_batch_id: string
          requirement_type_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_mandatory?: boolean | null
          program_batch_id?: string
          requirement_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_requirements_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "batch_requirements_compliance_summary"
            referencedColumns: ["program_batch_id"]
          },
          {
            foreignKeyName: "batch_requirements_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "program_batch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_requirements_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "program_batch_overview_dashboard"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "batch_requirements_requirement_type_id_fkey"
            columns: ["requirement_type_id"]
            isOneToOne: false
            referencedRelation: "batch_requirements_compliance_summary"
            referencedColumns: ["requirement_type_id"]
          },
          {
            foreignKeyName: "batch_requirements_requirement_type_id_fkey"
            columns: ["requirement_type_id"]
            isOneToOne: false
            referencedRelation: "requirement_types"
            referencedColumns: ["id"]
          },
        ]
      }
      coordinators: {
        Row: {
          created_at: string
          department: string
          id: string
        }
        Insert: {
          created_at?: string
          department: string
          id: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordinators_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      employability_predictions: {
        Row: {
          confidence_level: string | null
          created_at: string
          evaluation_scores: Json | null
          evaluator_id: string | null
          feature_scores: Json | null
          id: string
          model_id: string | null
          prediction_date: string | null
          prediction_label: string
          prediction_probability: number | null
          recommendations: Json | null
          remarks: Json | null
          risk_factors: Json | null
          trainee_batch_enrollment_id: string | null
        }
        Insert: {
          confidence_level?: string | null
          created_at?: string
          evaluation_scores?: Json | null
          evaluator_id?: string | null
          feature_scores?: Json | null
          id?: string
          model_id?: string | null
          prediction_date?: string | null
          prediction_label: string
          prediction_probability?: number | null
          recommendations?: Json | null
          remarks?: Json | null
          risk_factors?: Json | null
          trainee_batch_enrollment_id?: string | null
        }
        Update: {
          confidence_level?: string | null
          created_at?: string
          evaluation_scores?: Json | null
          evaluator_id?: string | null
          feature_scores?: Json | null
          id?: string
          model_id?: string | null
          prediction_date?: string | null
          prediction_label?: string
          prediction_probability?: number | null
          recommendations?: Json | null
          remarks?: Json | null
          risk_factors?: Json | null
          trainee_batch_enrollment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employability_predictions_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "supervisor_overview_dashboard"
            referencedColumns: ["supervisor_id"]
          },
          {
            foreignKeyName: "employability_predictions_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "supervisors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employability_predictions_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employability_predictions_trainee_batch_enrollment_id_fkey"
            columns: ["trainee_batch_enrollment_id"]
            isOneToOne: false
            referencedRelation: "trainee_batch_enrollment"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_importance: {
        Row: {
          created_at: string
          feature_name: string
          id: string
          importance_score: number
          model_id: string
        }
        Insert: {
          created_at?: string
          feature_name: string
          id?: string
          importance_score: number
          model_id: string
        }
        Update: {
          created_at?: string
          feature_name?: string
          id?: string
          importance_score?: number
          model_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_importance_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_partners: {
        Row: {
          company_address: string | null
          company_contact_number: string | null
          company_name: string
          created_at: string
          date_of_signing: string | null
          file_name: string | null
          id: string
          moa_file_path: string | null
          nature_of_business: string | null
        }
        Insert: {
          company_address?: string | null
          company_contact_number?: string | null
          company_name: string
          created_at?: string
          date_of_signing?: string | null
          file_name?: string | null
          id?: string
          moa_file_path?: string | null
          nature_of_business?: string | null
        }
        Update: {
          company_address?: string | null
          company_contact_number?: string | null
          company_name?: string
          created_at?: string
          date_of_signing?: string | null
          file_name?: string | null
          id?: string
          moa_file_path?: string | null
          nature_of_business?: string | null
        }
        Relationships: []
      }
      internship_details: {
        Row: {
          address: string
          company_name: string
          contact_number: string
          created_at: string
          daily_schedule: string[]
          end_date: string
          end_time: string
          enrollment_id: string
          feedback: string | null
          id: string
          job_role: string
          lunch_break_in_mins: number
          nature_of_business: string
          start_date: string
          start_time: string
          status: Database["public"]["Enums"]["document_status"]
          supervisor_id: string | null
          temp_email: string | null
        }
        Insert: {
          address: string
          company_name: string
          contact_number: string
          created_at?: string
          daily_schedule: string[]
          end_date: string
          end_time: string
          enrollment_id: string
          feedback?: string | null
          id?: string
          job_role: string
          lunch_break_in_mins?: number
          nature_of_business: string
          start_date: string
          start_time: string
          status: Database["public"]["Enums"]["document_status"]
          supervisor_id?: string | null
          temp_email?: string | null
        }
        Update: {
          address?: string
          company_name?: string
          contact_number?: string
          created_at?: string
          daily_schedule?: string[]
          end_date?: string
          end_time?: string
          enrollment_id?: string
          feedback?: string | null
          id?: string
          job_role?: string
          lunch_break_in_mins?: number
          nature_of_business?: string
          start_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["document_status"]
          supervisor_id?: string | null
          temp_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_details_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "trainee_batch_enrollment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_details_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "supervisor_overview_dashboard"
            referencedColumns: ["supervisor_id"]
          },
          {
            foreignKeyName: "internship_details_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "supervisors"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_models: {
        Row: {
          accuracy: number
          algorithm_type: string
          created_at: string
          f1_score: number
          feature_count: number
          id: string
          is_active: boolean
          model_file_path: string
          model_name: string
          model_version: string
          precision_score: number
          recall_score: number
          training_date: string
          training_samples: number
          updated_at: string | null
        }
        Insert: {
          accuracy: number
          algorithm_type: string
          created_at?: string
          f1_score: number
          feature_count: number
          id?: string
          is_active?: boolean
          model_file_path: string
          model_name: string
          model_version: string
          precision_score: number
          recall_score: number
          training_date: string
          training_samples: number
          updated_at?: string | null
        }
        Update: {
          accuracy?: number
          algorithm_type?: string
          created_at?: string
          f1_score?: number
          feature_count?: number
          id?: string
          is_active?: boolean
          model_file_path?: string
          model_name?: string
          model_version?: string
          precision_score?: number
          recall_score?: number
          training_date?: string
          training_samples?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_tokens: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          reference_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          reference_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          reference_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      program_batch: {
        Row: {
          coordinator_id: string
          created_at: string
          description: string | null
          end_date: string
          id: string
          internship_code: Database["public"]["Enums"]["internship_code"]
          required_hours: number
          start_date: string
          title: string
        }
        Insert: {
          coordinator_id: string
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          internship_code: Database["public"]["Enums"]["internship_code"]
          required_hours: number
          start_date: string
          title: string
        }
        Update: {
          coordinator_id?: string
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          internship_code?: Database["public"]["Enums"]["internship_code"]
          required_hours?: number
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_batch_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "coordinator_overview_dashboard"
            referencedColumns: ["coordinator_id"]
          },
          {
            foreignKeyName: "program_batch_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "coordinators"
            referencedColumns: ["id"]
          },
        ]
      }
      recent_activity: {
        Row: {
          activity_description: string | null
          activity_timestamp: string
          activity_title: string
          activity_type: Database["public"]["Enums"]["activity_type_enum"]
          created_at: string
          id: string
          is_deleted: boolean
          metadata: Json | null
          program_batch_id: string | null
          reference_id: string
          reference_type: string
          user_id: string | null
          user_role: Database["public"]["Enums"]["role"] | null
        }
        Insert: {
          activity_description?: string | null
          activity_timestamp?: string
          activity_title: string
          activity_type: Database["public"]["Enums"]["activity_type_enum"]
          created_at?: string
          id?: string
          is_deleted?: boolean
          metadata?: Json | null
          program_batch_id?: string | null
          reference_id: string
          reference_type: string
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["role"] | null
        }
        Update: {
          activity_description?: string | null
          activity_timestamp?: string
          activity_title?: string
          activity_type?: Database["public"]["Enums"]["activity_type_enum"]
          created_at?: string
          id?: string
          is_deleted?: boolean
          metadata?: Json | null
          program_batch_id?: string | null
          reference_id?: string
          reference_type?: string
          user_id?: string | null
          user_role?: Database["public"]["Enums"]["role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "recent_activity_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "batch_requirements_compliance_summary"
            referencedColumns: ["program_batch_id"]
          },
          {
            foreignKeyName: "recent_activity_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "program_batch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recent_activity_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "program_batch_overview_dashboard"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "recent_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      requirement_types: {
        Row: {
          allowed_file_types: string[]
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_predefined: boolean
          max_file_size_bytes: number
          name: string
          template_file_name: string | null
          template_file_path: string | null
          updated_at: string
        }
        Insert: {
          allowed_file_types: string[]
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_predefined?: boolean
          max_file_size_bytes?: number
          name: string
          template_file_name?: string | null
          template_file_path?: string | null
          updated_at?: string
        }
        Update: {
          allowed_file_types?: string[]
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_predefined?: boolean
          max_file_size_bytes?: number
          name?: string
          template_file_name?: string | null
          template_file_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirement_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          batch_requirement_id: string
          created_at: string
          enrollment_id: string | null
          file_name: string
          file_path: string
          file_size: string
          file_type: string
          id: string
          submitted_at: string | null
        }
        Insert: {
          batch_requirement_id: string
          created_at?: string
          enrollment_id?: string | null
          file_name: string
          file_path: string
          file_size: string
          file_type: string
          id?: string
          submitted_at?: string | null
        }
        Update: {
          batch_requirement_id?: string
          created_at?: string
          enrollment_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: string
          file_type?: string
          id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirements_batch_requirement_id_fkey"
            columns: ["batch_requirement_id"]
            isOneToOne: false
            referencedRelation: "batch_requirements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requirements_batch_requirement_id_fkey"
            columns: ["batch_requirement_id"]
            isOneToOne: false
            referencedRelation: "batch_requirements_compliance_summary"
            referencedColumns: ["batch_requirement_id"]
          },
          {
            foreignKeyName: "requirements_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "trainee_batch_enrollment"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements_history: {
        Row: {
          created_at: string
          date: string
          description: string
          document_id: string
          document_status: Database["public"]["Enums"]["document_status"]
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          date?: string
          description: string
          document_id: string
          document_status: Database["public"]["Enums"]["document_status"]
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          document_id?: string
          document_status?: Database["public"]["Enums"]["document_status"]
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "requirements_history_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      supervisors: {
        Row: {
          company_address: string | null
          company_contact_no: string | null
          company_name: string | null
          created_at: string
          department: string | null
          id: string
          nature_of_business: string | null
          position: string | null
          telephone_number: string | null
        }
        Insert: {
          company_address?: string | null
          company_contact_no?: string | null
          company_name?: string | null
          created_at?: string
          department?: string | null
          id: string
          nature_of_business?: string | null
          position?: string | null
          telephone_number?: string | null
        }
        Update: {
          company_address?: string | null
          company_contact_no?: string | null
          company_name?: string | null
          created_at?: string
          department?: string | null
          id?: string
          nature_of_business?: string | null
          position?: string | null
          telephone_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supervisors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trainee_batch_enrollment: {
        Row: {
          created_at: string
          id: string
          ojt_status: Database["public"]["Enums"]["ojt_status"]
          program_batch_id: string
          trainee_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ojt_status?: Database["public"]["Enums"]["ojt_status"]
          program_batch_id: string
          trainee_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ojt_status?: Database["public"]["Enums"]["ojt_status"]
          program_batch_id?: string
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainee_batch_enrollment_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "batch_requirements_compliance_summary"
            referencedColumns: ["program_batch_id"]
          },
          {
            foreignKeyName: "trainee_batch_enrollment_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "program_batch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainee_batch_enrollment_program_batch_id_fkey"
            columns: ["program_batch_id"]
            isOneToOne: false
            referencedRelation: "program_batch_overview_dashboard"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "trainee_batch_enrollment_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainee_overview_dashboard"
            referencedColumns: ["trainee_id"]
          },
          {
            foreignKeyName: "trainee_batch_enrollment_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      trainee_skills: {
        Row: {
          created_at: string
          id: string
          skill_id: string
          trainee_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          skill_id: string
          trainee_id: string
        }
        Update: {
          created_at?: string
          id?: string
          skill_id?: string
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainee_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainee_skills_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainee_overview_dashboard"
            referencedColumns: ["trainee_id"]
          },
          {
            foreignKeyName: "trainee_skills_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      trainees: {
        Row: {
          address: string | null
          course: string | null
          created_at: string
          id: string
          mobile_number: string | null
          section: string | null
          student_id_number: string
        }
        Insert: {
          address?: string | null
          course?: string | null
          created_at?: string
          id: string
          mobile_number?: string | null
          section?: string | null
          student_id_number: string
        }
        Update: {
          address?: string | null
          course?: string | null
          created_at?: string
          id?: string
          mobile_number?: string | null
          section?: string | null
          student_id_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainees_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          first_name: string
          id: string
          last_login: string | null
          last_name: string
          middle_name: string | null
          role: Database["public"]["Enums"]["role"]
          status: Database["public"]["Enums"]["user_status"]
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          first_name?: string
          id?: string
          last_login?: string | null
          last_name?: string
          middle_name?: string | null
          role: Database["public"]["Enums"]["role"]
          status?: Database["public"]["Enums"]["user_status"]
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          first_name?: string
          id?: string
          last_login?: string | null
          last_name?: string
          middle_name?: string | null
          role?: Database["public"]["Enums"]["role"]
          status?: Database["public"]["Enums"]["user_status"]
        }
        Relationships: []
      }
      weekly_report_entries: {
        Row: {
          additional_notes: string | null
          created_at: string
          daily_accomplishments: string | null
          entry_date: string
          feedback: string | null
          id: string
          is_confirmed: boolean
          report_id: string
          status: Database["public"]["Enums"]["entry_status"] | null
          time_in: string | null
          time_out: string | null
          total_hours: number
        }
        Insert: {
          additional_notes?: string | null
          created_at?: string
          daily_accomplishments?: string | null
          entry_date: string
          feedback?: string | null
          id?: string
          is_confirmed?: boolean
          report_id: string
          status?: Database["public"]["Enums"]["entry_status"] | null
          time_in?: string | null
          time_out?: string | null
          total_hours?: number
        }
        Update: {
          additional_notes?: string | null
          created_at?: string
          daily_accomplishments?: string | null
          entry_date?: string
          feedback?: string | null
          id?: string
          is_confirmed?: boolean
          report_id?: string
          status?: Database["public"]["Enums"]["entry_status"] | null
          time_in?: string | null
          time_out?: string | null
          total_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_report_entries_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "weekly_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_report_entry_files: {
        Row: {
          created_at: string
          entry_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          uploaded_at: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          uploaded_at?: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_report_entry_files_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "weekly_report_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reports: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          internship_id: string
          period_total: number
          start_date: string
          status: Database["public"]["Enums"]["document_status"]
          submitted_at: string | null
          supervisor_approved_at: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          internship_id: string
          period_total?: number
          start_date: string
          status?: Database["public"]["Enums"]["document_status"]
          submitted_at?: string | null
          supervisor_approved_at?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          internship_id?: string
          period_total?: number
          start_date?: string
          status?: Database["public"]["Enums"]["document_status"]
          submitted_at?: string | null
          supervisor_approved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly-reports_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "internship_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly-reports_internship_id_fkey"
            columns: ["internship_id"]
            isOneToOne: false
            referencedRelation: "trainee_overview_dashboard"
            referencedColumns: ["internship_id"]
          },
        ]
      }
    }
    Views: {
      admin_overview_dashboard: {
        Row: {
          recent_activities: Json | null
          total_admins: number | null
          total_coordinators: number | null
          total_industry_partners: number | null
          total_supervisors: number | null
          total_trainees: number | null
        }
        Relationships: []
      }
      batch_requirements_compliance_summary: {
        Row: {
          allowed_file_types: string[] | null
          approved: number | null
          approved_count: number | null
          batch_requirement_id: string | null
          batch_title: string | null
          compliance_percentage: number | null
          coordinator_id: string | null
          is_mandatory: boolean | null
          is_predefined: boolean | null
          max_file_size_bytes: number | null
          not_submitted: number | null
          pending_count: number | null
          pending_review: number | null
          program_batch_id: string | null
          rejected: number | null
          requirement_description: string | null
          requirement_name: string | null
          requirement_type_id: string | null
          submitted: number | null
          submitted_count: number | null
          template_file_name: string | null
          template_file_path: string | null
          total_trainees: number | null
        }
        Relationships: [
          {
            foreignKeyName: "program_batch_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "coordinator_overview_dashboard"
            referencedColumns: ["coordinator_id"]
          },
          {
            foreignKeyName: "program_batch_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "coordinators"
            referencedColumns: ["id"]
          },
        ]
      }
      coordinator_overview_dashboard: {
        Row: {
          coordinator_email: string | null
          coordinator_id: string | null
          coordinator_name: string | null
          dashboard_stats: Json | null
          department: string | null
          managed_batches: Json | null
          recent_activities: Json | null
          section_progress: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "coordinators_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      program_batch_overview_dashboard: {
        Row: {
          active_trainees: number | null
          approved_internships: number | null
          approved_weekly_reports: number | null
          avg_attendance_rate: number | null
          avg_compliance_rate: number | null
          avg_hours_per_trainee: number | null
          batch_created_at: string | null
          batch_description: string | null
          batch_id: string | null
          batch_status: string | null
          batch_title: string | null
          completed_trainees: number | null
          completion_percentage: number | null
          coordinator_department: string | null
          coordinator_email: string | null
          coordinator_id: string | null
          coordinator_name: string | null
          days_remaining: number | null
          dropped_trainees: number | null
          duration_days: number | null
          end_date: string | null
          internship_code: Database["public"]["Enums"]["internship_code"] | null
          job_role_distribution: Json | null
          mandatory_requirements: number | null
          not_started_trainees: number | null
          not_submitted_internships: number | null
          optional_requirements: number | null
          pending_internships: number | null
          pending_weekly_reports: number | null
          progress_percentage: number | null
          recent_activities: Json | null
          rejected_internships: number | null
          rejected_weekly_reports: number | null
          required_hours: number | null
          start_date: string | null
          top_companies: Json | null
          total_companies: number | null
          total_enrolled_trainees: number | null
          total_hours_logged: number | null
          total_internships: number | null
          total_requirements: number | null
          total_weekly_reports: number | null
          weekly_report_statistics: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "program_batch_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "coordinator_overview_dashboard"
            referencedColumns: ["coordinator_id"]
          },
          {
            foreignKeyName: "program_batch_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "coordinators"
            referencedColumns: ["id"]
          },
        ]
      }
      supervisor_overview_dashboard: {
        Row: {
          company_name: string | null
          completed_trainees: number | null
          currently_active_trainees: number | null
          department: string | null
          pending_evaluations: number | null
          pending_weekly_reports: number | null
          position: string | null
          recent_activities: Json | null
          supervisor_email: string | null
          supervisor_id: string | null
          supervisor_name: string | null
          total_active_trainees: number | null
          trainees_pending_evaluation: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "supervisors_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trainee_overview_dashboard: {
        Row: {
          announcements: Json | null
          approved_weekly_reports: number | null
          attendance_rate_percentage: number | null
          avg_hours_per_day: number | null
          days_present_week: number | null
          internship_id: string | null
          ojt_status: Database["public"]["Enums"]["ojt_status"] | null
          pending_weekly_reports: number | null
          recent_activities: Json | null
          recent_attendance: Json | null
          recent_reports: Json | null
          rejected_weekly_reports: number | null
          required_hours: number | null
          total_hours_logged: number | null
          total_submitted_reports: number | null
          total_weekly_reports: number | null
          trainee_id: string | null
          weekly_attendance_chart: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "trainees_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_statistics: {
        Row: {
          active_status_users: number | null
          active_user_percentage: number | null
          active_users_30_days: number | null
          active_users_growth_percent: number | null
          inactive_status_users: number | null
          new_users_growth_percent: number | null
          new_users_last_week: number | null
          new_users_this_month: number | null
          new_users_this_week: number | null
          pending_percentage: number | null
          pending_status_users: number | null
          pending_verifications: number | null
          recently_active_7_days: number | null
          suspended_users: number | null
          total_admins: number | null
          total_coordinators: number | null
          total_supervisors: number | null
          total_trainees: number | null
          total_users: number | null
          weekly_growth_percent: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
      log_activity: {
        Args: {
          p_activity_description?: string
          p_activity_title: string
          p_activity_type: Database["public"]["Enums"]["activity_type_enum"]
          p_metadata?: Json
          p_program_batch_id?: string
          p_reference_id?: string
          p_reference_type?: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      activity_type_enum:
        | "accomplishment_report_created"
        | "accomplishment_report_submitted"
        | "accomplishment_report_approved"
        | "accomplishment_report_rejected"
        | "accomplishment_report_deleted"
        | "accomplishment_report_updated"
        | "attendance_report_created"
        | "attendance_report_submitted"
        | "attendance_report_approved"
        | "attendance_report_rejected"
        | "attendance_report_deleted"
        | "attendance_report_updated"
        | "attendance_entry_added"
        | "attendance_entry_updated"
        | "attendance_entry_deleted"
        | "accomplishment_entry_added"
        | "accomplishment_entry_updated"
        | "accomplishment_entry_deleted"
        | "requirement_submitted"
        | "requirement_approved"
        | "requirement_rejected"
        | "requirement_deleted"
        | "internship_started"
        | "internship_created"
        | "internship_completed"
        | "internship_submitted"
        | "internship_updated"
        | "internship_deleted"
        | "internship_rejected"
        | "user_registered"
        | "user_status_changed"
        | "user_profile_updated"
        | "user_login"
        | "batch_enrolled"
        | "batch_announcement_posted"
        | "batch_requirement_added"
        | "evaluation_submitted"
        | "evaluation_pending"
        | "evaluation_approved"
        | "notification_sent"
        | "notification_read"
        | "system_backup"
        | "system_maintenance"
        | "data_export"
        | "data_import"
        | "batch_created"
        | "batch_deleted"
        | "batch_archived"
        | "batch_updated"
        | "user_deleted"
        | "weekly_report_created"
        | "weekly_report_submitted"
        | "weekly_report_approved"
        | "weekly_report_rejected"
        | "weekly_report_deleted"
        | "weekly_report_updated"
      document_status:
        | "approved"
        | "rejected"
        | "pending"
        | "not submitted"
        | "revision requested"
        | "archived"
      entry_status: "present" | "absent" | "late" | "holiday" | "weekend"
      internship_code: "CTNTERN1" | "CTNTERN2"
      notification_type:
        | "document status change"
        | "document submission"
        | "report status change"
        | "report submission"
        | "program announcement"
        | "system update"
      ojt_status: "not started" | "active" | "completed" | "dropped"
      role: "trainee" | "coordinator" | "supervisor" | "admin"
      user_status: "active" | "inactive" | "suspended" | "pending"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      activity_type_enum: [
        "accomplishment_report_created",
        "accomplishment_report_submitted",
        "accomplishment_report_approved",
        "accomplishment_report_rejected",
        "accomplishment_report_deleted",
        "accomplishment_report_updated",
        "attendance_report_created",
        "attendance_report_submitted",
        "attendance_report_approved",
        "attendance_report_rejected",
        "attendance_report_deleted",
        "attendance_report_updated",
        "attendance_entry_added",
        "attendance_entry_updated",
        "attendance_entry_deleted",
        "accomplishment_entry_added",
        "accomplishment_entry_updated",
        "accomplishment_entry_deleted",
        "requirement_submitted",
        "requirement_approved",
        "requirement_rejected",
        "requirement_deleted",
        "internship_started",
        "internship_created",
        "internship_completed",
        "internship_submitted",
        "internship_updated",
        "internship_deleted",
        "internship_rejected",
        "user_registered",
        "user_status_changed",
        "user_profile_updated",
        "user_login",
        "batch_enrolled",
        "batch_announcement_posted",
        "batch_requirement_added",
        "evaluation_submitted",
        "evaluation_pending",
        "evaluation_approved",
        "notification_sent",
        "notification_read",
        "system_backup",
        "system_maintenance",
        "data_export",
        "data_import",
        "batch_created",
        "batch_deleted",
        "batch_archived",
        "batch_updated",
        "user_deleted",
        "weekly_report_created",
        "weekly_report_submitted",
        "weekly_report_approved",
        "weekly_report_rejected",
        "weekly_report_deleted",
        "weekly_report_updated",
      ],
      document_status: [
        "approved",
        "rejected",
        "pending",
        "not submitted",
        "revision requested",
        "archived",
      ],
      entry_status: ["present", "absent", "late", "holiday", "weekend"],
      internship_code: ["CTNTERN1", "CTNTERN2"],
      notification_type: [
        "document status change",
        "document submission",
        "report status change",
        "report submission",
        "program announcement",
        "system update",
      ],
      ojt_status: ["not started", "active", "completed", "dropped"],
      role: ["trainee", "coordinator", "supervisor", "admin"],
      user_status: ["active", "inactive", "suspended", "pending"],
    },
  },
} as const
