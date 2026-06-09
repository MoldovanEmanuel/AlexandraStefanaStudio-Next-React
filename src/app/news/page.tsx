import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Noutăți",
  description:
    "Ultimele noutăți și apariții media ale Alexandra Stefana Studio.",
};

const PER_PAGE = 9;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));

  const [news, total] = await Promise.all([
    prisma.news.findMany({
      where: { active: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.news.count({ where: { active: true } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <Header />
      <main className="pt-[var(--nav-height)]">
        <section className="py-16 lg:py-24 border-b border-border">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            <p className="section-subtitle mb-3">Presă & Media</p>
            <h1 className="font-display text-display-lg text-text-primary">
              Noutăți
            </h1>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            {news.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {news.map((item) => (
                    <a
                      key={item.id}
                      href={item.url ?? "#"}
                      target={item.url ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group block border border-border transition-all duration-300 hover:border-accent/40"
                    >
                      {item.image && (
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <p className="font-body text-xs uppercase tracking-widest text-accent mb-2">
                          {formatDate(item.date.toISOString())}
                        </p>
                        <h2 className="font-body text-sm font-medium text-text-primary leading-snug group-hover:text-accent transition-colors">
                          {item.title}
                        </h2>
                      </div>
                    </a>
                  ))}
                </div>
                <Pagination currentPage={page} totalPages={totalPages} />
              </>
            ) : (
              <p className="py-24 text-center font-body text-sm text-text-muted">
                Niciun articol disponibil momentan.
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
