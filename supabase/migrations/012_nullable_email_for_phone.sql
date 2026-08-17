-- Make email column nullable in profiles table to support phone-only registrations
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
