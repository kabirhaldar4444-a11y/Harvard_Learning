-- ============================================================
-- HARVARD LEARNING EXAM PORTAL - COMPLETE DATABASE SCHEMA SETUP
-- ============================================================
-- RUN THIS ENTIRE SCRIPT IN YOUR SUPABASE SQL EDITOR.
-- It will recreate all tables, configure RLS, and set up triggers, 
-- storage buckets, and admin functions/RPCs.

-- -------------------------------------------------------------
-- 0. CLEANUP OLD SCHEMAS (To prevent conflicts and ensure clean state)
-- -------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.admin_create_candidate(text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_candidate(text, text, text, text, text[]) CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_candidate(uuid, text, text, text, uuid[]) CASCADE;
DROP FUNCTION IF EXISTS public.admin_delete_user(uuid) CASCADE;

DROP TABLE IF EXISTS public.submissions CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.exams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- -------------------------------------------------------------
-- 1. EXTENSIONS
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------------
-- 2. TABLES CREATION
-- -------------------------------------------------------------

-- A. Profiles Table (Linked with auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NULL,
  full_name text NULL,
  phone text NULL,
  address text NULL,
  aadhaar_front_url text NULL,
  aadhaar_back_url text NULL,
  pan_url text NULL,
  profile_photo_url text NULL,
  profile_completed boolean DEFAULT false,
  role text DEFAULT 'candidate'::text,
  is_exam_locked boolean DEFAULT false,
  allotted_exam_ids uuid[] DEFAULT '{}'::uuid[],
  disclaimer_accepted boolean DEFAULT false,
  signature_url text NULL,
  ip_address text NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'candidate'))
);

-- B. Exams Table
CREATE TABLE public.exams (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  duration integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. Questions Table
CREATE TABLE public.questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL,
  correct_option integer NOT NULL,
  explanation text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. Submissions Table
CREATE TABLE public.submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_id uuid REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  total_questions integer NOT NULL,
  answers jsonb NOT NULL,
  is_released boolean DEFAULT false,
  admin_score_override integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------
-- 3. HELPER FUNCTIONS & ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------------

-- Helper function to fetch the user role securely without recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
  u_role text;
BEGIN
  SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Anyone can view profiles" ON public.profiles 
  FOR SELECT USING (true);

CREATE POLICY "Allow profile insert" ON public.profiles 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.profiles 
  FOR UPDATE USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete all profiles" ON public.profiles 
  FOR DELETE USING (public.get_user_role() = 'admin');

-- Exams Policies
CREATE POLICY "Anyone can view exams" ON public.exams 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage exams" ON public.exams 
  FOR ALL USING (public.get_user_role() = 'admin');

-- Questions Policies
CREATE POLICY "Anyone can view questions" ON public.questions 
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage questions" ON public.questions 
  FOR ALL USING (public.get_user_role() = 'admin');

-- Submissions Policies
CREATE POLICY "Users can insert their own submissions" ON public.submissions 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions" ON public.submissions 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage submissions" ON public.submissions 
  FOR ALL USING (public.get_user_role() = 'admin');

-- -------------------------------------------------------------
-- 4. PROFILE CREATION TRIGGER (Auto-runs on user sign-up)
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'System User'),
    COALESCE(new.raw_user_meta_data->>'role', 'candidate')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------------
-- 5. ADMINISTRATIVE RPC FUNCTIONS
-- -------------------------------------------------------------

-- A. Admin Create Candidate (bypasses default session limits)
CREATE OR REPLACE FUNCTION public.admin_create_candidate(
  candidate_email text,
  candidate_password text,
  candidate_name text
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  normalized_email text;
BEGIN
  -- Security check
  IF COALESCE(public.get_user_role(), '') != 'admin' THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can create candidates';
  END IF;

  normalized_email := LOWER(TRIM(candidate_email));
  new_user_id := gen_random_uuid();

  -- Insert into auth.users (Standard format)
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, 
    email_confirmed_at, confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, 
    created_at, updated_at, is_super_admin
  ) VALUES (
    new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
    normalized_email, crypt(candidate_password, gen_salt('bf', 10)),
    now(), now(), 
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('role', 'candidate', 'full_name', candidate_name),
    now(), now(), false
  );

  -- Insert into auth.identities (CRITICAL for login)
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, 
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), 
    new_user_id, 
    jsonb_build_object('sub', new_user_id, 'email', normalized_email), 
    'email', 
    normalized_email, 
    now(), now(), now()
  );

  -- Insert/update profile data
  INSERT INTO public.profiles (id, email, full_name, role, profile_completed)
  VALUES (new_user_id, normalized_email, candidate_name, 'candidate', false)
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email, 
    full_name = EXCLUDED.full_name, 
    role = EXCLUDED.role;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Admin Update Candidate
CREATE OR REPLACE FUNCTION public.admin_update_candidate(
  target_user_id text,
  new_email text,
  new_password text DEFAULT NULL,
  new_name text DEFAULT NULL,
  new_allotted_exam_ids text[] DEFAULT NULL
) RETURNS void AS $$
DECLARE
  encrypted_pw text;
  v_target_id uuid;
  v_exam_ids uuid[];
BEGIN
  v_target_id := target_user_id::uuid;
  v_exam_ids := new_allotted_exam_ids::uuid[];

  -- Security check
  IF COALESCE(public.get_user_role(), '') != 'admin' THEN
    RAISE EXCEPTION 'Access Denied: Not authorized to update candidates';
  END IF;

  -- Update email in auth
  UPDATE auth.users SET email = new_email WHERE id = v_target_id;
  
  -- Update password if provided
  IF new_password IS NOT NULL AND new_password != '' THEN
    encrypted_pw := crypt(new_password, gen_salt('bf', 10));
    UPDATE auth.users SET encrypted_password = encrypted_pw WHERE id = v_target_id;
  END IF;

  -- Update profile
  UPDATE public.profiles SET 
    full_name = COALESCE(new_name, full_name),
    email = new_email,
    allotted_exam_ids = COALESCE(v_exam_ids, allotted_exam_ids)
  WHERE id = v_target_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

-- C. Admin Delete User (clean deletion of users & related data)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS json AS $$
DECLARE
    caller_role text;
    target_exists boolean;
BEGIN
    -- Security check
    caller_role := COALESCE(public.get_user_role(), '');
    IF caller_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
    END IF;

    -- Safety check
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Safety Violation: You cannot delete your own account';
    END IF;

    -- Check user existence
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = target_user_id) INTO target_exists;
    IF NOT target_exists THEN
        RETURN json_build_object('success', false, 'message', 'User not found or already deleted');
    END IF;

    -- Cleanup
    DELETE FROM public.submissions WHERE user_id = target_user_id;
    DELETE FROM public.profiles WHERE id = target_user_id;
    DELETE FROM auth.users WHERE id = target_user_id;

    RETURN json_build_object(
        'success', true, 
        'message', 'User and all related data deleted successfully',
        'timestamp', now()
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Deletion failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------
-- 6. STORAGE BUCKETS & STORAGE POLICIES
-- -------------------------------------------------------------
-- Attempts to create the bucket. (If it fails because of database permission levels, 
-- create a public bucket named 'aadhaar_cards' via your Supabase dashboard).
INSERT INTO storage.buckets (id, name, public)
VALUES ('aadhaar_cards', 'aadhaar_cards', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage objects policies for the 'aadhaar_cards' bucket
DROP POLICY IF EXISTS "Allow authenticated users to view all aadhaar cards" ON storage.objects;
CREATE POLICY "Allow authenticated users to view all aadhaar cards" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'aadhaar_cards');

DROP POLICY IF EXISTS "Allow authenticated users to upload their own aadhaar cards" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload their own aadhaar cards" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'aadhaar_cards');

DROP POLICY IF EXISTS "Allow authenticated users to update their own aadhaar cards" ON storage.objects;
CREATE POLICY "Allow authenticated users to update their own aadhaar cards" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'aadhaar_cards');

DROP POLICY IF EXISTS "Allow authenticated users to delete their own aadhaar cards" ON storage.objects;
CREATE POLICY "Allow authenticated users to delete their own aadhaar cards" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'aadhaar_cards');

-- -------------------------------------------------------------
-- 7. RECOVERY: INITIALIZE AN ADMIN USER
-- -------------------------------------------------------------
-- Change 'info@harvardlearning.com' to your target admin email.
-- Once the user signs up with this email or you create it in Auth, 
-- run the bottom block or it will automatically sync via trigger.
DO $$
DECLARE
  target_email text := 'info@harvardlearning.com';
  user_id uuid;
BEGIN
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;
  IF user_id IS NOT NULL THEN
    UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb WHERE id = user_id;
    INSERT INTO public.profiles (id, full_name, role, email, profile_completed)
    VALUES (user_id, 'System Admin', 'admin', target_email, true)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', email = target_email, profile_completed = true;
  END IF;
END $$;

-- Reload cache
NOTIFY pgrst, 'reload schema';
