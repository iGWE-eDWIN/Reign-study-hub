-- Run after 001_initial.sql. Private enquiries are accepted only through the
-- protected server endpoint; anonymous REST access is intentionally excluded.
-- Restore the session role if the SQL Editor was testing an application role.
reset role;

begin;

create table public.service_enquiries (
 id uuid primary key default gen_random_uuid(),
 reference text unique not null default ('SRV-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 service_id uuid references public.services(id) on delete set null,
 service_slug text not null, service_title text not null,
 full_name text not null, email text not null, phone text not null,
 answers jsonb not null default '{}' check(jsonb_typeof(answers)='object'),
 document_path text check(document_path is null or document_path ~ '^applications/[0-9a-f-]+\.pdf$'),
 agree_privacy boolean not null check(agree_privacy), consent_contact boolean not null check(consent_contact),
 status text not null default 'new' check(status in ('new','reviewing','approved','rejected','contacted')),
 admin_notes text not null default '', email_sent boolean not null default false, email_error text,
 created_at timestamptz not null default now()
);
alter table public.service_enquiries enable row level security;
revoke all on public.service_enquiries from anon, authenticated;
grant all on public.service_enquiries to service_role;
grant select,insert,update,delete on public.service_enquiries to authenticated;
create policy admin_all on public.service_enquiries for all to authenticated using(public.is_admin()) with check(public.is_admin());
create index service_enquiries_created on public.service_enquiries(created_at desc);
create index service_enquiries_status on public.service_enquiries(status);

commit;
