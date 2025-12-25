
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
      feedback_submissions: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone: string | null
          subject: string
          content: string
          status: string
          created_at?: string
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          phone?: string | null
          subject: string
          content: string
          status?: string
          created_at?: string
        }
        Update: { [key: string]: any }
      }
      user_groups: {
        Row: {
          id: string
          name_tr: string
          name_en: string
          name_ro: string
          color: string
          icon: string
          permissions: string[]
          created_at?: string
        }
        Insert: {
          id?: string
          name_tr: string
          name_en: string
          name_ro: string
          color: string
          icon: string
          permissions: string[]
        }
        Update: { [key: string]: any }
      }
      utility_categories: {
        Row: {
          id: string
          name_tr: string
          name_en: string | null
          name_ro: string | null
          color: string
          created_at?: string
        }
        Insert: {
          id?: string
          name_tr: string
          name_en?: string | null
          name_ro?: string | null
          color?: string
        }
        Update: { [key: string]: any }
      }
      utility_layers: {
        Row: {
          id: string
          name: string
          category_id: string
          type: string
          data: Json | null
          color: string | null
          opacity: number
          is_visible: boolean
          file_url: string | null
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          category_id: string
          type?: string
          data?: Json | null
          color?: string | null
          opacity?: number
          is_visible?: boolean
          file_url?: string | null
        }
        Update: { [key: string]: any }
      }
      design_layers: {
        Row: {
          id: string
          name: string
          type: string
          data: Json | null
          color: string | null
          opacity: number
          is_visible: boolean
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          type?: string
          data?: Json | null
          color?: string | null
          opacity?: number
          is_visible?: boolean
        }
        Update: { [key: string]: any }
      }
      material_stocks: {
        Row: {
          id: string
          name_tr: string
          name_en: string
          name_ro: string
          current_qty: number
          critical_lvl: number
          unit: string
          icon: string
          created_at?: string
        }
        Insert: {
          id?: string
          name_tr: string
          name_en: string
          name_ro: string
          current_qty: number
          critical_lvl: number
          unit: string
          icon?: string
        }
        Update: { [key: string]: any }
      }
      contract_boq: {
        Row: {
          id: string
          code: string
          name_tr: string
          name_en: string
          name_ro: string
          total_qty: number
          completed_qty: number
          unit: string
          created_at?: string
        }
        Insert: {
          id?: string
          code: string
          name_tr: string
          name_en: string
          name_ro: string
          total_qty: number
          completed_qty?: number
          unit: string
        }
        Update: { [key: string]: any }
      }
      project_shortcuts: {
        Row: {
          id: string
          name_tr: string
          name_en: string
          name_ro: string
          desc_tr: string
          desc_en: string
          desc_ro: string
          type: 'PDF' | 'DWG'
          source_type: 'FILE' | 'LINK'
          path_url: string
          revision_date: string
          created_at?: string
        }
        Insert: {
          id?: string
          name_tr: string
          name_en: string
          name_ro: string
          desc_tr: string
          desc_en: string
          desc_ro: string
          type: 'PDF' | 'DWG'
          source_type: 'FILE' | 'LINK'
          path_url: string
          revision_date: string
        }
        Update: { [key: string]: any }
      }
      project_slides: {
        Row: {
          id: string
          image_url: string
          title_tr: string
          title_en: string
          title_ro: string
          subtitle_tr: string
          subtitle_en: string
          subtitle_ro: string
          tag: string
          order_index: number
          created_at?: string
        }
        Insert: {
          id?: string
          image_url: string
          title_tr: string
          title_en: string
          title_ro: string
          subtitle_tr: string
          subtitle_en: string
          subtitle_ro: string
          tag: string
          order_index?: number
        }
        Update: { [key: string]: any }
      }
      project_timeline: {
        Row: {
          id: number
          label_tr: string
          label_en: string
          label_ro: string
          status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING'
          percentage: number
          start_date: string
          end_date: string
          start_km: number
          end_km: number
          created_at?: string
        }
        Insert: {
          id?: number
          label_tr: string
          label_en: string
          label_ro: string
          status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING'
          percentage: number
          start_date: string
          end_date: string
          start_km: number
          end_km: number
        }
        Update: { [key: string]: any }
      }
      pvla_matrix_columns: {
        Row: {
          id: string
          type: 'Bridge' | 'Culvert'
          name_tr: string
          name_en: string
          name_ro: string
          group_tr: string
          group_en: string
          group_ro: string
          col_type: 'TRASARE' | 'VERIFICARE' | 'INFO'
          order_index: number
          created_at?: string
        }
        Insert: {
          id?: string
          type: 'Bridge' | 'Culvert'
          name_tr: string
          name_en: string
          name_ro: string
          group_tr: string
          group_en: string
          group_ro: string
          col_type: 'TRASARE' | 'VERIFICARE' | 'INFO'
          order_index?: number
        }
        Update: { [key: string]: any }
      }
      pvla_indices: {
        Row: {
          id: string
          type: 'Bridge' | 'Culvert'
          title_tr: string
          title_en: string
          title_ro: string
          desc_tr: string
          desc_en: string
          desc_ro: string
          file_url: string | null
          last_updated: string | null
          updated_at?: string
        }
        Insert: {
          id?: string
          type: 'Bridge' | 'Culvert'
          title_tr: string
          title_en: string
          title_ro: string
          desc_tr: string
          desc_en: string
          desc_ro: string
          file_url?: string | null
          last_updated?: string | null
        }
        Update: { [key: string]: any }
      }
      map_notes: {
        Row: {
          id: string
          lat: number
          lng: number
          text: string
          author: string | null
          date: string
          color: string | null
          privacy: 'public' | 'private' | 'admin'
          created_at?: string
        }
        Insert: {
          id?: string
          lat: number
          lng: number
          text: string
          author?: string | null
          date?: string
          color?: string | null
          privacy?: 'public' | 'private' | 'admin'
        }
        Update: { [key: string]: any }
      }
      site_photos: {
        Row: {
          id: string
          url: string
          description_tr: string | null
          description_en: string | null
          description_ro: string | null
          lat: number
          lng: number
          date: string
          uploaded_by: string | null
          created_at?: string
        }
        Insert: {
          id?: string
          url: string
          description_tr?: string | null
          description_en?: string | null
          description_ro?: string | null
          lat: number
          lng: number
          date?: string
          uploaded_by?: string | null
        }
        Update: { [key: string]: any }
      }
      alignments_master: {
        Row: {
          id: string
          name: string
          description: string | null
          file_path: string | null
          is_active: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          file_path?: string | null
          is_active?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: { [key: string]: any }
      }
      alignment_points: {
        Row: {
          id: string
          alignment_id: string
          km: number
          x: number
          y: number
          z_red_kot: number | null
          z_black_kot: number | null
          superelevation: number | null
          bearing: number | null
        }
        Insert: {
          id?: string
          alignment_id: string
          km: number
          x: number
          y: number
          z_red_kot?: number | null
          z_black_kot?: number | null
          superelevation?: number | null
          bearing?: number | null
        }
        Update: { [key: string]: any }
      }
      structure_layers: {
        Row: {
          id: string
          name_tr: string
          name_en: string
          name_ro: string
          order_index: number
          created_at?: string
        }
        Insert: {
          id?: string
          name_tr: string
          name_en: string
          name_ro: string
          order_index?: number
        }
        Update: { [key: string]: any }
      }
      structure_surfaces: {
        Row: {
          id: string
          structure_id: string
          layer_id: string
          file_url: string | null
          geojson: Json | null
          created_at?: string
        }
        Insert: {
          id?: string
          structure_id: string
          layer_id: string
          file_url?: string | null
          geojson?: Json | null
        }
        Update: { [key: string]: any }
      }
      site_issues: {
        Row: {
          id: string
          type: 'NCR' | 'SNAG' | 'SAFETY'
          status: 'OPEN' | 'CLOSED'
          lat: number
          lng: number
          description: string | null
          photo_url: string | null
          reported_date: string
          author: string | null
          created_at?: string
        }
        Insert: {
          id?: string
          type: 'NCR' | 'SNAG' | 'SAFETY'
          status: 'OPEN' | 'CLOSED'
          lat: number
          lng: number
          description?: string | null
          photo_url?: string | null
          reported_date?: string
          author?: string | null
          created_at?: string
        }
        Update: { [key: string]: any }
      }
      system_notifications: {
        Row: {
          id: string
          message_tr: string | null
          message_en: string | null
          message_ro: string | null
          author: string | null
          type: 'update' | 'alert' | 'info' | null
          date: string
          created_at?: string
        }
        Insert: {
          id?: string
          message_tr?: string | null
          message_en?: string | null
          message_ro?: string | null
          author?: string | null
          type?: 'update' | 'alert' | 'info' | null
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          message_tr?: string | null
          message_en?: string | null
          message_ro?: string | null
          author?: string | null
          type?: 'update' | 'alert' | 'info' | null
          date?: string
          created_at?: string
        }
      }
      pvla_structures: {
        Row: {
          id: string
          name: string
          km: string
          type: 'Bridge' | 'Culvert'
          path: string | null
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          km: string
          type: 'Bridge' | 'Culvert'
          path?: string | null
        }
        Update: { [key: string]: any }
      }
      pvla_files: {
        Row: {
          id: string
          name: string
          type: 'Bridge' | 'Culvert'
          structure_id: string
          structure_name: string | null
          date: string
          size: string
          path: string
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          type: 'Bridge' | 'Culvert'
          structure_id: string
          structure_name?: string | null
          date: string
          size: string
          path: string
        }
        Update: { [key: string]: any }
      }
      progress_matrix: {
        Row: {
          id: string
          structure_id: string
          location: string
          foundation_type: string | null
          order_index: number
          cells: Json
          created_at?: string
          structure_group_id: string
        }
        Insert: {
          id?: string
          structure_id: string
          location: string
          foundation_type?: string | null
          order_index?: number
          cells: Json
          structure_group_id: string
        }
        Update: { [key: string]: any }
      }
      drone_flights: {
        Row: {
          id: string
          title_tr: string | null
          title_en: string | null
          title_ro: string | null
          date: string
          youtube_id: string
          location: string | null
          thumbnail_url: string | null
          created_at?: string
        }
        Insert: {
          id?: string
          title_tr?: string | null
          title_en?: string | null
          title_ro?: string | null
          date: string
          youtube_id: string
          location?: string | null
          thumbnail_url?: string | null
        }
        Update: { [key: string]: any }
      }
      machinery: {
        Row: {
          id: string
          name_tr: string
          name_en: string
          name_ro: string
          total: number
          active: number
          maintenance: number
          icon: string
          created_at?: string
        }
        Insert: {
          id?: string
          name_tr: string
          name_en: string
          name_ro: string
          total: number
          active: number
          maintenance: number
          icon?: string
        }
        Update: { [key: string]: any }
      }
      app_config: {
        Row: {
          key: string
          value: Json
          updated_at?: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
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
          group_id: string | null
          created_at?: string
        }
        Insert: {
          id?: string
          username: string
          full_name: string
          role?: 'admin' | 'editor' | 'viewer'
          permissions?: string[]
          group_id?: string | null
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
      app_translations: {
        Row: {
          id: string
          key: string
          lang: 'tr' | 'en' | 'ro'
          value: string
          module: string
          updated_at?: string
        }
        Insert: {
          key: string
          lang: 'tr' | 'en' | 'ro'
          value: string
          module?: string
        }
        Update: {
          value?: string
          updated_at?: string
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
          changes: string[] 
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
          created_at?: string
        }
        Insert: {
          id?: string
          name_tr: string
          name_en: string
          name_ro: string
          desc_tr: string
          desc_en: string
          desc_ro: string
          link?: string | null
        }
        Update: { [key: string]: any }
      }
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
          is_split: boolean
          created_at?: string
        }
        Insert: {
          id?: string
          type_id: string
          code: string
          name: string
          km_start?: number
          km_end?: number
          is_split?: boolean
        }
        Update: { [key: string]: any }
      }
      structure_groups: {
        Row: {
          id: string
          structure_id: string
          name: string
          group_type: string
          direction: 'L' | 'R' | 'C'
          order_index: number
        }
        Insert: {
          id?: string
          structure_id: string
          name: string
          group_type?: string
          direction?: 'L' | 'R' | 'C'
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
          shape: 'CYLINDER' | 'BOX' | 'PRISM' | 'POLYGON'
          coords_x: number
          coords_y: number
          coords_z: number
          dim_1: number
          dim_2: number
          dim_3: number
          rot_x: number
          rot_y: number
          rot_z: number
          polygon_points: Json | null
          slope: number | null
        }
        Insert: {
          id?: string
          element_id: string
          shape: 'CYLINDER' | 'BOX' | 'PRISM' | 'POLYGON'
          coords_x: number
          coords_y: number
          coords_z: number
          dim_1?: number
          dim_2?: number
          dim_3?: number
          rot_x?: number
          rot_y?: number
          rot_z?: number
          polygon_points?: Json | null
          slope?: number | null
        }
        Update: { [key: string]: any }
      }
    }
  }
}
