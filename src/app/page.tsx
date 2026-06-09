import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, CACHE_KEYS } from "@/lib/redis";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ServicesSection } from "@/components/home/ServicesSection";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { NewsPreview } from "@/components/home/NewsPreview";
import { JsonLd } from "@/components/ui/JsonLd";
import type { Project, NewsItem, HeroSlide } from "@/types";

export const metadata: Metadata = {
  title: "Alexandra Stefana Studio | Design Interior Cluj-Napoca",
  description:
    "Studio premium de design interior în Cluj-Napoca. Soluții personalizate pentru spații rezidențiale și comerciale.",
};

const SITE_URL = process.env.APP_URL ?? "https://alexandrastefana.studio";

async function getHomeData() {
  const cached = await cacheGet<{
    slides: HeroSlide[];
    projects: Project[];
    news: NewsItem[];
  }>("as-studio:home");

  if (cached) return cached;

  const [slidesRaw, projectsRaw, newsRaw] = await Promise.all([
    prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.findMany({
      where: { active: true, showOnHome: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    }),
    prisma.news.findMany({
      where: { active: true, showOnHome: true },
      orderBy: { date: "desc" },
      take: 3,
    }),
  ]);

  const data = {
    slides: slidesRaw.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })) as HeroSlide[],
    projects: projectsRaw.map((p) => ({
      ...p,
      paragraphs: p.paragraphs as string[],
      features: p.features as string[],
      gallery: p.gallery as never[],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })) as Project[],
    news: newsRaw.map((n) => ({
      ...n,
      date: n.date.toISOString(),
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    })) as NewsItem[],
  };

  await cacheSet("as-studio:home", data, 300);
  return data;
}

export default async function HomePage() {
  const { slides, projects, news } = await getHomeData();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "InteriorDesigner",
    name: "Alexandra Stefana Studio",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cluj-Napoca",
      addressCountry: "RO",
    },
    email: "contact@alexandrastefana.studio",
    sameAs: ["https://www.instagram.com/alexandrastefana.studio"],
  };

  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <Header />
      <main>
        <HeroSlider slides={slides} />

        {/* About section */}
        <section className="py-24 lg:py-32">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">
              <div>
                <p className="section-subtitle mb-3">Despre noi</p>
                <h2 className="section-title mb-8">
                  Creăm spații
                  <br />
                  cu suflet
                </h2>
                <div className="space-y-4 font-body text-sm text-text-muted leading-relaxed">
                  <p>
                    Alexandra Stefana Studio este un studio de design interior cu
                    sediul în Cluj-Napoca, dedicat creării de spații elegante,
                    funcționale și profund personalizate.
                  </p>
                  <p>
                    Cu o abordare atentă la detalii și o estetică rafinată, transformăm
                    viziunile clienților noștri în realitate — de la conceptul inițial
                    până la execuția finală.
                  </p>
                </div>
              </div>
              <div className="relative aspect-[4/3] bg-bg-card overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-body text-xs uppercase tracking-widest text-text-faint">
                    Imagine studio
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServicesSection />
        <PortfolioPreview projects={projects} />
        <NewsPreview items={news} />
      </main>
      <Footer />
    </>
  );
}
