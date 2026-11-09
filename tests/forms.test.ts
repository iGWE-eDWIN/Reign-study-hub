import test from 'node:test';
import assert from 'node:assert/strict';
import { applicationSchema, appointmentSchema, contactSchema, hasPdfHeader, MAX_PDF_SIZE, nigerianStates, todayInNigeria, validatePdfMetadata } from '../lib/validators/forms';
import { csvCell, toCsv } from '../lib/csv';
import { safeHref, whatsappLink, siteUrl } from '../lib/utils';
import { contentSchema } from '../lib/admin-config';

const contact = { name: 'Test Applicant', email: 'applicant@example.com', phone: '+2348034239813', subject: 'Study enquiry', message: 'Please help with my study application.' };
const application = { ...contact, full_name: 'Test Applicant', date_of_birth: '2000-01-01', place_of_birth: 'Lagos', state_of_origin: 'Lagos', lga: 'Ikeja', marital_status: 'Single', first_choice_country: 'Canada', preferred_courses: 'Computer Science, Data Science', programme_level: "Master’s", confirm_accurate: true, agree_privacy: true, consent_contact: true };

test('contact validation rejects spam, invalid email and short messages', () => {
  assert.equal(contactSchema.safeParse(contact).success, true);
  for (const change of [{ website: 'spam' }, { email: 'invalid' }, { message: 'short' }, { phone: 'abcdefghi' }]) {
    assert.equal(contactSchema.safeParse({ ...contact, ...change }).success, false);
  }
});
test('application validates real dates, consent, states and destination choices', () => {
  assert.equal(applicationSchema.safeParse(application).success, true);
  for (const change of [{ date_of_birth: '2000-02-31' }, { date_of_birth: '2099-01-01' }, { confirm_accurate: false }, { state_of_origin: 'Unknown' }, { second_choice_country: 'Canada' }, { passport_issue_date: '2020-01-01', passport_expiry_date: '2019-01-01' }]) {
    assert.equal(applicationSchema.safeParse({ ...application, ...change }).success, false);
  }
  assert.equal(new Set(nigerianStates).size, 37);
});
test('appointment rejects past dates and invalid appointment types', () => {
  const value = { ...contact, full_name: 'Test Applicant', service_type: 'Admission Assistance', destination: 'Canada', appointment_date: todayInNigeria(), appointment_type: 'phone call' };
  assert.equal(appointmentSchema.safeParse(value).success, true);
  assert.equal(appointmentSchema.safeParse({ ...value, appointment_date: '2020-01-01' }).success, false);
  assert.equal(appointmentSchema.safeParse({ ...value, appointment_type: 'unsupported' }).success, false);
});
test('PDF validation enforces type, 10MB limit and file signature', () => {
  assert.doesNotThrow(() => validatePdfMetadata('application/pdf', MAX_PDF_SIZE));
  assert.throws(() => validatePdfMetadata('image/png', 100));
  assert.throws(() => validatePdfMetadata('application/pdf', MAX_PDF_SIZE + 1));
  assert.throws(() => validatePdfMetadata('application/pdf', 0));
  assert.equal(hasPdfHeader(new TextEncoder().encode('%PDF-1.7')), true);
  assert.equal(hasPdfHeader(new TextEncoder().encode('<html>')), false);
});
test('CSV escapes quotations and spreadsheet formula injection', () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell(' =HYPERLINK("bad")').startsWith('"\''), true);
  assert.equal(toCsv([{ name: 'Applicant', note: 'line 1\nline 2' }]).includes('"line 1\nline 2"'), true);
});
test('links reject script URLs and encode WhatsApp messages', () => {
  assert.equal(safeHref('javascript:alert(1)'), '#');
  assert.equal(safeHref('//evil.example'), '#');
  assert.equal(whatsappLink('+234 803 423 9813', 'Hello & welcome'), 'https://wa.me/2348034239813?text=Hello%20%26%20welcome');
});
test('admin validation rejects unsafe links, malformed settings and blank sanitised copy', () => {
  assert.throws(() => contentSchema('constructor'));
  assert.equal(contentSchema('faqs').safeParse({ question: '<b></b>', answer: 'A real answer', sort_order: 0, is_published: true }).success, false);
  const slide = { tagline: '', headline: 'Study abroad', subtext: '', image_url: '', cta_label: 'Apply', cta_link: '/apply', sort_order: 0, is_active: true };
  assert.equal(contentSchema('slides').safeParse(slide).success, true);
  assert.equal(contentSchema('slides').safeParse({ ...slide, cta_link: 'javascript:alert(1)' }).success, false);
  assert.equal(contentSchema('destinations').safeParse({ name: 'Canada', flag_emoji: '', description: '', image_url: '', requirements: 'not a list', sort_order: 0, is_active: true }).success, false);
});

test('site URL accepts origins and normalises a hostname without a scheme', () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    process.env.NEXT_PUBLIC_SITE_URL = ' reignstudyhub.vercel.app ';
    assert.equal(siteUrl(), 'https://reignstudyhub.vercel.app');
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000/';
    assert.equal(siteUrl(), 'http://localhost:3000');
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/admin';
    assert.throws(() => siteUrl(), /website origin/);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
