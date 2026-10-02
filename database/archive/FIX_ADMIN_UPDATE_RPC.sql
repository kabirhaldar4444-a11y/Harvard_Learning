-- ==========================================
-- FINAL ADMIN UPDATE RPC FIX
-- ==========================================
-- This script fixes the missing function error and 
-- ensures admins can update candidate details.

-- 1. Ensure the role helper exists and is robust
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
  u_role text;
BEGIN
  SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
  RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing function to avoid signature conflicts
DROP FUNCTION IF EXISTS public.admin_update_candidate(uuid, text, text, text, integer);
DROP FUNCTION IF EXISTS public.admin_update_candidate(uuid, text, text, text, uuid[]);

-- 3. Create the function with the EXACT signature expected by the JS code
CREATE OR REPLACE FUNCTION public.admin_update_candidate(
  target_user_id uuid,
  new_email text,
  new_password text DEFAULT NULL,
  new_name text DEFAULT NULL,
  new_allotted_exam_ids uuid[] DEFAULT NULL
) RETURNS void AS $$
DECLARE
  encrypted_pw text;
BEGIN
  -- Security check: Only admins can perform this
  IF public.get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Access Denied: Not authorized to update candidates';
  END IF;

  -- A. Update auth.users email
  UPDATE auth.users SET email = new_email WHERE id = target_user_id;
  
  -- B. Update auth.users password if provided
  IF new_password IS NOT NULL AND new_password != '' THEN
    encrypted_pw := crypt(new_password, gen_salt('bf', 10));
    UPDATE auth.users SET encrypted_password = encrypted_pw WHERE id = target_user_id;
  END IF;

  -- C. Update public.profiles
  UPDATE public.profiles SET 
    full_name = COALESCE(new_name, full_name),
    email = new_email,
    allotted_exam_ids = COALESCE(new_allotted_exam_ids, allotted_exam_ids)
  WHERE id = target_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
