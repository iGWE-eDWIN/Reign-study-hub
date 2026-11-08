# Original-content audit and approved rebuild

Source: `index.html`, its inline CSS and JavaScript, and `assets/`. The complete existing visible-copy and element inventory is in `audit/content-inventory.json`. Extracted content for initial database population is in `lib/seed-content.json`. No original HTML or assets were replaced.

## Original structure and behavior

One document: top information bar, sticky navigation, hero, 12 destination cards (11 named destinations plus “And More”), five services, company introduction, vision/mission/values, founder portrait/message, six country-requirement panels (Cyprus and North Cyprus share requirements), nine-step application process, application CTA, six-part student application, offices, footer and WhatsApp.

JavaScript implements mobile navigation, smooth anchor scrolling, requirement tabs, dependant-field visibility and a submission toast. The original form prevents submission, creates a timestamp-based reference, and clears itself. It does not save a record or send email.

## Brand inventory

- Name: REIGN STUDY HUB LTD; tagline: Your Global Education Partner.
- Parent: A subsidiary of PIS INT'L SYNERGY LTD.
- Fonts: Montserrat 500/600/700/800; Open Sans 400/500/600/700.
- Colours: navy #0a2540; navy-dark #061828; blue #0c4a8a; gold #c9a227; gold-light #e8c547; soft #f5f7fb; text #1e293b; muted #64748b; border #e2e8f0; white #ffffff. WhatsApp green #25d366 and error red #c53030 also appear.
- Four local assets: logo.png, logo-icon.png, logo-header.png, founder.jpg. Copies live under public/assets for Next.js.
- Thirteen distinct external Unsplash URLs in the source cover hero/student and destination photography. Their original URLs and element attributes are retained in the inventory. The source's USA card uses a Paris photograph; the seed leaves that image empty to avoid repeating the mismatch. Supply an appropriate USA photograph.
- Founder: Osepribo T.S. Jackrich, Founder / CEO. Preserve the welcome message and photograph.

## Real contact details

- Email: reignstudyabroad@gmail.com.
- Nigeria: +234 803 423 9813; UK: +44 7480 251588; Port Harcourt office: +234 802 562 4934.
- WhatsApp source link: https://wa.me/2348034239813.
- Head Office: No. 15 Jackreece Compound, King Amachree Road, Buguma City, Asari-Toru LGA, Rivers State, Nigeria.
- Port Harcourt: No. 5 Opili Plaza, By Guinness Warehouse, Azuabie Town, Okujagu, Trans Amadi, Port Harcourt, Rivers State.
- Lagos: 98 Fagbemi Street, Ayanre-Ibiye, Along Agbara-Badagry Road, Lagos State.

## Services and original form content

University & Course Selection; Admission Assistance; Scholarship Guidance; Study Visa Guidance; Pre-Departure Support. Preserve each original short description. Other travel services on the reference site are not claims about Reign Study Hub.

Original selectors contain 43 destination choices (including regional and open-recommendation options), ten study-level choices, 41 course-area choices, seven intake choices and eight budget choices. Vocational/Diploma is additionally provided as requested. Preserve academic history, passport assistance, dependant information and all three consent declarations alongside the newly requested application fields and PDF upload.

## Approved implementation

Public routes: /, /about, /meet-the-md, /faq, /services, /services/[slug], /destinations, /requirements, /apply, /book-appointment, /contact, /blog, /blog/[slug], /privacy.

Reusable navigation/drawer, hero carousel, counter animation, content cards, requirement tabs, FAQ accordion, testimonial carousel, form/uploader, footer and WhatsApp components. Admin includes dashboard/chart, submission lists/details/exports and all content/settings editors. Schema and RLS are in supabase/migrations/001_initial.sql.

Reference home and admission pages were reviewed for structure only. The reference appointment page timed out twice during the audit; the user-supplied fields define that form. Reference copy, images, figures, fees and partner names are not seed content.

## Content awaiting approval or supply

- Verified experience, success rates and client counts: empty; no numerical claims shown.
- Genuine testimonials and permission to publish: empty.
- Partner identities and authorised logos: empty.
- FAQs and answers: empty; FAQ page shows an empty state.
- News/blog articles: empty.
- Working hours and social profiles: blank, hidden until configured.
- Approved privacy policy: explicitly marked pending.
- Programme-specific undergraduate/diploma and master's checklists: explicitly marked pending; existing general document categories remain available.
- Service photographs and longer service-page copy: neutral illustrations and original short descriptions used.
- Exact map location/embed: address-based head-office map used until supplied.
- Processing fee: blank, hidden until configured.
- USA destination photograph: source image mismatched; neutral graphic until supplied.

## Services carousel update

Home's “What we do / Explore our services” section and the Services overview now share an image carousel with swipe, keyboard, arrow and position-dot navigation. Original service titles/descriptions remain unchanged. Five AI-generated illustrative photographs were commissioned for service cards (campus, application preparation, graduation, passport preparation, airport departure); these are decorative illustrations, not photographs of actual clients or staff. Compressed WebP assets are stored in public/assets/services and use lazy loading. Admin-uploaded service images take precedence over the default illustrations.

## Larger automatic services carousel with real university photographs

Supersedes the generated service illustrations above. Cards now show two large panels on desktop and one prominent panel on mobile/tablet. Automatic sliding runs every 5.5 seconds, pauses on hover or keyboard focus, and has a pause/play control; reduced-motion preferences disable automatic sliding. Five verified Commons photographs show Oxford's Radcliffe Camera, two views of King's College Cambridge, the University of Salamanca and the University of Coimbra. Source/author/license metadata lives in lib/service-photography.json; an expandable credit list is displayed below the carousel. Images use responsive display crops under their respective CC BY-SA licenses. Admin uploads still override the defaults. Older generated /assets/services images are no longer used as defaults, including for existing seeded service records. External images load directly in the browser because this environment cannot resolve the image CDN for local downloads.

## Large study-destination slider

Replaced the destination-card grid with a shared responsive Embla slider on Home and /destinations. Large full-image cards show an adjacent-card preview, native lazy loading, country names/flags and destination links. Automatic sliding runs every six seconds, pauses on hover/focus/drag and provides a pause/play button; reduced-motion preferences disable automatic motion. Added a compact slide-position progress bar and keyboard/swipe/arrow navigation.

Eight primary destination defaults now use verified real photographs with metadata in lib/destination-photography.json: Toronto, King's College Cambridge, Salamanca, Istanbul, Warsaw, Paphos, Berlin and Rome. Remaining existing photo cards retain original photographs. Source and license credits are available beneath the carousel. The original Cyprus generic beach image was replaced by Paphos; existing custom admin images remain authoritative. All 43 destination options remain in the seed and editable database. Ten destinations currently have photo cards; the remaining options appear as additional destination links on the full destinations page. Destinations without published requirements lead to appointment booking instead of showing a different country's requirements by default.
