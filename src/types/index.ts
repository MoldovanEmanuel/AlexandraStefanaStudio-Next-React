// ── Domain types (mirrors Prisma models + extra client-facing shapes) ────────

export interface GalleryImage {
  src: string;
  orientation: "landscape" | "portrait";
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  category: string;
  year: string | null;
  surface: string | null;
  location: string | null;
  image: string | null;
  paragraphs: string[];
  features: string[];
  gallery: GalleryImage[];
  layout: string | null;
  sortOrder: number;
  active: boolean;
  showOnHome: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  image: string | null;
  url: string | null;
  active: boolean;
  showOnHome: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlide {
  id: number;
  image: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Render {
  id: number;
  title: string;
  videoPath: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

// ── API response shapes ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// ── Form types ────────────────────────────────────────────────────────────────

export interface ProjectFormData {
  name: string;
  category: string;
  year?: string;
  surface?: string;
  location?: string;
  paragraphs: string[];
  features: string[];
  layout?: string;
  active: boolean;
  showOnHome: boolean;
}

export interface NewsFormData {
  title: string;
  date: string;
  url?: string;
  active: boolean;
  showOnHome: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  website?: string; // honeypot
}

export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

// ── JWT payload ───────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

// ── Upload ────────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string;
  key: string;
}
