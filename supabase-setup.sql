-- 둘의 여행 앨범: Supabase 한 번만 실행하는 설정
-- Supabase 대시보드 → SQL Editor에 통째로 붙여 넣고 Run 하세요.
-- 맨 아래 members에 두 사람의 이메일을 꼭 바꿔 넣어 주세요.

-- 1) 앨범에 들어올 수 있는 사람 목록
create table if not exists public.members (
  email text primary key
);
alter table public.members enable row level security;  -- 정책이 없으니 브라우저에서는 못 읽어요

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.members where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- 2) 여행·사진·우리 정보를 담는 문서 표 (collection: meta / trips / photos)
create table if not exists public.docs (
  collection text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);
alter table public.docs enable row level security;

drop policy if exists "members read docs" on public.docs;
drop policy if exists "members insert docs" on public.docs;
drop policy if exists "members update docs" on public.docs;
drop policy if exists "members delete docs" on public.docs;
create policy "members read docs"   on public.docs for select to authenticated using (public.is_member());
create policy "members insert docs" on public.docs for insert to authenticated with check (public.is_member());
create policy "members update docs" on public.docs for update to authenticated using (public.is_member()) with check (public.is_member());
create policy "members delete docs" on public.docs for delete to authenticated using (public.is_member());

-- 다른 사람이 올린 사진이 바로 보이도록 실시간 알림 켜기
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- 3) 사진 저장소 (비공개 버킷)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

drop policy if exists "members read photos" on storage.objects;
drop policy if exists "members upload photos" on storage.objects;
drop policy if exists "members delete photos" on storage.objects;
create policy "members read photos"   on storage.objects for select to authenticated using (bucket_id = 'photos' and public.is_member());
create policy "members upload photos" on storage.objects for insert to authenticated with check (bucket_id = 'photos' and public.is_member());
create policy "members delete photos" on storage.objects for delete to authenticated using (bucket_id = 'photos' and public.is_member());

-- 4) 두 사람 이메일 (Authentication → Users에서 만든 계정과 같은 이메일)
insert into public.members (email) values
  ('first@example.com'),
  ('second@example.com')
on conflict do nothing;
