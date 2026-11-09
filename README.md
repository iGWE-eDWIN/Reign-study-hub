# Reign Study Hub

Responsive Next.js App Router application with Supabase content management, private applicant PDFs, admin authentication, and email notifications. The original `index.html` and `assets/` are retained as source material. The site can preview original content without Supabase; submissions and admin require configuration.

## Local setup

Use Node.js 22 or later and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Visit http://localhost:3000. Set `NEXT_PUBLIC_SITE_URL` to the exact browser origin, including port; submission origin validation uses it. Run `npm run typecheck`, `npm test`, and `npm run build` before deploying. Commit the generated package-lock.json to keep dependency versions reproducible.

## Supabase setup

1. Create a Supabase project. Copy its project URL, anon key and service-role key into `.env.local`. Never prefix the service-role key with `NEXT_PUBLIC_`.
2. Run `supabase/migrations/001_initial.sql` in the SQL Editor on a fresh project (or run `supabase db push` with the CLI). It creates all tables, indexes, RLS policies, functions and both buckets. Do not rerun this initial migration against an already migrated database.
3. Confirm Storage has `documents` (private, PDF only, 10MB) and `site-media` (public read, image only, 10MB). The migration restricts writes to admins; applicant uploads use server-issued signed upload tokens. Document viewing uses five-minute admin signed URLs.
4. Under Authentication > URL Configuration, set the Site URL and allow `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback` as redirect URLs. Disable public signup if you only want administrator accounts.
5. Set `ADMIN_SEED_EMAIL` and a strong `ADMIN_SEED_PASSWORD` of at least 12 characters. Run `npm run seed`. The script inserts missing original content and creates/promotes the specified Auth user through `admin_profiles`. Reruns preserve existing content and account passwords. Remove seed credentials from production environment variables after setup.
6. Sign in at `/admin/login`. Admin roles are assigned only through server credentials or the SQL dashboard. Authenticated users without an admin profile have no admin access.

The schema includes the requested tables plus editable programme levels and appointment service types, admin profiles, upload intents and persistent rate limits. Public content uses published/active flags. Public submission INSERT grants exclude admin-only columns. Public grants permit direct inserts as requested; CAPTCHA and HTTP rate limits protect the application endpoints, not direct Supabase REST inserts. Enable Turnstile for the website and monitor Supabase usage. No applicant data is publicly readable.

## Repair admin login

If an account was manually recreated or its password differs from the seed credentials, set `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` in `.env.local`, then run `npm run admin:reset`. This explicitly resets that account's password, confirms its email, creates it if missing, and restores its admin profile without reseeding content. It verifies password login and admin access using the public key. The normal seed command continues to preserve existing passwords. Restart the local server after changing environment variables; for Vercel, ensure the same Supabase project credentials are configured and redeploy after changes.

## Email setup

Notifications default to `reignstudyabroad@gmail.com`. Database saves succeed even if notification delivery fails; the admin table and detail view show pending/failed delivery and its error.

### Resend

Set `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `EMAIL_FROM` to a sender allowed by your Resend account. Without a verified sending domain, use Resend's permitted test sender and create the account with `reignstudyabroad@gmail.com`; delivery is restricted to the account owner. Verify your domain for production sending. Check your account's current free allowance before enabling auto-replies.

### Gmail SMTP

Set `EMAIL_PROVIDER=smtp`, `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=reignstudyabroad@gmail.com`, and `SMTP_PASSWORD` to a Gmail App Password created after enabling two-step verification. Set `EMAIL_FROM` to that mailbox. This uses the same notification utility.

Application notifications include a PDF link valid for 24 hours and attach the PDF when it is under 5MB. Reply-to is the applicant's email. `SEND_AUTOREPLIES=false` is the default; enable only once your sender supports arbitrary recipients and your free limits allow it. Failed notifications are flagged for manual follow-up; automatic retries are not implemented.

## Optional Turnstile

Create a free Cloudflare Turnstile widget for localhost and your domain. Set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`, then rebuild. A honeypot and database-backed per-IP request limits are also enabled. On Vercel, the platform-forwarded client IP is hashed before storage.

## Manage content

Use `/admin` to manage applications, appointments, messages and all public content. Tables offer search, filters and pagination; submissions can be exported to CSV. Applications include notes, status and private PDF access. Deletes require confirmation.

Manage hero slides, five services, testimonials, posts, FAQs, partners, team members, destinations, programme levels and appointment service types in their own editors. Upload images from each editor, then save the record. Content fields support plain text and paragraphs, not arbitrary HTML. Site Settings contains contacts, offices, working hours, WhatsApp, social links, verified counters, company copy, document checklists, optional fee, privacy policy and map URL. JSON fields show format examples. Admin saves invalidate public content; cached content otherwise refreshes every five minutes.

## Vercel deployment

1. Push this folder to your Git repository and import it into Vercel using the Next.js preset.
2. Add the configured environment variables from `.env.example`. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin and configure matching Supabase Auth redirects and Turnstile hostnames.
3. Deploy, then run the checks in `audit/verification.md` against production. Public `NEXT_PUBLIC_` values are embedded at build time; redeploy when changing them.
4. Configure a custom domain and verify the sending domain if using Resend. Keep Supabase and mail secrets in environment variables only. Deployment and external account configuration are manual until credentials and access are available.

## Content awaiting your input

See `audit/rebuild-audit.md`. Statistics, testimonials, partners, hours and social accounts stay empty/hidden until configured. FAQs and News & Insights include generated starter content: 12 FAQs and three evergreen study-planning articles. These display when the corresponding published database collection is empty or Supabase is not configured; published admin content replaces the starter collection. The seed script inserts missing starter FAQs and posts without overwriting existing entries. Starter articles have no publication date to avoid implying a dated news event. The privacy page and programme-specific document checklists explicitly identify missing content. Service cards use verified photographs of European universities from Wikimedia Commons. Photo authors, source links and Creative Commons licenses appear under “University photo credits” below the carousel. Images are lazy-loaded directly from Wikimedia; replace images in /admin/services when needed. Processing fees are hidden when blank, and no payment integration is included.

## Verification status

See `audit/verification.md` for actual checks and remaining live acceptance steps. A Lighthouse target is not a measured result. Live database, storage, email and admin checks require a configured Supabase project and sender.

## Service-specific enquiries

Run `supabase/migrations/002_service_enquiries.sql` in Supabase SQL Editor **after** the initial migration and before deploying the service enquiry forms. Existing projects should run only this new migration, not rerun `001_initial.sql`.

Each published service links to `/services/[slug]/enquire`. The form is generated from its current title and description on both client and server. Built-in profiles cover Yellow Card, passports, academic selection/admission, scholarship sponsorship, study visas and pre-departure support. Passport corrections and visa refusals reveal conditional detail fields. Supporting documents use the existing private PDF upload flow; Yellow Card enquiries require a passport data page PDF. Other enquiry documents can be supplied when available.

For a new service outside those categories, put an `APPLICATION REQUIREMENTS` heading in the service content and list each required detail or document on its own numbered/bulleted line. The generator recognises explicit requirement items and document names; it does not use an AI model to interpret arbitrary prose. If there are no explicit requirements, it provides a service-labelled requirements enquiry. Review the live preview in the service editor before publishing. Form changes take effect after saving, with server-side validation generated from the published service. Enquiries are available under **Admin → Service enquiries**, with status, notes, private PDF access and CSV export. Email delivery failures do not discard enquiries.

Live acceptance: submit one service enquiry (including Yellow Card PDF), inspect it in the admin, test PDF access and email status, then publish a new service with an explicit requirements list and verify its generated form. Live database, storage and email acceptance require a configured Supabase project.

## Public testimonials

Run `supabase/migrations/003_public_testimonials.sql` once in Supabase SQL Editor before deploying public testimonials. It extends the existing testimonials table and creates the private `testimonial-portraits` bucket. It includes `reset role` for SQL sessions previously switched to an application role.

Visitors can use `/testimonials/share`, linked from the homepage student experiences section and footer, to submit their name, course/service, experience and an optional JPEG/PNG/WebP portrait up to 3MB. Publication consent is required. New submissions are unpublished. Under **Admin → Testimonials**, review/edit the text or photo, check **Published**, then save. The portrait endpoint only serves pending images to administrators; published images are visible to site visitors, and unpublishing prevents further public reads. Portraits are not sent through Next image optimisation caches. Public submission uses origin checking, rate limiting, optional Turnstile, a honeypot, image signatures and size validation. No submitter email is collected.

Live acceptance: submit with and without a portrait; check the pending entry in admin; confirm its photo is hidden to logged-out visitors; edit and publish; check homepage display, then unpublish and confirm the photo becomes unavailable publicly.
