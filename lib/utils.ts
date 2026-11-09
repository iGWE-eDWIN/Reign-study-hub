export function whatsappLink(number: string, message = 'Hello Reign Study Hub, I would like guidance on studying abroad.') {
  const digits = number.replace(/\D/g,'');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : '';
}
export function safeHref(value: string) { return /^(https?:\/\/|mailto:|tel:|\/(?!\/))/.test(value) ? value : '#'; }
export function readable(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value,null,2);
  return String(value);
}
export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const hostname = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const value = configured || (hostname ? `https://${hostname}` : 'http://localhost:3000');
  const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be a website origin, such as https://your-project.vercel.app.');
  }
  return url.origin;
}
