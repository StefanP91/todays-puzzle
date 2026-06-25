-- Run in Supabase → SQL Editor after creating a project.
-- Enables optional login + per-language stats sync.

create table if not exists public.user_stats (
  user_id uuid not null references auth.users (id) on delete cascade,
  lang text not null,
  played integer not null default 0,
  won integer not null default 0,
  current_streak integer not null default 0,
  max_streak integer not null default 0,
  distribution jsonb not null default '[0,0,0,0,0,0]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, lang)
);

alter table public.user_stats enable row level security;

create policy "Users can read own stats"
  on public.user_stats for select
  using (auth.uid() = user_id);

create policy "Users can insert own stats"
  on public.user_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on public.user_stats for update
  using (auth.uid() = user_id);

-- Auth providers (Supabase Dashboard → Authentication → Providers):
-- 1. Email — enable Email provider
-- 2. Google — enable Google, add OAuth client ID/secret from Google Cloud Console
-- Redirect URL: https://YOUR_PROJECT.supabase.co/auth/v1/callback
-- Site URL: https://today-puzzle.netlify.app
