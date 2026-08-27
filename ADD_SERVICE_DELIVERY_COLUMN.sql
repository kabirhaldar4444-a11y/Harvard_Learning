-- ============================================================
-- ADD SERVICE DELIVERY COLUMNS TO PROFILES
-- ============================================================
-- Run this script in your Supabase SQL Editor if you want to store
-- service delivery stage progress directly in the database.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS service_delivery_step integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS service_delivery_status text DEFAULT 'completed';

-- Allow admins to update these columns
COMMENT ON COLUMN public.profiles.service_delivery_step IS 'Current step (1-12) in the 12-stage service delivery lifecycle';
COMMENT ON COLUMN public.profiles.service_delivery_status IS 'Status: completed or in_progress';
