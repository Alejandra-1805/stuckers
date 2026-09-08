create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id text primary key,
  twitter_id text unique,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text default 'Professional bagholder.',
  created_at timestamptz default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id text not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  category text default 'STUCKERS',
  image_url text,
  repost_of uuid references public.posts(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.posts add column if not exists image_url text;
alter table public.posts add column if not exists repost_of uuid references public.posts(id) on delete set null;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id text not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 300),
  created_at timestamptz default now()
);

create table if not exists public.likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id text references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table if not exists public.bookmarks (
  post_id uuid references public.posts(id) on delete cascade,
  user_id text references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);

create table if not exists public.follows (
  follower_id text references public.profiles(id) on delete cascade,
  following_id text references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public.profiles(id) on delete cascade,
  actor_id text references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  kind text not null check (kind in ('like','comment','follow','repost')),
  read boolean default false,
  created_at timestamptz default now()
);

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do update set public = true;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.posts, public.comments, public.likes, public.bookmarks, public.follows to anon, authenticated;
grant select on public.notifications to authenticated;
