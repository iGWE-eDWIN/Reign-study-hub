reset role;
begin;

-- Public experiences are moderated in the existing Testimonials editor.
-- Submitter email/private contact information is deliberately not collected.
alter table public.testimonials add column submitted_by_public boolean not null default false;
alter table public.testimonials add column agreed_to_publish boolean not null default false;
alter table public.testimonials add column created_at timestamptz not null default now();
create index testimonials_review on public.testimonials(is_published,created_at desc);

-- No direct anonymous uploads or reads. Portraits are served through an endpoint
-- that checks publication state; administrators can preview pending portraits.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('testimonial-portraits','testimonial-portraits',false,3145728,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy testimonial_portraits_admin on storage.objects for all to authenticated
using(public.is_admin() and bucket_id='testimonial-portraits')
with check(public.is_admin() and bucket_id='testimonial-portraits');

commit;
