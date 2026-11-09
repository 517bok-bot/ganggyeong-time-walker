-- 강경 타임워커 · Supabase(PostgreSQL) 스키마 (2단계)
-- ─────────────────────────────────────────────────────────────
-- Supabase 대시보드 → SQL Editor 에 전체를 붙여 넣고 실행하세요. (여러 번 실행해도 안전하도록 작성)
--
-- 설계 원칙
--  1) 콘텐츠 테이블(locations, characters, knowledge_documents …): 누구나 읽기 / 관리자만 쓰기
--  2) 플레이어 상태(game_saves.state)는 서버의 게임 엔진(lib/engine.ts)만 변경합니다.
--     클라이언트는 읽기만 가능하고, 쓰기는 Service Role 전용 함수 commit_game_action 하나로만 이뤄집니다.
--  3) commit_game_action 은 상태 저장 + 정규화 테이블 기록을 한 트랜잭션으로 처리합니다.
--     - version 이 다르면 'version_conflict' (동시 요청으로 인한 이중 보상 방지)
--     - location_visits (user_id, location_id) PK 충돌 시 'duplicate_visit' (중복 방문 보상 방지)
--  4) 진행 테이블은 콘텐츠 테이블에 FK를 걸지 않습니다. 콘텐츠가 아직 등록되지 않아도 게임이 동작하도록.
-- 'jellyfish' 테이블은 기획서 지시에 따라 만들지 않았습니다.

create extension if not exists "pgcrypto";

-- ── 사용자 ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '타임워커' check (char_length(nickname) between 1 and 12),
  avatar text not null default 'sage',
  level int not null default 1,
  exp int not null default 0,
  coins int not null default 0,
  artisan_exp int not null default 0,
  role text not null default 'user' check (role in ('user','editor','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','editor'));
$$;

-- 가입 시 프로필 자동 생성
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- 플레이어 게임 상태 (엔진의 GameState JSON)
create table if not exists public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  version int not null default 1,
  updated_at timestamptz not null default now()
);

-- ── 콘텐츠 (관리자 편집) ───────────────────────────────
create table if not exists public.locations (
  id text primary key,
  map_no int,
  name text not null,
  note text,
  zone text check (zone in ('street','club')),
  is_real boolean not null default true,
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),
  radius_m int not null default 40 check (radius_m between 10 and 500),
  photo_url text,
  description text,
  history text,
  history_status text not null default 'pending' check (history_status in ('pending','review','approved')),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now()
);
create table if not exists public.characters (
  id text primary key, name text not null, family text, role text, quote text,
  personality text[], likes text, story text, rarity text check (rarity in ('N','R','SR','SSR')),
  image_url text,
  license_status text not null default 'permission_required' check (license_status in ('permission_required','approved')),
  updated_at timestamptz default now()
);
create table if not exists public.knowledge_documents (
  id text primary key, title text not null, body text not null, caveat text,
  sources jsonb not null default '[]',
  status text not null default 'review' check (status in ('draft','review','approved')),
  updated_by uuid references auth.users(id) on delete set null, updated_at timestamptz default now()
);
create table if not exists public.npcs (id text primary key, name text not null, title text, location_id text, greeting text, is_fictional boolean not null default true);
create table if not exists public.quests (id text primary key, title text not null, type text, difficulty int, description text, reward jsonb);
create table if not exists public.fermentation_recipes (
  id text primary key, name text not null, aging_minutes int not null, unlock_level int default 1,
  is_game_only boolean not null default true,   -- 게임 수치 (실제 제조법 아님)
  verified_recipe text, verified_source text      -- 실제 레시피 안내는 검증 자료만
);
create table if not exists public.events (id text primary key, title text, kind text, starts_at timestamptz, ends_at timestamptz, data jsonb);
create table if not exists public.community_jars (
  id text primary key, title text not null, goal int not null check (goal > 0), progress int not null default 0,
  status text not null default 'open' check (status in ('open','completed','closed')),
  starts_at timestamptz default now(), ends_at timestamptz
);
insert into public.community_jars(id, title, goal) values ('season-1', '강경 공동 젓갈 항아리 · 시즌 1', 5000) on conflict do nothing;
create table if not exists public.shops (
  id text primary key, name text not null, location_id text, category text, description text,
  is_official_partner boolean not null default false -- 실제 제휴·사용 허가 완료 시에만 true
);
create table if not exists public.announcements (id uuid primary key default gen_random_uuid(), title text not null, body text, published_at timestamptz default now());

-- ── 플레이어 진행 (정규화 · 통계 · 무결성) ───────────────
create table if not exists public.location_visits (
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id text not null,
  method text not null check (method in ('gps','qr','demo')),
  visited_at timestamptz not null default now(),
  primary key (user_id, location_id)                -- 장소당 1회: 중복 인증·중복 보상 차단
);
create index if not exists location_visits_loc on public.location_visits(location_id);
create table if not exists public.collections (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('character','online_place','npc','knowledge','jeotgal','postcard','treasure','achievement')),
  item_id text not null, method text, found_at timestamptz not null default now(),
  primary key (user_id, item_type, item_id)
);
create index if not exists collections_item on public.collections(item_type, item_id);
create table if not exists public.user_quests (
  user_id uuid not null references auth.users(id) on delete cascade,
  quest_id text not null, claimed_at timestamptz,
  primary key (user_id, quest_id)
);
create table if not exists public.user_fermentation (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  recipe_id text not null, ingredients jsonb not null, ratio int, add_order text[], jar_skin text,
  started_at timestamptz not null, ready_at timestamptz not null,
  status text not null check (status in ('aging','done')),
  score int, grade text, finished_at timestamptz,
  primary key (user_id, id)
);
create table if not exists public.community_jar_contributions (
  id bigserial primary key,
  jar_id text not null references public.community_jars(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null, amount int not null default 1 check (amount between 1 and 10),
  source text check (source in ('real','online')),
  created_at timestamptz not null default now()
);
create index if not exists cjc_jar on public.community_jar_contributions(jar_id, created_at);
create table if not exists public.postcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id text not null, template text not null default 'classic',
  image_path text not null, message text check (char_length(message) <= 120),
  uses_user_photo boolean not null default false,
  photo_consent boolean not null default false,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  check (not uses_user_photo or photo_consent)    -- 사용자 사진은 동의가 있어야만 저장
);
create index if not exists postcards_user on public.postcards(user_id, created_at desc);
-- 4단계(시간 우체국)
create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade,
  body text not null check (char_length(body) <= 500), is_hidden boolean not null default false, created_at timestamptz default now()
);
create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(), sender_id uuid references auth.users(id) on delete cascade,
  body text not null check (char_length(body) <= 1000), open_at timestamptz default now(),
  is_public boolean default false, is_hidden boolean default false, created_at timestamptz default now()
);
-- 시간 우체국 확장 컬럼
alter table public.letters add column if not exists nickname text check (char_length(nickname) <= 12);
alter table public.letters add column if not exists stamp text;
alter table public.letters add column if not exists report_count int not null default 0;
create index if not exists letters_public on public.letters(open_at desc) where is_public and not is_hidden;
create table if not exists public.reports (
  id bigserial primary key, reporter_id uuid references auth.users(id) on delete set null,
  target_table text not null, target_id uuid not null, reason text, status text not null default 'open', created_at timestamptz default now()
);

-- ── RLS ───────────────────────────────────────────────
do $$ declare t text; begin
  foreach t in array array['locations','characters','knowledge_documents','npcs','quests','fermentation_recipes','events','community_jars','shops','announcements']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s read" on public.%I', t, t);
    execute format('create policy "%s read" on public.%I for select using (true)', t, t);
    execute format('drop policy if exists "%s admin write" on public.%I', t, t);
    execute format('create policy "%s admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

-- 본인 데이터 읽기 전용 (쓰기는 commit_game_action 등 서버 함수 전용)
do $$ declare t text; begin
  foreach t in array array['game_saves','location_visits','collections','user_quests','user_fermentation','community_jar_contributions']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s own read" on public.%I', t, t);
    execute format('create policy "%s own read" on public.%I for select using (auth.uid() = user_id)', t, t);
  end loop;
end $$;

alter table public.profiles enable row level security;
drop policy if exists "profile read" on public.profiles;
create policy "profile read" on public.profiles for select using (auth.uid() = id or public.is_admin());
-- profiles 쓰기 정책 없음: 닉네임·레벨 등은 서버 엔진이 game_saves 와 함께 갱신 (권한 상승·수치 조작 방지)

alter table public.postcards enable row level security;
drop policy if exists "postcard read" on public.postcards;
create policy "postcard read" on public.postcards for select using (is_public or auth.uid() = user_id);
-- 엽서 쓰기/삭제는 서버 API(Storage 파일과 함께 처리)에서만

alter table public.guestbook enable row level security;
alter table public.letters enable row level security;
-- 편지 읽기·쓰기는 서버 API(검증·필터·신고 처리)를 거칩니다. 본인 편지만 직접 읽기 허용
drop policy if exists "letters own read" on public.letters;
create policy "letters own read" on public.letters for select using (auth.uid() = sender_id);
alter table public.reports enable row level security;
drop policy if exists "report admin" on public.reports;
create policy "report admin" on public.reports for select using (public.is_admin());

-- ── 서버 전용 함수 ─────────────────────────────────────
create or replace function public.init_game_save(p_user uuid, p_state jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare v int;
begin
  insert into profiles(id) values (p_user) on conflict do nothing;
  insert into game_saves(user_id, state) values (p_user, p_state) on conflict do nothing;
  select version into v from game_saves where user_id = p_user;
  return v;
end $$;

create or replace function public.commit_game_action(p_user uuid, p_version int, p_state jsonb, p_effects jsonb, p_stats jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare
  v int;
  jar jsonb := p_effects->'jar';
  open_jar text;
begin
  update game_saves set state = p_state, version = version + 1, updated_at = now()
   where user_id = p_user and version = p_version
  returning version into v;
  if not found then raise exception 'version_conflict'; end if;

  if p_effects ? 'visit' then
    insert into location_visits(user_id, location_id, method)
    values (p_user, p_effects->'visit'->>'location_id', p_effects->'visit'->>'method')
    on conflict do nothing;
    if not found then raise exception 'duplicate_visit'; end if;
  end if;

  insert into collections(user_id, item_type, item_id, method)
  select p_user, e->>'item_type', e->>'item_id', e->>'method'
    from jsonb_array_elements(coalesce(p_effects->'collections', '[]'::jsonb)) e
  on conflict do nothing;

  if p_effects ? 'questClaim' then
    insert into user_quests(user_id, quest_id, claimed_at) values (p_user, p_effects->>'questClaim', now())
    on conflict (user_id, quest_id) do nothing;
    if not found then raise exception 'duplicate_claim'; end if;
  end if;

  if jar is not null then
    insert into user_fermentation(user_id, id, recipe_id, ingredients, ratio, add_order, jar_skin, started_at, ready_at, status, score, grade, finished_at)
    values (p_user, jar->>'id', jar->>'typeId', jar->'ingredients', (jar->>'ratio')::int,
            array(select jsonb_array_elements_text(jar->'order')), jar->>'jarSkin',
            to_timestamp((jar->>'startedAt')::double precision / 1000), to_timestamp((jar->>'readyAt')::double precision / 1000),
            jar->>'status', (jar->>'score')::int, jar->>'grade',
            case when jar ? 'finishedAt' then to_timestamp((jar->>'finishedAt')::double precision / 1000) end)
    on conflict (user_id, id) do update set status = excluded.status, score = excluded.score, grade = excluded.grade, finished_at = excluded.finished_at;
  end if;

  if p_effects ? 'contribution' then
    select id into open_jar from community_jars where status = 'open' order by starts_at limit 1 for update;
    if open_jar is not null then
      insert into community_jar_contributions(jar_id, user_id, item_id, source)
      values (open_jar, p_user, p_effects->'contribution'->>'item_id', p_effects->'contribution'->>'source');
      update community_jars set progress = progress + 1,
             status = case when progress + 1 >= goal then 'completed' else status end
       where id = open_jar;
    end if;
  end if;

  update profiles set
    nickname = coalesce(left(p_stats->>'nickname', 12), nickname),
    avatar = coalesce(p_stats->>'avatar', avatar),
    level = coalesce((p_stats->>'level')::int, level),
    exp = coalesce((p_stats->>'exp')::int, exp),
    coins = coalesce((p_stats->>'coins')::int, coins),
    artisan_exp = coalesce((p_stats->>'artisan_exp')::int, artisan_exp),
    updated_at = now()
  where id = p_user;
  return v;
end $$;

create or replace function public.reset_game_save(p_user uuid, p_state jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare v int;
begin
  update game_saves set state = p_state, version = version + 1, updated_at = now() where user_id = p_user returning version into v;
  delete from location_visits where user_id = p_user;
  delete from collections where user_id = p_user;
  delete from user_quests where user_id = p_user;
  delete from user_fermentation where user_id = p_user;
  update profiles set level = 1, exp = 0, coins = 0, artisan_exp = 0 where id = p_user;
  return v;
end $$;

revoke all on function public.init_game_save(uuid, jsonb) from public;
revoke all on function public.commit_game_action(uuid, int, jsonb, jsonb, jsonb) from public;
revoke all on function public.reset_game_save(uuid, jsonb) from public;
-- Supabase 는 public 스키마 함수에 anon/authenticated 실행 권한을 '직접' 부여하므로 public 회수만으로는 부족합니다.
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on function public.init_game_save(uuid, jsonb) from anon, authenticated;
    revoke all on function public.commit_game_action(uuid, int, jsonb, jsonb, jsonb) from anon, authenticated;
    revoke all on function public.reset_game_save(uuid, jsonb) from anon, authenticated;
    revoke all on function public.handle_new_user() from anon, authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.init_game_save(uuid, jsonb) to service_role;
    grant execute on function public.commit_game_action(uuid, int, jsonb, jsonb, jsonb) to service_role;
    grant execute on function public.reset_game_save(uuid, jsonb) to service_role;
  end if;
end $$;

-- ── 관리자 통계 뷰 (Service Role 로만 조회) ────────────
create or replace view public.admin_stats as
select
  (select count(*) from profiles) as users,
  (select count(*) from location_visits) as visits,
  (select count(*) from location_visits where method = 'qr') as qr_visits,
  (select count(*) from location_visits where method = 'gps') as gps_visits,
  (select count(*) from collections where item_type = 'character') as character_finds,
  (select count(*) from user_fermentation where status = 'done') as jars_done,
  (select count(*) from postcards) as postcards;
revoke all on public.admin_stats from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then revoke all on public.admin_stats from anon, authenticated; end if;
end $$;

-- ── Storage 버킷 ──────────────────────────────────────
-- content   : 관리자가 올리는 관광지 사진·공식 캐릭터 원화 (공개 읽기, 업로드는 서버/관리자)
-- postcards : 사용자 엽서 이미지 (비공개, 서버가 서명 URL로 제공)
do $$ begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public) values ('content', 'content', true) on conflict (id) do nothing;
    insert into storage.buckets (id, name, public) values ('postcards', 'postcards', false) on conflict (id) do nothing;
  end if;
end $$;

-- ── Realtime: 공동 항아리 게이지 ──────────────────────
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'community_jars') then
    alter publication supabase_realtime add table public.community_jars;
  end if;
end $$;

-- ── 첫 관리자 지정 (가입 후 한 번 실행) ───────────────
-- update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
-- 또는 환경변수 ADMIN_EMAILS 에 이메일을 넣으면 관리자 페이지 접근이 허용됩니다.
