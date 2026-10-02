-- ============================================================
-- HARVARD LEARNING - FIX PUBLIC STORAGE UPLOAD POLICIES
-- ============================================================
-- Execute this script in your Supabase SQL Editor to allow candidates
-- to upload admission video statements & identity documents to storage.

-- 1. Ensure Buckets Exist and are Public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('admissions', 'admissions', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('aadhaar_cards', 'aadhaar_cards', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop restrictive RLS policies if any exist on storage.objects
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public Storage Select" ON storage.objects;
  DROP POLICY IF EXISTS "Public Storage Upload" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public uploads for admissions" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public select for admissions" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to upload their own aadhaar cards" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to view all aadhaar cards" ON storage.objects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Create Public Policies (Allows anonymous applicants on /admission to upload and view files)
CREATE POLICY "Allow public uploads for admissions" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id IN ('admissions', 'aadhaar_cards', 'videos'));

CREATE POLICY "Allow public select for admissions" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id IN ('admissions', 'aadhaar_cards', 'videos'));

CREATE POLICY "Allow public update for admissions" 
ON storage.objects FOR UPDATE 
TO public 
USING (bucket_id IN ('admissions', 'aadhaar_cards', 'videos'));

-- 4. Reload Schema
NOTIFY pgrst, 'reload schema';
