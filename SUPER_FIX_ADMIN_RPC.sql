-- ============================================================
-- SUPER-ROBUST ADMIN UPDATE RPC FIX
-- ============================================================
-- Run this script in your Supabase SQL Editor to fix the 
-- "Function not found in schema cache" error.

-- 1. Enable pgcrypto (required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Ensure get_user_role exists and is safe from recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
  u_role text;
BEGIN
  -- We use a direct query to public.profiles
  -- SECURITY DEFINER ensures this runs with elevated permissions
  SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. DROP ALL OVERLOADS of the function to prevent cache confusion
-- This is a more aggressive way to clear the function from the cache
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT proname, oidvectortypes(proargtypes) as args 
              FROM pg_proc INNER JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid 
              WHERE proname = 'admin_update_candidate' AND nspname = 'public') 
    LOOP
        EXECUTE 'DROP FUNCTION public.admin_update_candidate(' || r.args || ')';
    END LOOP;
END $$;

-- 4. Create the function with flexible types (text) to ensure matching
-- PostgREST (Supabase RPC) is more reliable when parameters are text/text[] 
-- and then cast internally to uuid/uuid[].
CREATE OR REPLACE FUNCTION public.admin_update_candidate(
  target_user_id text,           -- Changed to text for flexibility
  new_email text,
  new_password text DEFAULT NULL,
  new_name text DEFAULT NULL,
  new_allotted_exam_ids text[] DEFAULT NULL -- Changed to text[] for flexibility
) RETURNS void AS $$
DECLARE
  encrypted_pw text;
  v_target_id uuid;
  v_exam_ids uuid[];
BEGIN
  -- A. Convert types internally
  v_target_id := target_user_id::uuid;
  v_exam_ids := new_allotted_exam_ids::uuid[];

  -- B. Security check: Only admins can perform this
  -- We check the caller's role using our helper
  IF public.get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access Denied: Not authorized to update candidates';
  END IF;

  -- C. Update auth.users email (Primary login record)
  UPDATE auth.users SET email = new_email WHERE id = v_target_id;
  
  -- D. Update auth.users password if provided
  IF new_password IS NOT NULL AND new_password != '' THEN
    encrypted_pw := crypt(new_password, gen_salt('bf', 10));
    UPDATE auth.users SET encrypted_password = encrypted_pw WHERE id = v_target_id;
  END IF;

  -- E. Update public.profiles (Application data)
  UPDATE public.profiles SET 
    full_name = COALESCE(new_name, full_name),
    email = new_email,
    allotted_exam_ids = COALESCE(v_exam_ids, allotted_exam_ids)
  WHERE id = v_target_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 5. Force PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
