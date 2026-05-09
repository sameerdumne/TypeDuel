create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 24),
  avatar_url text,
  matches_played integer not null default 0 check (matches_played >= 0),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  avg_wpm numeric(6, 2) not null default 0 check (avg_wpm >= 0),
  accuracy numeric(5, 2) not null default 100 check (accuracy >= 0 and accuracy <= 100),
  xp integer not null default 0 check (xp >= 0),
  rank text not null default 'Bronze',
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.paragraphs (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('easy', 'medium', 'hard', 'programming', 'random')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  body text not null check (char_length(body) between 80 and 900),
  character_count integer generated always as (char_length(body)) stored,
  estimated_seconds integer not null default 45 check (estimated_seconds > 0),
  seed_tag text not null default 'core',
  is_active boolean not null default true,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 5 and 12),
  host_user_id uuid references public.users(id) on delete set null,
  host_guest_id text,
  status text not null default 'waiting' check (status in ('waiting', 'queued', 'playing', 'closed')),
  paragraph_id uuid references public.paragraphs(id) on delete set null,
  match_id uuid,
  max_players integer not null default 2 check (max_players = 2),
  invite_expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_host_present check (host_user_id is not null or host_guest_id is not null)
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete set null,
  mode text not null check (mode in ('quick', 'private', 'bot', 'spectator')),
  status text not null default 'countdown' check (status in ('countdown', 'active', 'completed', 'abandoned')),
  paragraph_id uuid not null references public.paragraphs(id) on delete restrict,
  seed text not null,
  started_at timestamptz,
  ended_at timestamptz,
  winner_user_id uuid references public.users(id) on delete set null,
  winner_guest_id text,
  winner_reason text,
  created_at timestamptz not null default now()
);

alter table public.rooms
  drop constraint if exists rooms_match_id_fkey,
  add constraint rooms_match_id_fkey
    foreign key (match_id) references public.matches(id) on delete set null;

create table if not exists public.match_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  guest_id text,
  display_name text not null,
  wpm numeric(6, 2) not null default 0 check (wpm >= 0),
  accuracy numeric(5, 2) not null default 0 check (accuracy >= 0 and accuracy <= 100),
  completion_percent numeric(5, 2) not null default 0 check (completion_percent >= 0 and completion_percent <= 100),
  completed_at timestamptz,
  completion_ms integer,
  rank_delta integer not null default 0,
  xp_delta integer not null default 0,
  suspicious_flags text[] not null default '{}',
  won boolean not null default false,
  created_at timestamptz not null default now(),
  constraint match_results_player_present check (user_id is not null or guest_id is not null)
);

create table if not exists public.rankings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  mmr integer not null default 1000 check (mmr >= 0),
  rank_name text not null default 'Bronze' check (rank_name in ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond')),
  division integer not null default 5 check (division between 1 and 5),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  daily_wins integer not null default 0 check (daily_wins >= 0),
  daily_wpm_best numeric(6, 2) not null default 0,
  win_streak integer not null default 0,
  best_streak integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists paragraphs_active_category_idx on public.paragraphs(category, difficulty) where is_active = true;
create index if not exists matches_created_idx on public.matches(created_at desc);
create index if not exists match_results_match_idx on public.match_results(match_id);
create index if not exists match_results_user_idx on public.match_results(user_id) where user_id is not null;
create index if not exists rooms_code_idx on public.rooms(code);
create index if not exists rankings_mmr_idx on public.rankings(mmr desc, updated_at desc);

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists rooms_updated_at on public.rooms;
create trigger rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists rankings_updated_at on public.rankings;
create trigger rankings_updated_at
before update on public.rankings
for each row execute function public.set_updated_at();

create or replace function public.username_from_auth(new_user auth.users)
returns text
language plpgsql
as $$
declare
  base_name text;
  candidate text;
begin
  base_name := coalesce(
    new_user.raw_user_meta_data ->> 'username',
    split_part(new_user.email, '@', 1),
    'duelist'
  );

  base_name := lower(regexp_replace(base_name, '[^a-zA-Z0-9_]', '', 'g'));
  base_name := left(coalesce(nullif(base_name, ''), 'duelist'), 18);
  if char_length(base_name) < 3 then
    base_name := base_name || 'duel';
    base_name := left(base_name, 18);
  end if;
  candidate := base_name;

  while exists (select 1 from public.users where username = candidate) loop
    candidate := left(base_name, 16) || floor(random() * 10000)::text;
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, username, avatar_url)
  values (
    new.id,
    public.username_from_auth(new),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.rankings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace view public.global_leaderboard as
select
  u.id,
  u.username,
  u.avatar_url,
  u.avg_wpm,
  u.accuracy,
  u.wins,
  u.losses,
  u.best_streak,
  r.mmr,
  r.rank_name,
  r.division,
  r.updated_at
from public.rankings r
join public.users u on u.id = r.user_id
order by r.mmr desc, u.avg_wpm desc, u.accuracy desc;

create or replace view public.daily_leaderboard as
select
  u.id,
  u.username,
  u.avatar_url,
  u.avg_wpm,
  u.accuracy,
  u.wins,
  u.losses,
  u.best_streak,
  r.mmr,
  r.daily_wins,
  r.daily_wpm_best,
  r.win_streak,
  r.rank_name,
  r.division,
  r.updated_at
from public.rankings r
join public.users u on u.id = r.user_id
where r.updated_at >= date_trunc('day', now())
order by r.daily_wins desc, r.daily_wpm_best desc, r.updated_at desc;

alter table public.users enable row level security;
alter table public.paragraphs enable row level security;
alter table public.rooms enable row level security;
alter table public.matches enable row level security;
alter table public.match_results enable row level security;
alter table public.rankings enable row level security;

drop policy if exists "Profiles are visible to everyone" on public.users;
create policy "Profiles are visible to everyone"
on public.users for select
to anon, authenticated
using (true);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
on public.users for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Active paragraphs are readable" on public.paragraphs;
create policy "Active paragraphs are readable"
on public.paragraphs for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Authenticated users can create paragraphs" on public.paragraphs;
create policy "Authenticated users can create paragraphs"
on public.paragraphs for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "Paragraph authors can update drafts" on public.paragraphs;
create policy "Paragraph authors can update drafts"
on public.paragraphs for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists "Rooms are readable by clients" on public.rooms;
create policy "Rooms are readable by clients"
on public.rooms for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated hosts can create rooms" on public.rooms;
create policy "Authenticated hosts can create rooms"
on public.rooms for insert
to authenticated
with check (host_user_id = auth.uid());

drop policy if exists "Authenticated hosts can update own waiting rooms" on public.rooms;
create policy "Authenticated hosts can update own waiting rooms"
on public.rooms for update
to authenticated
using (host_user_id = auth.uid() and status in ('waiting', 'queued'))
with check (host_user_id = auth.uid());

drop policy if exists "Completed matches are readable" on public.matches;
create policy "Completed matches are readable"
on public.matches for select
to anon, authenticated
using (status in ('completed', 'abandoned'));

drop policy if exists "Own match results are readable" on public.match_results;
create policy "Own match results are readable"
on public.match_results for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Public winning results are readable" on public.match_results;
create policy "Public winning results are readable"
on public.match_results for select
to anon, authenticated
using (won = true);

drop policy if exists "Rankings are readable" on public.rankings;
create policy "Rankings are readable"
on public.rankings for select
to anon, authenticated
using (true);

drop policy if exists "Users can insert own ranking row" on public.rankings;
create policy "Users can insert own ranking row"
on public.rankings for insert
to authenticated
with check (user_id = auth.uid());

grant usage on schema public to anon, authenticated;
grant select on
  public.users,
  public.paragraphs,
  public.rooms,
  public.matches,
  public.match_results,
  public.rankings,
  public.global_leaderboard,
  public.daily_leaderboard
to anon, authenticated;

grant insert, update on public.users to authenticated;
grant insert, update on public.rankings to authenticated;
grant insert, update on public.paragraphs to authenticated;
grant insert, update on public.rooms to authenticated;

insert into public.paragraphs (category, difficulty, body, estimated_seconds, seed_tag)
values
  ('easy', 'easy', 'Neon keys shimmer under steady hands as two focused players chase the same line of text. Every clean letter moves the duel forward, and every mistake leaves a bright mark on the scoreboard.', 35, 'launch'),
  ('easy', 'easy', 'Speed feels electric when rhythm and accuracy agree. The best typists breathe slowly, read ahead, and keep their fingers light through every turn of the sentence.', 32, 'launch'),
  ('medium', 'medium', 'A fair typing match is not won by rushing alone. It rewards calm focus, precise corrections, and the ability to keep pace while pressure rises on the other side of the arena.', 45, 'launch'),
  ('medium', 'medium', 'In competitive typing, the paragraph becomes a shared battlefield. The server locks the words, the timer starts for both players, and the cleanest run earns the loudest finish.', 44, 'launch'),
  ('hard', 'hard', 'Synchronization matters when milliseconds decide a match. A trustworthy arena validates progress on the server, compares completion, speed, accuracy, and time, then records the result without asking the browser to be honest.', 62, 'launch'),
  ('hard', 'hard', 'Mechanical confidence arrives through deliberate repetition: wrists relaxed, eyes scanning future words, corrections made instantly, and momentum rebuilt before hesitation turns into a lost duel.', 58, 'launch'),
  ('programming', 'medium', 'Readable code and readable typing share the same discipline. Small mistakes compound quickly, but careful structure, clear intent, and steady feedback loops keep the system moving.', 48, 'launch'),
  ('programming', 'hard', 'The fastest systems avoid trusting the edge blindly. They measure events close to the source, reject impossible states, and persist only the facts that survive validation.', 52, 'launch'),
  ('random', 'medium', 'Some matches feel like lightning in a quiet room. The countdown fades, the first character glows, and suddenly two strangers are racing through the exact same thought.', 42, 'launch')
on conflict do nothing;
