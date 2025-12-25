
export const MIGRATION_BLOCK = `-- 0. CLEANUP & SCHEMA FIX
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ 
BEGIN
    -- Drop constraints if they exist to prevent conflicts during seed
    ALTER TABLE IF EXISTS structure_groups DROP CONSTRAINT IF EXISTS structure_groups_structure_id_fkey;
    ALTER TABLE IF EXISTS structure_elements DROP CONSTRAINT IF EXISTS structure_elements_group_id_fkey;

    -- REPAIR DEFAULTS: Ensure ID columns have default generators if missing
    ALTER TABLE pvla_matrix_columns ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE structures_main ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE structure_groups ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE progress_items ALTER COLUMN id SET DEFAULT gen_random_uuid();

    -- MIGRATE CHANGELOGS: Add multi-language columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'changelogs' AND column_name = 'changes_tr') THEN
        ALTER TABLE changelogs ADD COLUMN changes_tr TEXT[] DEFAULT '{}';
        ALTER TABLE changelogs ADD COLUMN changes_en TEXT[] DEFAULT '{}';
        ALTER TABLE changelogs ADD COLUMN changes_ro TEXT[] DEFAULT '{}';
    END IF;

    -- FORCE MIGRATE: Ensure old JSONB data is copied to new TEXT[] column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'changelogs' AND column_name = 'changes') THEN
        UPDATE changelogs 
        SET changes_tr = ARRAY(
            SELECT jsonb_array_elements_text(changes)
        )
        WHERE changes IS NOT NULL 
          AND (changes_tr IS NULL OR cardinality(changes_tr) = 0)
          AND jsonb_typeof(changes) = 'array';
    END IF;
END $$;

-- 1. Ensure Tables Exist
CREATE TABLE IF NOT EXISTS structure_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name_tr TEXT, name_en TEXT, name_ro TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS structures_main (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type_id UUID,
  code TEXT,
  name TEXT,
  km_start NUMERIC,
  km_end NUMERIC,
  is_split BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS structure_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID,
  name TEXT,
  group_type TEXT,
  direction TEXT,
  order_index INTEGER
);

CREATE TABLE IF NOT EXISTS pvla_matrix_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT,
  name_tr TEXT, name_en TEXT, name_ro TEXT,
  group_tr TEXT, group_en TEXT, group_ro TEXT,
  col_type TEXT,
  order_index INTEGER
);

CREATE TABLE IF NOT EXISTS progress_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_group_id UUID,
  matrix_column_id UUID,
  status TEXT DEFAULT 'EMPTY',
  reference_code TEXT,
  file_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(structure_group_id, matrix_column_id)
);

CREATE TABLE IF NOT EXISTS changelogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT,
  release_date DATE,
  type TEXT,
  title_tr TEXT, title_en TEXT, title_ro TEXT,
  changes_tr TEXT[], changes_en TEXT[], changes_ro TEXT[],
  changes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export const TABLE_SCHEMAS: Record<string, string> = {
    'pvla_matrix_columns': `CREATE TABLE IF NOT EXISTS pvla_matrix_columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  name_tr TEXT, name_en TEXT, name_ro TEXT,
  group_tr TEXT, group_en TEXT, group_ro TEXT,
  col_type TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'structures_main': `CREATE TABLE IF NOT EXISTS structures_main (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type_id UUID,
  code TEXT, name TEXT,
  km_start NUMERIC, km_end NUMERIC,
  is_split BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'structure_groups': `CREATE TABLE IF NOT EXISTS structure_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  structure_id UUID,
  name TEXT,
  group_type TEXT,
  direction TEXT, -- 'L', 'R', 'C'
  order_index INTEGER
);`,
    'changelogs': `CREATE TABLE IF NOT EXISTS changelogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT,
  release_date DATE,
  type TEXT, -- 'major', 'minor', 'patch'
  title_tr TEXT, title_en TEXT, title_ro TEXT,
  changes_tr TEXT[], changes_en TEXT[], changes_ro TEXT[],
  changes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
    'feedback_submissions': `CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'NEW', -- 'NEW', 'READ', 'IN_PROGRESS', 'RESOLVED'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS POLICIES FOR SECURE FEEDBACK
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;

-- Clean up old/insecure policies first to ensure a clean state
DROP POLICY IF EXISTS "Public Insert" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Public Read" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Public Update" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Public Delete" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Admins can view feedback" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Allow public insert for feedback" ON public.feedback_submissions;
DROP POLICY IF EXISTS "Allow management for authenticated users" ON public.feedback_submissions;


-- 1. Allow public INSERT access for the feedback form.
CREATE POLICY "Allow public insert for feedback"
ON public.feedback_submissions
FOR INSERT
WITH CHECK (true);

-- 2. Allow SELECT, UPDATE, DELETE for authenticated users (admins/editors).
CREATE POLICY "Allow management for authenticated users"
ON public.feedback_submissions
FOR ALL -- Covers SELECT, UPDATE, DELETE
TO authenticated
USING (true);`
};

export const SEED_DATA_SCHEMAS: Record<string, string> = {
    'structure_types': `
-- 1. YAPI TİPLERİ (Types)
DELETE FROM structure_types;
INSERT INTO structure_types (id, code, name_tr, name_en, name_ro, icon) VALUES
('a1b2c3d4-0000-0000-0000-000000000001', 'POD', 'Köprü & Viyadük', 'Bridge & Viaduct', 'Pod & Viaduct', 'bridge'),
('a1b2c3d4-0000-0000-0000-000000000002', 'DG', 'Menfez (Box)', 'Box Culvert', 'Podeț', 'rectangle'),
('a1b2c3d4-0000-0000-0000-000000000003', 'OVERPASS', 'Üst Geçit', 'Overpass', 'Pasaj Superior', 'architecture'),
('a1b2c3d4-0000-0000-0000-000000000004', 'UNDERPASS', 'Alt Geçit', 'Underpass', 'Pasaj Inferior', 'tunnel'),
('a1b2c3d4-0000-0000-0000-000000000005', 'WALL', 'İstinat Duvarı', 'Retaining Wall', 'Zid de Sprijin', 'wall'),
('a1b2c3d4-0000-0000-0000-000000000006', 'EARTHWORK', 'Toprak İşleri', 'Earthworks', 'Terasamente', 'terrain');
`,

    'structures_main': `
-- 2. ÖRNEK YAPILAR (Structures)
DELETE FROM structures_main;
INSERT INTO structures_main (id, type_id, code, name, km_start, km_end, is_split) VALUES
('b2c3d4e5-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'B01', 'Viyadük - 1', 12.500, 13.200, true),
('b2c3d4e5-0000-0000-0000-000000000002', 'a1b2c3d4-0000-0000-0000-000000000002', 'C04', 'Kutu Menfez 2x2', 14.100, 14.120, false);
`,

    'structure_groups': `
-- 3. YAPI GRUPLARI / AKSLAR (Groups - Rows of Matrix)
DELETE FROM structure_groups;
INSERT INTO structure_groups (id, structure_id, name, group_type, direction, order_index) VALUES
-- B01 Bridge (Split: Left & Right)
('c3d4e5f6-0000-0000-0000-000000000001', 'b2c3d4e5-0000-0000-0000-000000000001', 'A1 Sol', 'ABUTMENT', 'L', 1),
('c3d4e5f6-0000-0000-0000-000000000002', 'b2c3d4e5-0000-0000-0000-000000000001', 'A1 Sağ', 'ABUTMENT', 'R', 2),
('c3d4e5f6-0000-0000-0000-000000000003', 'b2c3d4e5-0000-0000-0000-000000000001', 'P1 Sol', 'PIER', 'L', 3),
('c3d4e5f6-0000-0000-0000-000000000004', 'b2c3d4e5-0000-0000-0000-000000000001', 'P1 Sağ', 'PIER', 'R', 4),
('c3d4e5f6-0000-0000-0000-000000000005', 'b2c3d4e5-0000-0000-0000-000000000001', 'A2 Sol', 'ABUTMENT', 'L', 5),
('c3d4e5f6-0000-0000-0000-000000000006', 'b2c3d4e5-0000-0000-0000-000000000001', 'A2 Sağ', 'ABUTMENT', 'R', 6),

-- C04 Culvert (Single)
('c3d4e5f6-0000-0000-0000-000000000007', 'b2c3d4e5-0000-0000-0000-000000000002', 'Menfez Gövdesi', 'MAIN', 'C', 1);
`,

    'pvla_matrix_columns': `
-- 4. MATRİS SÜTUNLARI (Matrix Columns)
DELETE FROM pvla_matrix_columns;
INSERT INTO pvla_matrix_columns (id, type, name_tr, name_en, name_ro, group_tr, group_en, group_ro, col_type, order_index) VALUES
-- Bridge Columns
(gen_random_uuid(), 'Bridge', 'Aplikasyon', 'Stakeout', 'Trasare', 'Kazık İşleri', 'Piling Works', 'Lucrări Piloți', 'TRASARE', 1),
(gen_random_uuid(), 'Bridge', 'Donatı Kontrol', 'Rebar Check', 'Verif. Armătură', 'Kazık İşleri', 'Piling Works', 'Lucrări Piloți', 'VERIFICARE', 2),
(gen_random_uuid(), 'Bridge', 'Beton Döküm', 'Concrete Pour', 'Turnare Beton', 'Kazık İşleri', 'Piling Works', 'Lucrări Piloți', 'VERIFICARE', 3),
(gen_random_uuid(), 'Bridge', 'Aplikasyon', 'Stakeout', 'Trasare', 'Temel', 'Foundation', 'Fundație', 'TRASARE', 4),
(gen_random_uuid(), 'Bridge', 'Donatı', 'Rebar', 'Armătură', 'Temel', 'Foundation', 'Fundație', 'VERIFICARE', 5),
(gen_random_uuid(), 'Bridge', 'Beton', 'Concrete', 'Beton', 'Temel', 'Foundation', 'Fundație', 'VERIFICARE', 6),
(gen_random_uuid(), 'Bridge', 'Aplikasyon', 'Stakeout', 'Trasare', 'Elevasyon', 'Elevation', 'Elevație', 'TRASARE', 7),
(gen_random_uuid(), 'Bridge', 'Donatı', 'Rebar', 'Armătură', 'Elevasyon', 'Elevation', 'Elevație', 'VERIFICARE', 8),
(gen_random_uuid(), 'Bridge', 'Beton', 'Concrete', 'Beton', 'Elevasyon', 'Elevation', 'Elevație', 'VERIFICARE', 9),
(gen_random_uuid(), 'Bridge', 'Aplikasyon', 'Stakeout', 'Trasare', 'Başlık Kirişi', 'Cap Beam', 'Rigla', 'TRASARE', 10),
(gen_random_uuid(), 'Bridge', 'Donatı', 'Rebar', 'Armătură', 'Başlık Kirişi', 'Cap Beam', 'Rigla', 'VERIFICARE', 11),
(gen_random_uuid(), 'Bridge', 'Beton', 'Concrete', 'Beton', 'Başlık Kirişi', 'Cap Beam', 'Rigla', 'VERIFICARE', 12),

-- Culvert Columns
(gen_random_uuid(), 'Culvert', 'Kazı', 'Excavation', 'Săpătură', 'Toprak İşleri', 'Earthworks', 'Terasamente', 'VERIFICARE', 1),
(gen_random_uuid(), 'Culvert', 'Blokaj', 'Stone Block', 'Blocaj Piatră', 'Temel', 'Foundation', 'Fundație', 'VERIFICARE', 2),
(gen_random_uuid(), 'Culvert', 'Grobeton', 'Lean Concrete', 'Beton Egalizare', 'Temel', 'Foundation', 'Fundație', 'VERIFICARE', 3),
(gen_random_uuid(), 'Culvert', 'Radye Temel', 'Raft Found.', 'Radier', 'Betonarme', 'RC Works', 'Beton Armat', 'VERIFICARE', 4),
(gen_random_uuid(), 'Culvert', 'Perde/Duvar', 'Walls', 'Pereți', 'Betonarme', 'RC Works', 'Beton Armat', 'VERIFICARE', 5),
(gen_random_uuid(), 'Culvert', 'Tabliye', 'Top Slab', 'Placă', 'Betonarme', 'RC Works', 'Beton Armat', 'VERIFICARE', 6),
(gen_random_uuid(), 'Culvert', 'İzolasyon', 'Waterproofing', 'Hidroizolație', 'Bitiş İşleri', 'Finishing', 'Finisaje', 'VERIFICARE', 7);
`
};
