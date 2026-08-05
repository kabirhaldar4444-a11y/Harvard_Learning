-- ============================================================
-- MASTER FINAL SUPER ADMIN SETUP (info@harvardlearning.com)
-- ============================================================
-- Run this script in your Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_email text := 'info@harvardlearning.com';
  admin_pass text := 'qwerty@123';
  new_user_id uuid := gen_random_uuid();
  encrypted_pw text;
BEGIN
  -- 1. Clean up any existing records for this email
  DELETE FROM public.profiles WHERE email = admin_email;
  DELETE FROM auth.identities WHERE identity_data->>'email' = admin_email OR provider_id = admin_email OR user_id IN (SELECT id FROM auth.users WHERE email = admin_email);
  DELETE FROM auth.users WHERE email = admin_email;

  -- 2. Generate bcrypt password hash
  encrypted_pw := crypt(admin_pass, gen_salt('bf', 10));

  -- 3. Insert into auth.users (excluding generated confirmed_at column)
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
    admin_email, 
    encrypted_pw,
    now(), 
    NULL, '', NULL, '', NULL, '', '', NULL, NULL,
    jsonb_build_object('provider', 'email', 'providers', array['email']), 
    jsonb_build_object('role', 'admin', 'full_name', 'System Admin'),
    false,
    now(), 
    now(),
    NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false
  );

  -- 4. Insert into auth.identities (provider_id = email address for GoTrue lookup)
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
    jsonb_build_object('sub', new_user_id::text, 'email', admin_email, 'email_verified', true, 'phone_verified', false), 
    'email',
    admin_email, 
    now(), 
    now(), 
    now()
  );

  -- 5. Upsert public.profiles (ON CONFLICT handles auto-trigger on auth.users insert)
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    profile_completed,
    is_exam_locked,
    disclaimer_accepted
  ) VALUES (
    new_user_id, 
    admin_email, 
    'System Admin', 
    'admin', 
    true,
    false,
    true
  )
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email, 
    full_name = EXCLUDED.full_name, 
    role = 'admin',
    profile_completed = true,
    is_exam_locked = false,
    disclaimer_accepted = true;

END $$;

NOTIFY pgrst, 'reload schema';
