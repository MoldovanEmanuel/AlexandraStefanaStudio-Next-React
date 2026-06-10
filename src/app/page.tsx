import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/redis";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ServicesSection } from "@/components/home/ServicesSection";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { NewsPreview } from "@/components/home/NewsPreview";
import { JsonLd } from "@/components/ui/JsonLd";
import type { Project, NewsItem, HeroSlide } from "@/types";

export const metadata: Metadata = {
  title: "Alexandra Stefana — Interior Design Studio Cluj-Napoca",
  description:
    "Alexandra Stefana is an interior design studio based in Cluj-Napoca, Romania. We design personal, functional spaces — from family homes to commercial interiors.",
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
      orderBy: { sortOrder: "asc" },
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
        <div id="home">
          <HeroSlider slides={slides} />
        </div>

        {/* About section */}
        <section id="about" style={{ padding: "90px 0 120px" }}>
          <div className="mx-auto" style={{ maxWidth: "1100px", padding: "0 40px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
              <div>
                <h2 className="font-display" style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "4px", marginBottom: "26px", color: "var(--text-muted)" }}>
                  <span>ABOUT</span> <em style={{ fontStyle: "normal" }}>ME</em>
                </h2>
                <div className="font-body" style={{ fontSize: "13px", fontWeight: 300, lineHeight: 1.85, color: "var(--text-muted)" }}>
                  <p style={{ marginBottom: "14px" }}>
                    I am an Interior Designer &amp; Visualization | CG Artist based in Cluj-Napoca, Romania, dedicated to crafting spaces that are both beautiful and deeply personal.
                  </p>
                  <p style={{ marginBottom: "14px" }}>
                    Each project begins with listening — understanding how you live, what you love, and what kind of environment makes you feel at home. From that foundation, I build interiors that balance aesthetics with everyday functionality.
                  </p>
                  <p style={{ marginBottom: "14px" }}>
                    Whether it is a family home, an apartment, or a commercial space, every project receives the same care and attention to detail — from the first sketch to the final finish.
                  </p>
                </div>
              </div>
              <div className="relative" style={{ border: "2px solid rgba(166,133,105,0.08)", display: "inline-block", width: "100%" }}>
                <Image
                  src="/assets/images/about.jpg"
                  alt="Alexandra Stefana Studio"
                  width={800}
                  height={340}
                  className="w-full object-cover transition-transform duration-[600ms] hover:scale-[1.03]"
                  style={{ height: "340px", objectFit: "cover", display: "block" }}
                  loading="lazy"
                />
                <div
                  className="font-body"
                  style={{
                    position: "absolute",
                    bottom: "-30px",
                    right: "30px",
                    background: "#221813",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    fontSize: "10px",
                    letterSpacing: "3.5px",
                    fontWeight: 600,
                    padding: "18px 32px",
                    border: "2px solid rgba(166,133,105,0.08)",
                  }}
                >
                  CLUJ-NAPOCA
                </div>
              </div>
            </div>
          </div>
        </section>

        <ServicesSection />
        <div id="portfolio">
          <PortfolioPreview projects={projects} />
        </div>
        <div id="news">
          <NewsPreview items={news} />
        </div>
      </main>
      <Footer />
    </>
  );
}
