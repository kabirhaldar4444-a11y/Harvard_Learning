-- MASTER ADMIN RECOVERY SETUP
-- Run this in your Supabase SQL Editor to ensure the Master Admin has correct permissions.

INSERT INTO public.profiles (id, email, role, profile_completed)
VALUES ('3790654b-0850-4138-ae38-07bca6e8968f', 'kabirhaldar4444@gmail.com', 'admin', true)
ON CONFLICT (id) DO UPDATE SET role = 'admin';
