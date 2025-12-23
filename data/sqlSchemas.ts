
export const MIGRATION_BLOCK = `-- 0. SCHEMA FIXES & TYPE REPAIR (Always Safe to Run)
DO $$
BEGIN
    -- Permissions fix
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'app_users' AND column_name = 'permissions' AND data_type = 'jsonb') THEN
        ALTER TABLE app_users ALTER COLUMN permissions TYPE text[] USING TRANSLATE(permissions::text, '[]', '{}')::text[];
    END IF;
    
    -- Default ID fixes
    ALTER TABLE IF EXISTS machinery ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE IF EXISTS material_stocks ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE IF EXISTS contract_boq ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE IF EXISTS site_issues ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE IF EXISTS drone_flights ALTER COLUMN id SET DEFAULT gen_random_uuid();
END $$;
`;

export const TABLE_SCHEMAS: Record<string, string> = {
    'app_config': `CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'app_users': `CREATE TABLE IF NOT EXISTS app_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  permissions TEXT[],
  group_id UUID,
  job_title TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;`,
    'user_groups': `CREATE TABLE IF NOT EXISTS user_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT,
  name_ro TEXT,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'group',
  permissions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;`,
    'app_menu': `CREATE TABLE IF NOT EXISTS app_menu (
  id TEXT PRIMARY KEY,
  label_tr TEXT NOT NULL,
  label_en TEXT,
  label_ro TEXT,
  icon TEXT,
  visible BOOLEAN DEFAULT TRUE,
  parent_id TEXT REFERENCES app_menu(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'app_translations': `CREATE TABLE IF NOT EXISTS app_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  lang TEXT NOT NULL,
  value TEXT NOT NULL,
  module TEXT DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key, lang)
);
ALTER TABLE app_translations ENABLE ROW LEVEL SECURITY;`,
    'material_stocks': `CREATE TABLE IF NOT EXISTS material_stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT,
  name_ro TEXT,
  current_qty NUMERIC DEFAULT 0,
  critical_lvl NUMERIC DEFAULT 0,
  unit TEXT DEFAULT 'Unit',
  icon TEXT DEFAULT 'inventory_2',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE material_stocks ENABLE ROW LEVEL SECURITY;`,
    'contract_boq': `CREATE TABLE IF NOT EXISTS contract_boq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT,
  name_ro TEXT,
  total_qty NUMERIC DEFAULT 0,
  completed_qty NUMERIC DEFAULT 0,
  unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contract_boq ENABLE ROW LEVEL SECURITY;`,
    'machinery': `CREATE TABLE IF NOT EXISTS machinery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT,
  name_ro TEXT,
  total INTEGER DEFAULT 0,
  active INTEGER DEFAULT 0,
  maintenance INTEGER DEFAULT 0,
  icon TEXT DEFAULT 'agriculture',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'project_shortcuts': `CREATE TABLE IF NOT EXISTS project_shortcuts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_tr TEXT, name_en TEXT, name_ro TEXT,
  desc_tr TEXT, desc_en TEXT, desc_ro TEXT,
  type TEXT, source_type TEXT,
  path_url TEXT, revision_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE project_shortcuts ENABLE ROW LEVEL SECURITY;`,
    'project_slides': `CREATE TABLE IF NOT EXISTS project_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  title_tr TEXT, title_en TEXT, title_ro TEXT,
  subtitle_tr TEXT, subtitle_en TEXT, subtitle_ro TEXT,
  tag TEXT, order_index NUMERIC DEFAULT 99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE project_slides ENABLE ROW LEVEL SECURITY;`,
    'project_timeline': `CREATE TABLE IF NOT EXISTS project_timeline (
  id SERIAL PRIMARY KEY,
  label_tr TEXT, label_en TEXT, label_ro TEXT,
  status TEXT DEFAULT 'PENDING',
  percentage NUMERIC DEFAULT 0,
  start_date TEXT, end_date TEXT,
  start_km NUMERIC, end_km NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;`,
    'utility_categories': `CREATE TABLE IF NOT EXISTS utility_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_tr TEXT NOT NULL,
  name_en TEXT,
  name_ro TEXT,
  color TEXT DEFAULT '#3388ff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'utility_layers': `CREATE TABLE IF NOT EXISTS utility_layers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES utility_categories(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'GEOJSON', 
  data JSONB, 
  color TEXT,
  opacity NUMERIC DEFAULT 0.8,
  is_visible BOOLEAN DEFAULT TRUE,
  file_url TEXT, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'design_layers': `CREATE TABLE IF NOT EXISTS design_layers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'GEOJSON', 
  data JSONB, 
  color TEXT DEFAULT '#f59e0b',
  opacity NUMERIC DEFAULT 1.0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'site_issues': `CREATE TABLE IF NOT EXISTS site_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN',
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  description TEXT,
  photo_url TEXT,
  reported_date TEXT,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'survey_points': `CREATE TABLE IF NOT EXISTS survey_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  polygon_no TEXT NOT NULL,
  road_name TEXT,
  km TEXT,
  offset_val TEXT,
  east TEXT NOT NULL,
  north TEXT NOT NULL,
  elevation TEXT NOT NULL,
  lat TEXT,
  lng TEXT,
  description TEXT,
  status TEXT DEFAULT 'ACTIVE'
);
ALTER TABLE survey_points ENABLE ROW LEVEL SECURITY;`,
    'pvla_structures': `CREATE TABLE IF NOT EXISTS pvla_structures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  km TEXT,
  type TEXT,
  path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'pvla_files': `CREATE TABLE IF NOT EXISTS pvla_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  structure_id UUID REFERENCES pvla_structures(id) ON DELETE CASCADE,
  structure_name TEXT,
  date TEXT,
  size TEXT,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'progress_matrix': `CREATE TABLE IF NOT EXISTS progress_matrix (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID REFERENCES pvla_structures(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  foundation_type TEXT,
  order_index INTEGER DEFAULT 0,
  cells JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE progress_matrix ENABLE ROW LEVEL SECURITY;`,
    'pvla_matrix_columns': `CREATE TABLE IF NOT EXISTS pvla_matrix_columns (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT,
  name_ro TEXT,
  group_tr TEXT,
  group_en TEXT,
  group_ro TEXT,
  col_type TEXT,
  order_index INTEGER DEFAULT 0
);`,
    'pvla_indices': `CREATE TABLE IF NOT EXISTS pvla_indices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT UNIQUE NOT NULL,
  title_tr TEXT, title_en TEXT, title_ro TEXT,
  desc_tr TEXT, desc_en TEXT, desc_ro TEXT,
  file_url TEXT,
  last_updated TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'infra_projects': `CREATE TABLE IF NOT EXISTS infra_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_tr TEXT, name_en TEXT, name_ro TEXT,
  desc_tr TEXT, desc_en TEXT, desc_ro TEXT,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE infra_projects ENABLE ROW LEVEL SECURITY;`,
    'drone_flights': `CREATE TABLE IF NOT EXISTS drone_flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_tr TEXT, title_en TEXT, title_ro TEXT,
  date TEXT,
  youtube_id TEXT,
  location TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE drone_flights ENABLE ROW LEVEL SECURITY;`,
    'system_notifications': `CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_tr TEXT, message_en TEXT, message_ro TEXT,
  author TEXT,
  type TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;`,
    'changelogs': `CREATE TABLE IF NOT EXISTS changelogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT,
  release_date TEXT,
  type TEXT,
  title_tr TEXT, title_en TEXT, title_ro TEXT,
  changes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE changelogs ENABLE ROW LEVEL SECURITY;`,
    'map_notes': `CREATE TABLE IF NOT EXISTS map_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lat NUMERIC, lng NUMERIC,
  text TEXT,
  author TEXT,
  date TEXT,
  color TEXT,
  privacy TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE map_notes ENABLE ROW LEVEL SECURITY;`,
    'site_photos': `CREATE TABLE IF NOT EXISTS site_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT,
  description_tr TEXT, description_en TEXT, description_ro TEXT,
  lat NUMERIC, lng NUMERIC,
  date TEXT,
  uploaded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_photos ENABLE ROW LEVEL SECURITY;`,
    'alignments_master': `CREATE TABLE IF NOT EXISTS alignments_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'alignment_points': `CREATE TABLE IF NOT EXISTS alignment_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alignment_id UUID REFERENCES alignments_master(id) ON DELETE CASCADE,
  km NUMERIC NOT NULL,
  x NUMERIC NOT NULL,
  y NUMERIC NOT NULL,
  z_red_kot NUMERIC,
  z_black_kot NUMERIC,
  superelevation NUMERIC,
  bearing NUMERIC
);
CREATE INDEX IF NOT EXISTS idx_alignment_points_km ON alignment_points(km);`,
    'structure_types': `CREATE TABLE IF NOT EXISTS structure_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name_tr TEXT NOT NULL,
  name_en TEXT,
  name_ro TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'structures_main': `CREATE TABLE IF NOT EXISTS structures_main (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type_id UUID REFERENCES structure_types(id) ON DELETE SET NULL,
  code TEXT,
  name TEXT NOT NULL,
  km_start NUMERIC,
  km_end NUMERIC,
  is_split BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'structure_groups': `CREATE TABLE IF NOT EXISTS structure_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID REFERENCES structures_main(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_type TEXT,
  direction TEXT,
  order_index INTEGER DEFAULT 0
);`,
    'structure_elements': `CREATE TABLE IF NOT EXISTS structure_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES structure_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  element_class TEXT
);`,
    'element_coordinates': `CREATE TABLE IF NOT EXISTS element_coordinates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  element_id UUID REFERENCES structure_elements(id) ON DELETE CASCADE,
  shape TEXT,
  coords_x NUMERIC, coords_y NUMERIC, coords_z NUMERIC,
  dim_1 NUMERIC, dim_2 NUMERIC, dim_3 NUMERIC,
  rot_x NUMERIC, rot_y NUMERIC, rot_z NUMERIC,
  polygon_points JSONB,
  slope NUMERIC
);`,
    'structure_layers': `CREATE TABLE IF NOT EXISTS structure_layers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_tr TEXT, name_en TEXT, name_ro TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'structure_surfaces': `CREATE TABLE IF NOT EXISTS structure_surfaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID REFERENCES structures_main(id) ON DELETE CASCADE,
  layer_id UUID REFERENCES structure_layers(id) ON DELETE CASCADE,
  file_url TEXT,
  geojson JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`
};

export const SEED_DATA_SCHEMAS: Record<string, string> = {
    'app_users': `INSERT INTO app_users (id, username, password, full_name, job_title, email, phone, address, role, permissions)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', '123', 'Sistem Yöneticisi', 'Senior Administrator', 'admin@makyol.com', '+40 700 000 000', 'Main Camp, Avrig', 'admin', ARRAY['manage_users', 'manage_daily_log', 'manage_stats', 'manage_machinery', 'manage_timeline', 'manage_notifications', 'manage_files', 'manage_map', 'manage_drone', 'manage_settings', 'manage_quality', 'manage_materials'])
ON CONFLICT (id) DO NOTHING;`,
    'material_stocks': `INSERT INTO material_stocks (id, name_tr, name_en, name_ro, current_qty, critical_lvl, unit, icon) VALUES
('00000000-0000-0000-0000-000000000010', 'Çimento', 'Cement', 'Ciment', 150, 200, 'Ton', 'architecture'),
('00000000-0000-0000-0000-000000000011', 'İnşaat Demiri (Ø16)', 'Rebar (Ø16)', 'Armătură (Ø16)', 450, 100, 'Ton', 'grid_4x4')
ON CONFLICT (id) DO NOTHING;`,
    'project_slides': `INSERT INTO project_slides (id, image_url, title_tr, title_en, title_ro, subtitle_tr, subtitle_en, subtitle_ro, tag) VALUES
('00000000-0000-0000-0000-000000000040', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=2070', 'Sibiu - Făgăraș Otoyolu', 'Sibiu - Făgăraș Motorway', 'Autostrada Sibiu - Făgăraș', 'Lot 1 Proje Sahası', 'Lot 1 Project Site', 'Lot 1 Șantier', 'GENEL BAKIŞ')
ON CONFLICT (id) DO NOTHING;`,
    'app_config': `INSERT INTO app_config (key, value) VALUES
('dashboard_widgets', '{"hse": {"accidentFreeDays": 0, "manHours": 254000, "lastIncidentDate": "2025-01-01T08:00"}, "progress": {"planned": 18.5, "actual": 16.2, "description": {"tr": "Genel Fiziksel İlerleme", "en": "Overall Physical Progress", "ro": "Progres Fizic General"}}}')
ON CONFLICT (key) DO NOTHING;`
};
