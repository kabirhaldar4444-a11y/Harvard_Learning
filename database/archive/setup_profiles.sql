-- First, backup data if necessary (optional, but recommended for users)
-- SELECT * FROM public.profiles;

-- Drop the existing table and its dependencies
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create the new profiles table with the requested schema
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
  profile_completed boolean NULL DEFAULT false,
  role text NULL DEFAULT 'candidate'::text,
  is_exam_locked boolean NULL DEFAULT false,
  allotted_exam_ids uuid[] NULL DEFAULT '{}'::uuid[],
  disclaimer_accepted boolean NULL DEFAULT false,
  signature_url text NULL,
  ip_address text NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id),
  CONSTRAINT profiles_role_check CHECK (
    (
      role = ANY (ARRAY['admin'::text, 'candidate'::text])
    )
  )
) TABLESPACE pg_default;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Set up basic RLS policies
-- 1. Allow users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 3. Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Allow admins full access
CREATE POLICY "Admins have full access" 
ON public.profiles FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- EXAMPLE: Insert an admin user
-- NOTE: Replace 'YOUR_USER_ID_HERE' with the UUID from auth.users table
-- INSERT INTO public.profiles (id, email, full_name, role, profile_completed)
-- VALUES ('YOUR_USER_ID_HERE', 'admin@harvardlearning.in', 'System Admin', 'admin', true);

-- TIP: You can run this query to automatically sync an admin from auth.users:
-- INSERT INTO public.profiles (id, email, full_name, role, profile_completed)
-- SELECT id, email, 'Admin User', 'admin', true
-- FROM auth.users
-- WHERE email = 'admin@harvardlearning.in' -- Change to your admin email
-- ON CONFLICT (id) DO NOTHING;
