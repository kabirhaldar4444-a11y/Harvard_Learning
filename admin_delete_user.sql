-- Function to securely delete a user from both auth.users and public.profiles
-- This requires SECURITY DEFINER to bypass RLS and access the auth schema.

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS void AS $$
BEGIN
  -- 1. Check if the caller is an admin
  IF public.get_user_role() != 'admin' THEN
    RAISE EXCEPTION 'Not authorized: Only administrators can delete users.';
  END IF;

  -- 2. Delete from auth.users
  -- This will automatically delete from public.profiles if the foreign key is set to ON DELETE CASCADE.
  -- Even if not, we handle it by deleting from auth.users which is the source of truth.
  DELETE FROM auth.users WHERE id = target_user_id;

  -- 3. Explicitly delete from profiles if cascade didn't happen (safeguard)
  DELETE FROM public.profiles WHERE id = target_user_id;
  
  -- 4. Delete associated submissions (safeguard, usually cascaded)
  DELETE FROM public.submissions WHERE user_id = target_user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
