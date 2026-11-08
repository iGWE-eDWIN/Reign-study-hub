create extension if not exists pgcrypto;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin')
);
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_profiles where user_id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table public.applications (
 id uuid primary key default gen_random_uuid(), reference text unique not null default ('RSH-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 full_name text not null, email text not null, phone text not null, date_of_birth date not null,
 place_of_birth text not null, state_of_origin text not null, lga text not null,
 passport_number text, passport_issue_date date, passport_expiry_date date, passport_place_of_issue text,
 marital_status text not null, first_choice_country text not null, second_choice_country text,
 preferred_courses text not null, programme_level text not null, document_path text not null,
 extra_details jsonb not null default '{}',
 status text not null default 'new' check(status in ('new','reviewing','approved','rejected','contacted')),
 admin_notes text not null default '', email_sent boolean not null default false, email_error text,
 created_at timestamptz not null default now()
);
create table public.appointments (
 id uuid primary key default gen_random_uuid(), reference text unique not null default ('APT-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 full_name text not null, email text not null, phone text not null, service_type text not null,
 destination text not null, appointment_date date not null, appointment_type text not null check(appointment_type in ('phone call','office visit')),
 comment text not null default '', referred_by text not null default '',
 status text not null default 'pending' check(status in ('pending','confirmed','completed','cancelled')),
 email_sent boolean not null default false, email_error text, created_at timestamptz not null default now()
);
create table public.contact_messages (
 id uuid primary key default gen_random_uuid(), reference text unique not null default ('MSG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 name text not null, email text not null, phone text not null, subject text not null, message text not null,
 is_read boolean not null default false, email_sent boolean not null default false, email_error text, created_at timestamptz not null default now()
);
create table public.services (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, short_description text not null default '', content text not null default '', image_url text not null default '', is_published boolean not null default false, sort_order int not null default 0);
create table public.testimonials (id uuid primary key default gen_random_uuid(), name text not null, title text not null default '', quote text not null, image_url text not null default '', is_published boolean not null default false);
create table public.posts (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, excerpt text not null default '', content text not null default '', cover_image_url text not null default '', is_published boolean not null default false, published_at timestamptz);
create table public.faqs (id uuid primary key default gen_random_uuid(), question text not null, answer text not null, sort_order int not null default 0, is_published boolean not null default false);
create table public.slides (id uuid primary key default gen_random_uuid(), tagline text not null default '', headline text not null, subtext text not null default '', image_url text not null default '', cta_label text not null default 'Apply Now', cta_link text not null default '/apply', sort_order int not null default 0, is_active boolean not null default false);
create table public.partners (id uuid primary key default gen_random_uuid(), name text not null, logo_url text not null default '', sort_order int not null default 0, is_published boolean not null default false);
create table public.destinations (id uuid primary key default gen_random_uuid(), name text not null unique, flag_emoji text not null default '', is_active boolean not null default true, sort_order int not null default 0, image_url text not null default '', description text not null default '', requirements jsonb not null default '[]');
create table public.team_members (id uuid primary key default gen_random_uuid(), name text not null, role text not null, bio text not null default '', image_url text not null default '', sort_order int not null default 0, is_published boolean not null default false);
create table public.programme_levels (id uuid primary key default gen_random_uuid(), name text not null unique, sort_order int not null default 0, is_active boolean not null default true);
create table public.appointment_service_types (id uuid primary key default gen_random_uuid(), name text not null unique, sort_order int not null default 0, is_active boolean not null default true);
create table public.site_settings (
 id int primary key default 1 check(id = 1), site_name text not null, tagline text not null default '', parent_company text not null default '',
 logo_url text not null default '/assets/logo-header.png', addresses jsonb not null default '[]', phone_numbers jsonb not null default '[]',
 whatsapp_number text not null default '', email text not null, working_hours text not null default '', social_links jsonb not null default '{}', stats jsonb not null default '[]',
 about_text text not null default '', vision_text text not null default '', mission_text text not null default '', values_text text not null default '',
 processing_fee text not null default '', map_embed_url text not null default '', privacy_text text not null default '', application_process jsonb not null default '[]', document_checklists jsonb not null default '[]'
);
-- These internal tables are service-role-only; no public policies.
create table public.rate_limits (key text primary key, count int not null default 1, reset_at timestamptz not null);
create table public.upload_intents (id uuid primary key default gen_random_uuid(), path text not null unique, ip_hash text not null, expires_at timestamptz not null default now() + interval '30 minutes', consumed boolean not null default false);

create or replace function public.consume_rate_limit(p_key text, p_limit int, p_window int) returns boolean
language plpgsql security definer set search_path=public as $$
declare current_count int;
begin
 insert into public.rate_limits(key,count,reset_at) values(p_key,1,now()+make_interval(secs=>p_window))
 on conflict(key) do update set count=case when rate_limits.reset_at < now() then 1 else rate_limits.count+1 end,
 reset_at=case when rate_limits.reset_at < now() then now()+make_interval(secs=>p_window) else rate_limits.reset_at end
 returning count into current_count;
 return current_count <= p_limit;
end; $$;
revoke all on function public.consume_rate_limit(text,int,int) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text,int,int) to service_role;

-- RLS and explicit grants; never rely on the project's default grants.
do $$ declare t text; begin
 foreach t in array array['admin_profiles','applications','appointments','contact_messages','services','testimonials','posts','faqs','slides','partners','destinations','team_members','programme_levels','appointment_service_types','site_settings','rate_limits','upload_intents'] loop
 execute format('alter table public.%I enable row level security', t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 end loop;
 foreach t in array array['applications','appointments','contact_messages','services','testimonials','posts','faqs','slides','partners','destinations','team_members','programme_levels','appointment_service_types','site_settings'] loop
 execute format('grant select, insert, update, delete on public.%I to authenticated',t);
 execute format('create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t);
 end loop;
 foreach t in array array['services','testimonials','posts','faqs','partners','team_members'] loop
 execute format('grant select on public.%I to anon',t);
 execute format('create policy published_read on public.%I for select to anon, authenticated using (is_published = true)',t);
 end loop;
 foreach t in array array['slides','destinations','programme_levels','appointment_service_types'] loop
 execute format('grant select on public.%I to anon',t);
 execute format('create policy active_read on public.%I for select to anon, authenticated using (is_active = true)',t);
 end loop;
end $$;
grant select on public.admin_profiles to authenticated;
create policy own_admin_profile on public.admin_profiles for select to authenticated using(user_id = auth.uid());
grant select on public.site_settings to anon;
create policy settings_read on public.site_settings for select to anon,authenticated using(true);
-- Column grants prevent public callers from supplying admin status, notes, timestamps or delivery flags.
grant insert (full_name,email,phone,date_of_birth,place_of_birth,state_of_origin,lga,passport_number,passport_issue_date,passport_expiry_date,passport_place_of_issue,marital_status,first_choice_country,second_choice_country,preferred_courses,programme_level,document_path,extra_details) on public.applications to anon;
create policy public_application_insert on public.applications for insert to anon with check(status='new' and admin_notes='' and email_sent=false and email_error is null and document_path ~ '^applications/[0-9a-f-]+\.pdf$');
grant insert (full_name,email,phone,service_type,destination,appointment_date,appointment_type,comment,referred_by) on public.appointments to anon;
create policy public_appointment_insert on public.appointments for insert to anon with check(status='pending' and email_sent=false and email_error is null and appointment_date >= current_date);
grant insert (name,email,phone,subject,message) on public.contact_messages to anon;
create policy public_contact_insert on public.contact_messages for insert to anon with check(is_read=false and email_sent=false and email_error is null);
create index applications_created on public.applications(created_at desc);
create index applications_status on public.applications(status);
create index appointments_created on public.appointments(created_at desc);
create index messages_created on public.contact_messages(created_at desc);
create index posts_publication on public.posts(is_published,published_at desc);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('documents','documents',false,10485760,array['application/pdf']),
 ('site-media','site-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif','image/gif'])
on conflict(id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy media_read on storage.objects for select to anon,authenticated using(bucket_id='site-media');
create policy admin_storage_all on storage.objects for all to authenticated using(public.is_admin() and bucket_id in ('documents','site-media')) with check(public.is_admin() and bucket_id in ('documents','site-media'));
