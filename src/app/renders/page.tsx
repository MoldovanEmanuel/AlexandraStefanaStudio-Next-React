import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, CACHE_KEYS } from "@/lib/redis";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RenderCard } from "@/components/renders/RenderCard";
import type { Render } from "@/types";

export const metadata: Metadata = {
  title: "3D Animations",
  description:
    "3D visualization animations by Alexandra Stefana — Interior Designer & CG Artist based in Cluj-Napoca, Romania.",
};

async function getRenders(): Promise<Render[]> {
  const cached = await cacheGet<Render[]>(CACHE_KEYS.renders);
  if (cached) return cached;

  const raw = await prisma.render.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const renders = raw.map((r) => ({
    ...r,
    coverImage: r.coverImage ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  await cacheSet(CACHE_KEYS.renders, renders, 600);
  return renders;
}

export default async function RendersPage() {
  const renders = await getRenders();

  return (
    <>
      <Header />
      <main>
        <section className="renders-section" style={{ padding: "120px 0 80px", minHeight: "100vh" }}>
          <div className="mx-auto" style={{ maxWidth: "1100px", padding: "0 40px" }}>
            <h2 className="font-display" style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "5px", marginBottom: "55px", color: "var(--text-muted)" }}>
              <span>3D</span> <em style={{ fontStyle: "normal" }}>ANIMATIONS</em>
            </h2>

            {renders.length > 0 ? (
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                {renders.map((render) => (
                  <RenderCard key={render.id} render={render} />
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-text-muted" style={{ opacity: 0.4 }}>
                No renders uploaded yet.
              </p>
            )}

            <div className="mt-16">
              <Link href="/portfolio" className="btn-primary">
                ← BACK TO PORTFOLIO
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
