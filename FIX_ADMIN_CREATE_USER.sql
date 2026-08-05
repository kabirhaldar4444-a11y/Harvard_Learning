-- ============================================================
-- HARVARD LEARNING EXAM PORTAL - ADMIN USER CREATION FIX
-- ============================================================
-- Run this script in your Supabase SQL Editor.
-- This creates a PostgreSQL RPC function that allows administrators to 
-- create new users (both Student/Candidate and Staff Admin) directly in the 
-- database, bypassing GoTrue auth rate limits and avoiding confirmation emails.

-- 1. Enable pgcrypto (required for password hashing/gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Drop existing function to ensure we replace it cleanly
DROP FUNCTION IF EXISTS public.admin_create_user(text, text, text, text, uuid[]);

-- 3. Create the robust function
CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_email text,
  user_password text,
  user_name text,
  user_role text,
  allotted_exams uuid[] DEFAULT '{}'::uuid[]
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  encrypted_pw text;
  normalized_email text;
BEGIN
  -- 1. Check if caller is admin
  IF COALESCE(public.get_user_role(), '') != 'admin' THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can create users';
  END IF;

  normalized_email := LOWER(TRIM(user_email));

  -- 2. Check if email exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = normalized_email) THEN
    RAISE EXCEPTION 'User with this email already exists';
  END IF;

  -- 3. Check role validity
  IF user_role NOT IN ('admin', 'candidate') THEN
    RAISE EXCEPTION 'Invalid role specified. Role must be admin or candidate';
  END IF;

  new_user_id := gen_random_uuid();
  -- Use crypt with bf (bcrypt) which is what Supabase Auth expects
  encrypted_pw := crypt(user_password, gen_salt('bf', 10));

  -- 4. Insert into auth.users (Direct insertion to bypass rate limits and emails)
  INSERT INTO auth.users (
    instance_id, 
    id, 
    aud, 
    role, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    is_super_admin,
    created_at, 
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', 
    new_user_id, 
    'authenticated', 
    'authenticated', 
    normalized_email, 
    encrypted_pw,
    now(), 
    NULL, '', NULL, '', NULL, '', '', NULL, NULL,
    jsonb_build_object('provider', 'email', 'providers', array['email']), 
    jsonb_build_object('role', user_role, 'full_name', user_name),
    false,
    now(), 
    now(),
    NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false
  );

  -- 5. Insert into auth.identities (CRITICAL for login)
  INSERT INTO auth.identities (
    id,
    user_id, 
    identity_data,
    provider,
    provider_id,
    last_sign_in_at, 
    created_at, 
    updated_at
  ) VALUES (
    gen_random_uuid(), 
    new_user_id, 
    jsonb_build_object('sub', new_user_id, 'email', normalized_email), 
    'email',
    normalized_email, 
    now(), 
    now(), 
    now()
  );

  -- 6. Insert/Update public.profiles record
  -- Even if the handle_new_user trigger fires on auth.users insert, we upsert to ensure role and allotted exams are correct.
  INSERT INTO public.profiles (id, email, full_name, role, allotted_exam_ids, profile_completed)
  VALUES (new_user_id, normalized_email, user_name, user_role, allotted_exams, false)
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email, 
    full_name = EXCLUDED.full_name, 
    role = EXCLUDED.role,
    allotted_exam_ids = EXCLUDED.allotted_exam_ids;

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

-- 4. Force PostgREST to reload schema cache so changes take effect immediately
NOTIFY pgrst, 'reload schema';
