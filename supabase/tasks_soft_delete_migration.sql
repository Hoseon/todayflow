alter table public.tasks
  add column if not exists delete_flag text not null default 'N';

update public.tasks
set delete_flag = 'N'
where delete_flag is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_delete_flag_check'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_delete_flag_check
      check (delete_flag in ('Y', 'N'));
  end if;
end $$;

create index if not exists tasks_delete_flag_idx on public.tasks(delete_flag);
