-- ============================================================
-- SUBMISSIONS RLS SECURITY FIX
-- ============================================================
-- Run this in your Supabase SQL Editor to ensure admins can 
-- see and manage all candidate exam submissions.

-- 1. Enable RLS on submissions table
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 2. Drop old conflicting policies
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can manage submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.submissions;

-- 3. Create fresh, robust policies
-- A. Candidate Policy: Users can only see and create their own submissions
CREATE POLICY "Users can insert their own submissions" 
ON public.submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submissions" 
ON public.submissions FOR SELECT 
USING (auth.uid() = user_id);

-- B. Admin Policy: Using get_user_role() which bypasses RLS recursion
-- This ensures ANY user with 'admin' role in public.profiles can see all submissions
CREATE POLICY "Admins can manage all submissions" 
ON public.submissions FOR ALL 
USING (public.get_user_role() = 'admin');

-- 4. Notify PostgREST to refresh the schema cache
NOTIFY pgrst, 'reload schema';
