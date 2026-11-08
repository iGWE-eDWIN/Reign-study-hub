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
export const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
