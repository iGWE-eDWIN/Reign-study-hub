# Verification record

Date: 2026-11-05. This distinguishes code checks from live acceptance tests.

## Completed

- Seven focused tests pass: public contact validation/spam checks; application date/consent/state/destination validation; appointment dates/types; PDF MIME/size/header enforcement; CSV quoting/formula protection; safe/WhatsApp links; admin link/content validation.
- Parsed/transpiled 56 TypeScript source files with TypeScript 5.9.3: zero syntax diagnostics. This does not establish that the complete Next.js application typechecks.
- Static inventory checks passed for five original services, 43 destination choices, three offices, four local public assets and empty unverified counters.
- Static SQL inspection confirms 17 declared table names are included in the RLS-enabling loop, private/public bucket declarations, admin role checks and storage policies. SQL has not been executed against Postgres in this environment.
- Reviewed admin route proxy, server session/role checks, private document links, notification failure flags, content invalidation and server-only service-role usage.
- Reviewed the original logo visually. Preserved original HTML/assets and existing copy inventory.

The focused tests were run with cached tooling installed in `/tmp/reign-check` because full dependency installation could not finish:

```bash
NODE_PATH=/tmp/reign-check/node_modules node --import /tmp/reign-check/node_modules/tsx/dist/loader.mjs tests/forms.test.ts
```

Normal setup should use `npm install` followed by `npm test`.

## Blocked in this environment

- `npm install`: DNS failure `EAI_AGAIN` resolving registry.npmjs.org. Offline installation also failed because @hookform/resolvers is absent from the cache.
- `npm run build`: `next: not found`, because project dependencies could not be installed.
- `npm run typecheck`: `tsc: not found` in the project. The separate cached syntax check above is not a replacement.
- No complete runtime, browser, screen-width, accessibility audit or Lighthouse run; no score is claimed.
- Supabase migrations, seed execution, RLS behavior, real form submissions, private storage access, admin login and email delivery require configured external services. No `.env.local` was present and no live submissions or emails were sent.

## Required acceptance checks after configuration

1. Install dependencies, commit package-lock.json, run `npm run typecheck`, `npm test`, and `npm run build`. Resolve any failures before deployment. Start the production server with `npm start`.
2. Apply the migration to a fresh Supabase project, run `npm run seed`, and verify all content/settings/options are present. Rerun the seed and confirm it preserves edited rows and account passwords.
3. Submit a test application with a real compiled PDF under 10MB. Match the success reference to its applications row and private storage object. Confirm the email arrives at reignstudyabroad@gmail.com, includes all fields, has a working expiring link, and attaches PDFs under 5MB.
4. Submit an appointment and contact message. Match each reference to its row, email and admin entry. Confirm appointment status/read-state changes, filtering, pagination, CSV export, internal notes and deletes.
5. Open the applicant PDF from admin; verify an unauthenticated caller cannot read documents or any applicant/message/appointment rows. Verify an authenticated non-admin cannot read submissions, change content, write storage or grant itself an admin role. Verify expired signed links fail.
6. Disable the mail provider for one test. Confirm the record remains saved, the user receives a reference, and admin shows `email_sent=false` plus an error. Restore configuration. Notification retries require manual follow-up.
7. Exercise malformed fields, past/impossible dates, mismatched passport dates, fake PDF headers, wrong MIME types, over-10MB files, honeypots, expired/reused upload intents, expired CAPTCHA and repeated requests. Confirm rejection without duplicate saved records. Check fresh PDF upload after a failed application attempt.
8. Test login/logout, non-admin denial, protected admin/export routes, password-reset email and callback. Change content and verify public pages update after saving. Check sitemap.xml, robots.txt and social previews.
9. At 360, 768, 1024 and 1440 pixels: inspect every public route, forms, hero controls, mobile navigation and admin tables/editors. Confirm no page-level horizontal scrolling, readable copy, keyboard focus, visible validation, dialog focus trapping, touch targets and reduced-motion behavior. Admin tables intentionally have their own horizontal scroll area.
10. Run Lighthouse on a production deployment for home, application, appointment and contact pages. Measure performance, accessibility, best practices and SEO against the requested 90+ target; optimise based on actual results.

## Operational notes

- Public Supabase INSERT grants exist as requested. Endpoint honeypot/CAPTCHA/rate checks do not cover callers who directly use the Supabase REST API. If stronger protection is required, revoke anonymous direct INSERT grants and require the server endpoints exclusively; retain public SELECT policies for published content.
- Unsubmitted uploads may remain in the private bucket. Periodically review expired `upload_intents` and remove their unreferenced storage objects, then old intent and rate-limit rows. Never delete a document referenced by an application.
- Application deletes remove the database row first and then the PDF; admin reports storage cleanup failures. Review these before removing orphaned files manually.

## Follow-up after local dependency installation

The user installed dependencies successfully. Fixed the resulting TypeScript errors in dynamic admin queries, storage-error handling and validation-message formatting. `npm run typecheck` now passes, and all seven focused tests pass with `node --import tsx tests/forms.test.ts`.

`npm run dev` cannot bind port 3000 inside this managed session (`listen EPERM`). Run it in the user's terminal. The production build reached compilation but could not fetch Montserrat and Open Sans from fonts.googleapis.com in this network-restricted session. No successful production build or browser verification is claimed.

## Hero and image-loading update

Replaced the failing original hero URL with three distinct photo URLs already represented in the original site (students, UK, Canada). First-slide image loads eagerly; later slide images mount when first selected and use lazy loading. Original Unsplash photography now loads directly in the browser rather than through the server image optimiser, avoiding the reported optimiser timeout requests. A local branded decorative fallback replaces failed images. Local and Supabase images retain Next.js optimisation. Header and login logos load eagerly. Typecheck and all seven existing focused tests pass; external photo delivery and interactive browser behavior remain unverified in this restricted environment.

## Services carousel

Replaced the shared service-card grid with a responsive Embla carousel on Home and the Services overview. Added five locally stored AI-generated illustrative service photographs, compressed to WebP, with native lazy loading and responsive image sizing. Admin-uploaded images override the defaults. Added swipe/keyboard navigation, previous/next controls with disabled boundary states, position dots, consistent card sizing and mobile next-card previews. All five local image paths were checked. Typecheck and the seven existing focused tests pass. Interactive browser and breakpoint verification are still pending because browser access is unavailable in this session.

## Destination carousel update

Typecheck and seven existing focused tests pass. Static content verification confirms 43 destination options are preserved, ten have photo cards and eight primary photo replacements match the verified attribution manifest. Browser interaction, responsive rendering and external CDN delivery remain unverified in this session. No new live backend or email checks were performed.

## Single-image destination slider refinement

Destination slides now occupy 100% of the viewport at every breakpoint, with no adjacent-card preview. Increased desktop image height to 620px and mobile height to 500px. Caption elements fade and rise in sequence after slide entry and image readiness; a bounded text reveal prevents captions remaining invisible when external images stall. Re-entry replays the caption transition. Native image lazy loading, automatic sliding, pause controls and reduced-motion support remain. Typecheck passes; visual browser verification remains pending.
