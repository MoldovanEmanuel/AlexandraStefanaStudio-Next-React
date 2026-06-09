# Alexandra Stefana Studio

Live website for Alexandra Stefana Interior Design Studio, Cluj-Napoca.
Built with Next.js 15, React 19, TypeScript, PostgreSQL, and Redis.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, Server Components), React 19, TypeScript |
| Styling | Tailwind CSS v3 — custom luxury design tokens, Framer Motion animations |
| State & Data | Zustand (admin UI state), TanStack Query (admin data fetching) |
| Backend | Next.js API routes (REST), JWT authentication via `jose` |
| Database | PostgreSQL via Prisma ORM |
| Caching | Redis — page-level caching (5 min TTL) + contact form rate limiting |
| Media | AWS S3 + CloudFront — all uploads auto-converted to WebP via Sharp |
| Email | Nodemailer (any SMTP) |
| Testing | Vitest (unit), Playwright (E2E) |
| DevOps | Docker Compose, GitHub Actions CI/CD, Terraform (S3 + CloudFront IaC) |
| Deploy | Vercel (via GitHub Actions on merge to `main`) |

---

## Features

### Public site
- **Home** — animated hero slider (auto-rotate + manual controls), about section, services grid, portfolio preview, news preview
- **Portfolio** — filterable by category, paginated (9 per page), project detail with masonry gallery + fullscreen lightbox
- **Renders** — 3D animation and video gallery
- **News** — paginated press/media listing linking to external articles
- **Contact** — contact info + validated form (honeypot + Redis rate limiting: 3 submissions per 10 min per IP)
- **Sitemap** — dynamic `sitemap.xml` via Next.js `sitemap.ts`
- **Robots** — `robots.txt` with `/admin/` and `/api/` blocked

### Admin panel (`/admin`)
- JWT authentication — token stored in HTTP-only cookie, validated in middleware
- **Projects** — CRUD, thumbnail upload, drag-to-reorder (`@dnd-kit`), gallery upload with per-image orientation toggle (landscape / portrait)
- **News** — CRUD, cover image upload, drag-to-reorder, external URL
- **Hero Slides** — upload, toggle active/inactive, drag-to-reorder
- **Renders** — video upload (MP4), title management, drag-to-reorder
- **Dashboard** — entity counts at a glance, recent projects list, quick-action links

### Backend API
- **`POST /api/auth/login`** — validates credentials, issues JWT in HTTP-only cookie
- **`POST /api/auth/logout`** — clears the auth cookie
- **`GET /api/auth/me`** — returns current user from token
- **`GET /api/projects`** — active projects, paginated, filterable by category; `?admin=1` returns all
- **`POST /api/projects`** — create project (admin)
- **`GET /api/projects/:id`** — single project
- **`PUT /api/projects/:id`** — update project (admin)
- **`DELETE /api/projects/:id`** — delete project (admin)
- **`POST /api/projects/:id/gallery`** — upload and append gallery image, auto-converted to WebP (admin)
- **`DELETE /api/projects/:id/gallery`** — remove gallery image + delete from S3 (admin)
- **`PATCH /api/projects/:id/gallery`** — update image orientation: `landscape` / `portrait` (admin)
- **`POST /api/projects/reorder`** — batch `sortOrder` update from drag-to-reorder (admin)
- **`GET /api/news`** — active news items, paginated; `?admin=1` returns all
- **`POST /api/news`** — create news item (admin)
- **`GET /api/news/:id`** — single news item
- **`PUT /api/news/:id`** — update news item (admin)
- **`DELETE /api/news/:id`** — delete news item (admin)
- **`POST /api/news/reorder`** — batch `sortOrder` update (admin)
- **`GET /api/hero`** — all hero slides ordered by `sortOrder`
- **`POST /api/hero`** — upload new hero slide, auto-converted to WebP (admin)
- **`PATCH /api/hero/:id`** — toggle `active` status (admin)
- **`DELETE /api/hero/:id`** — delete slide + S3 file (admin)
- **`POST /api/hero/reorder`** — batch `sortOrder` update (admin)
- **`GET /api/renders`** — all renders ordered by `sortOrder`
- **`POST /api/renders`** — upload MP4 video + title (admin)
- **`PUT /api/renders/:id`** — update title (admin)
- **`DELETE /api/renders/:id`** — delete render + S3 file (admin)
- **`POST /api/renders/reorder`** — batch `sortOrder` update (admin)
- **`POST /api/contact`** — honeypot check, Redis rate limit (3/IP/10 min), validate, persist, send email
- **`POST /api/upload`** — generic image upload → S3, returns `{ url, key }`

### SEO & performance
- Next.js Metadata API — titles, descriptions, Open Graph, Twitter Card on all pages
- JSON-LD structured data — `InteriorDesigner`, `BreadcrumbList`, `ContactPage`
- Dynamic `sitemap.xml` and `robots.txt` via Next.js file conventions
- Server Components by default — public pages are fully server-rendered, no client JS overhead
- Redis caching on all server-side data fetches
- All uploaded images converted to WebP at 85% quality via Sharp
- Next.js `<Image>` with responsive `sizes`, AVIF + WebP format negotiation, lazy loading
- `League Gothic` + `Montserrat` loaded via `next/font/google` — no FOUT, zero layout shift
- Google Analytics 4 — loaded after page interaction, skipped if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset

---

## Project structure

```
AlexandraStefanaStudio-next/
├── .env.example                                # All required environment variables
├── .github/
│   └── workflows/
│       └── ci.yml                              # Lint → unit tests → build → E2E → Vercel deploy
├── Dockerfile                                  # Multi-stage: deps → builder → runner
├── docker-compose.yml                          # App + PostgreSQL 16 + Redis 7
├── terraform/
│   ├── main.tf                                 # S3 bucket + CloudFront distribution + OAC
│   ├── variables.tf
│   └── outputs.tf                              # Prints CLOUDFRONT_DOMAIN and AWS_S3_BUCKET
├── prisma/
│   ├── schema.prisma                           # PostgreSQL schema — 6 models
│   └── seed.ts                                 # Creates admin user + placeholder hero slides
├── src/
│   ├── middleware.ts                           # JWT guard on /admin/* and mutating /api/* routes
│   ├── types/index.ts                          # Shared domain + API types
│   ├── store/
│   │   └── admin.ts                            # Zustand store — user, sidebar state, logout
│   ├── hooks/
│   │   ├── use-projects.ts                     # TanStack Query: list, single, delete, reorder
│   │   └── use-news.ts                         # TanStack Query: list, delete, reorder
│   ├── lib/
│   │   ├── prisma.ts                           # Singleton Prisma client
│   │   ├── redis.ts                            # ioredis client + cacheGet / cacheSet / cacheDel
│   │   ├── s3.ts                               # S3 upload helpers — image → WebP, video, delete
│   │   ├── auth.ts                             # hashPassword / verifyPassword / cookie management
│   │   ├── jwt.ts                              # signJwt / verifyJwt via jose
│   │   ├── rate-limit.ts                       # Redis-backed rate limiter
│   │   ├── email.ts                            # Nodemailer contact form email
│   │   └── utils.ts                            # cn(), createSlug(), formatDate(), getClientIp()
│   ├── app/
│   │   ├── layout.tsx                          # Root layout — fonts, metadata, Providers
│   │   ├── globals.css                         # Tailwind directives + CSS variables + component classes
│   │   ├── page.tsx                            # Home — hero, about, services, portfolio, news
│   │   ├── portfolio/page.tsx                  # Portfolio grid with category filter + pagination
│   │   ├── project/[slug]/page.tsx             # Project detail — hero image, description, gallery
│   │   ├── renders/page.tsx                    # 3D video gallery
│   │   ├── news/page.tsx                       # Paginated news list
│   │   ├── contact/page.tsx                    # Contact info + form
│   │   ├── sitemap.ts                          # Dynamic XML sitemap
│   │   ├── robots.ts                           # robots.txt
│   │   ├── not-found.tsx                       # Custom 404 page
│   │   ├── error.tsx                           # Global error boundary
│   │   ├── admin/
│   │   │   ├── layout.tsx                      # Admin shell — sidebar or login wrapper
│   │   │   ├── login/page.tsx                  # Login form
│   │   │   ├── dashboard/page.tsx              # Stats + recent projects
│   │   │   ├── projects/page.tsx               # Project list + drag-to-reorder
│   │   │   ├── projects/new/page.tsx
│   │   │   ├── projects/[id]/edit/page.tsx
│   │   │   ├── news/page.tsx
│   │   │   ├── news/new/page.tsx
│   │   │   ├── news/[id]/edit/page.tsx
│   │   │   ├── hero/page.tsx                   # Hero slide management
│   │   │   └── renders/page.tsx                # Video upload + management
│   │   └── api/
│   │       ├── auth/login/route.ts             # POST — issue JWT cookie
│   │       ├── auth/logout/route.ts            # POST — clear cookie
│   │       ├── auth/me/route.ts                # GET — current user from token
│   │       ├── projects/route.ts               # GET (public) / POST (admin)
│   │       ├── projects/[id]/route.ts          # GET / PUT / DELETE
│   │       ├── projects/[id]/gallery/route.ts  # POST / DELETE / PATCH (orientation)
│   │       ├── projects/reorder/route.ts       # POST — batch sortOrder update
│   │       ├── news/route.ts                   # GET / POST
│   │       ├── news/[id]/route.ts              # GET / PUT / DELETE
│   │       ├── news/reorder/route.ts
│   │       ├── hero/route.ts                   # GET / POST (upload)
│   │       ├── hero/[id]/route.ts              # PATCH / DELETE
│   │       ├── hero/reorder/route.ts
│   │       ├── renders/route.ts                # GET / POST (video upload)
│   │       ├── renders/[id]/route.ts           # PUT / DELETE
│   │       ├── renders/reorder/route.ts
│   │       ├── contact/route.ts                # POST — honeypot + rate limit + email
│   │       └── upload/route.ts                 # POST — generic image upload → S3
│   └── components/
│       ├── Providers.tsx                       # QueryClientProvider + ReactQueryDevtools
│       ├── GoogleAnalytics.tsx                 # GA4 Script tags (consent-gated)
│       ├── layout/
│       │   ├── Header.tsx                      # Fixed nav — scroll-aware bg, mobile hamburger
│       │   └── Footer.tsx                      # Links, contact, copyright
│       ├── home/
│       │   ├── HeroSlider.tsx                  # Auto-rotate, prev/next, dot indicators
│       │   ├── ServicesSection.tsx             # 4-column service cards
│       │   ├── PortfolioPreview.tsx            # 6-project grid from showOnHome
│       │   └── NewsPreview.tsx                 # 3-item news strip from showOnHome
│       ├── portfolio/
│       │   └── CategoryFilter.tsx              # URL-driven filter buttons
│       ├── project/
│       │   └── ProjectGallery.tsx              # Masonry grid + fullscreen lightbox
│       ├── contact/
│       │   └── ContactForm.tsx                 # React Hook Form + Zod + honeypot
│       ├── ui/
│       │   ├── Pagination.tsx                  # URL-driven page controls
│       │   └── JsonLd.tsx                      # <script type="application/ld+json"> wrapper
│       └── admin/
│           ├── AdminShell.tsx                  # Sidebar layout vs login layout
│           ├── AdminSidebar.tsx                # Nav links + logout
│           ├── DragDropList.tsx                # @dnd-kit sortable list
│           ├── GalleryUploader.tsx             # Drag-drop multi-upload, remove, orientation toggle
│           ├── ImageUploader.tsx               # Single image upload → /api/upload
│           ├── ProjectForm.tsx                 # Full project create/edit form
│           └── NewsForm.tsx                    # News item create/edit form
├── tests/
│   ├── setup.ts                                # jest-dom matchers + next/navigation mock
│   ├── e2e/
│   │   ├── home.spec.ts                        # Title, nav, footer, OG tags
│   │   ├── portfolio.spec.ts                   # Portfolio, contact form, sitemap, robots
│   │   └── admin.spec.ts                       # Auth redirect, login UI, invalid credentials
│   └── unit/
│       ├── auth.test.ts                        # hashPassword, verifyPassword, JWT sign/verify
│       ├── rate-limit.test.ts                  # rateLimit allows / blocks
│       └── utils.test.ts                       # createSlug, formatDate, getClientIp
├── vitest.config.ts
├── playwright.config.ts
├── tailwind.config.ts
├── next.config.ts
└── docker-compose.yml
```

---

## License

Private website — all rights reserved.
