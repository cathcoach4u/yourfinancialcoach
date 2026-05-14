-- USERS TABLE + ROW LEVEL SECURITY
-- Run once in Supabase SQL Editor when setting up the app.

CREATE TABLE IF NOT EXISTS public.users (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             text NOT NULL,
  full_name         text,
  membership_status text NOT NULL DEFAULT 'inactive',
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own row"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own row"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
