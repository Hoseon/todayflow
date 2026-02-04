create extension if not exists pgcrypto;

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  due_date date not null,
  completed boolean not null default false,
  priority int not null default 2 check (priority between 1 and 3),
  delete_flag text not null default 'N' check (delete_flag in ('Y', 'N')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists tasks_delete_flag_idx on public.tasks(delete_flag);

create or replace function public.touch_tasks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.touch_tasks_updated_at();

alter table public.tasks enable row level security;

-- MVP 단계: 익명 사용자도 CRUD 허용 (서비스 오픈 전에는 auth 기반 정책으로 교체 권장)
drop policy if exists "tasks_select_all" on public.tasks;
create policy "tasks_select_all" on public.tasks for select using (true);

drop policy if exists "tasks_insert_all" on public.tasks;
create policy "tasks_insert_all" on public.tasks for insert with check (true);

drop policy if exists "tasks_update_all" on public.tasks;
create policy "tasks_update_all" on public.tasks for update using (true) with check (true);

drop policy if exists "tasks_delete_all" on public.tasks;
create policy "tasks_delete_all" on public.tasks for delete using (true);
