
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string
          username: string
          full_name: string
          role: 'admin' | 'editor' | 'viewer'
          permissions: string[]
          job_title: string | null
          email: string | null
          phone: string | null
          address: string | null
          avatar_url: string | null
          created_at?: string
        }
        Insert: {
          id?: string
          username: string
          full_name: string
          role?: 'admin' | 'editor' | 'viewer'
          permissions?: string[]
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      app_menu: {
        Row: {
          id: string
          label_tr: string
          label_en: string
          label_ro: string
          icon: string
          visible: boolean
          parent_id: string | null
          order_index: number
          created_at?: string
        }
        Insert: {
          id: string
          label_tr: string
          label_en: string
          label_ro: string
          icon: string
          visible?: boolean
          parent_id?: string | null
          order_index: number
        }
        Update: {
          [key: string]: any
        }
      }
      changelogs: {
        Row: {
          id: string
          version: string
          release_date: string
          type: 'major' | 'minor' | 'patch'
          title_tr: string
          title_en: string
          title_ro: string
          changes: string[] // JSONB array
          created_at?: string
        }
        Insert: {
          id?: string
          version: string
          release_date: string
          type: 'major' | 'minor' | 'patch'
          title_tr: string
          title_en: string
          title_ro: string
          changes: string[]
        }
        Update: {
          [key: string]: any
        }
      }
      survey_points: {
        Row: {
          id: string
          polygon_no: string
          road_name: string | null
          km: string | null
          offset_val: string | null
          east: string
          north: string
          elevation: string
          lat: string | null
          lng: string | null
          description: string | null
          status: 'ACTIVE' | 'LOST' | 'DAMAGED'
        }
        Insert: {
          id?: string
          polygon_no: string
          east: string
          north: string
          elevation: string
          [key: string]: any
        }
        Update: {
          [key: string]: any
        }
      }
      infra_projects: {
        Row: {
          id: string
          name_tr: string
          name_en: string
          name_ro: string
          desc_tr: string
          desc_en: string
          desc_ro: string
          link: string | null
        }
      }
      // --- 3D MONITORING MODULE TABLES ---
      structure_types: {
        Row: {
          id: string
          code: string
          name_tr: string
          name_en: string
          name_ro: string
          icon: string
          created_at?: string
        }
        Insert: {
          id?: string
          code: string
          name_tr: string
          name_en: string
          name_ro: string
          icon?: string
        }
        Update: { [key: string]: any }
      }
      structures_main: {
        Row: {
          id: string
          type_id: string
          code: string
          name: string
          km_start: number | null
          km_end: number | null
          created_at?: string
        }
        Insert: {
          id?: string
          type_id: string
          code: string
          name: string
          km_start?: number
          km_end?: number
        }
        Update: { [key: string]: any }
      }
      structure_groups: {
        Row: {
          id: string
          structure_id: string
          name: string
          group_type: string
          order_index: number
        }
        Insert: {
          id?: string
          structure_id: string
          name: string
          group_type?: string
          order_index?: number
        }
        Update: { [key: string]: any }
      }
      structure_elements: {
        Row: {
          id: string
          group_id: string
          name: string
          element_class: string
        }
        Insert: {
          id?: string
          group_id: string
          name: string
          element_class?: string
        }
        Update: { [key: string]: any }
      }
      element_coordinates: {
        Row: {
          id: string
          element_id: string
          shape: 'CYLINDER' | 'BOX' | 'PRISM'
          coords_x: number
          coords_y: number
          coords_z: number
          dim_1: number // radius or width
          dim_2: number // height
          dim_3: number // length
          rot_x: number
          rot_y: number
          rot_z: number
        }
        Insert: {
          id?: string
          element_id: string
          shape: 'CYLINDER' | 'BOX' | 'PRISM'
          coords_x: number
          coords_y: number
          coords_z: number
          dim_1?: number
          dim_2?: number
          dim_3?: number
          rot_x?: number
          rot_y?: number
          rot_z?: number
        }
        Update: { [key: string]: any }
      }
    }
  }
}
