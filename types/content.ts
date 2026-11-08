export type Json = string | number | boolean | null | Json[] | { [key: string]: Json | undefined };
export type ContentRow = { id: string; [key: string]: Json | undefined };
export interface Service { id?: string; slug: string; title: string; short_description: string; content: string; image_url: string; is_published: boolean; sort_order: number }
export interface Destination { id?: string; name: string; flag_emoji: string; is_active: boolean; sort_order: number; image_url: string; description: string; requirements: string[] }
export interface Option { id?: string; name: string; is_active: boolean; sort_order: number }
export interface Slide { id?: string; tagline: string; headline: string; subtext: string; image_url: string; cta_label: string; cta_link: string; sort_order: number; is_active: boolean }
export interface TeamMember { id?: string; name: string; role: string; bio: string; image_url: string; sort_order: number; is_published: boolean }
export interface SiteSettings { id: number; site_name: string; tagline: string; parent_company: string; logo_url: string; email: string; whatsapp_number: string; phone_numbers: string[]; addresses: {label: string; address: string}[]; working_hours: string; social_links: Record<string,string>; stats: {label: string; value: number; suffix?: string}[]; about_text: string; vision_text: string; mission_text: string; values_text: string; processing_fee: string; map_embed_url: string; privacy_text: string; application_process: {title: string; description: string}[]; document_checklists: {title: string; items: string[]}[] }
export interface Post { id: string; slug: string; title: string; excerpt: string; content: string; cover_image_url: string; is_published: boolean; published_at: string | null }
export interface FAQ { id: string; question: string; answer: string; sort_order: number }
export interface Testimonial { id: string; name: string; title: string; quote: string; image_url: string; is_published: boolean }
export interface Partner { id: string; name: string; logo_url: string; sort_order: number }
