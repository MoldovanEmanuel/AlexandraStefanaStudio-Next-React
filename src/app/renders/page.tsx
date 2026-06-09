import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet, CACHE_KEYS } from "@/lib/redis";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import type { Render } from "@/types";

export const metadata: Metadata = {
  title: "3D Animații & Randări",
  description:
    "Vizualizări 3D fotorealiste și animații de arhitectură. Aducem proiectele la viață înainte de execuție.",
};

async function getRenders(): Promise<Render[]> {
  const cached = await cacheGet<Render[]>(CACHE_KEYS.renders);
  if (cached) return cached;

  const raw = await prisma.render.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const renders = raw.map((r) => ({
    ...r,
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
      <main className="pt-[var(--nav-height)]">
        <section className="py-16 lg:py-24 border-b border-border">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            <p className="section-subtitle mb-3">Vizualizare</p>
            <h1 className="font-display text-display-lg text-text-primary">
              3D Animații & Randări
            </h1>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            {renders.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {renders.map((render) => (
                  <div key={render.id} className="group">
                    <div className="relative overflow-hidden bg-bg-card aspect-video">
                      <video
                        src={render.videoPath}
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover"
                        aria-label={render.title}
                      />
                    </div>
                    <div className="mt-4">
                      <h2 className="font-display text-xl tracking-widest text-text-primary">
                        {render.title}
                      </h2>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-24 text-center font-body text-sm text-text-muted">
                Niciun conținut disponibil momentan.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
