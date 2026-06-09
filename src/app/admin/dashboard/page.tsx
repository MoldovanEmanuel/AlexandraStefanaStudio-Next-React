import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [projects, news, heroSlides, renders] = await Promise.all([
    prisma.project.count(),
    prisma.news.count(),
    prisma.heroSlide.count({ where: { active: true } }),
    prisma.render.count(),
  ]);

  const stats = [
    { label: "Proiecte", count: projects, href: "/admin/projects", color: "border-accent" },
    { label: "Noutăți", count: news, href: "/admin/news", color: "border-text-secondary" },
    { label: "Hero Slides", count: heroSlides, href: "/admin/hero", color: "border-accent-dark" },
    { label: "Animații 3D", count: renders, href: "/admin/renders", color: "border-text-muted" },
  ];

  const recentProjects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, name: true, category: true, active: true, updatedAt: true },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl tracking-widest text-text-primary">Dashboard</h1>
        <p className="font-body text-sm text-text-muted mt-1">Bun venit în panoul de administrare.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-10">
        {stats.map(({ label, count, href, color }) => (
          <Link
            key={label}
            href={href}
            className={`block border-l-2 ${color} bg-bg-lighter p-5 transition-colors hover:bg-bg-card`}
          >
            <p className="font-display text-3xl text-text-primary">{count}</p>
            <p className="font-body text-xs uppercase tracking-widest text-text-muted mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="font-body text-xs uppercase tracking-widest text-accent mb-4">Acțiuni rapide</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/projects/new" className="btn-secondary">+ Proiect nou</Link>
          <Link href="/admin/news/new" className="btn-secondary">+ Noutate nouă</Link>
          <Link href="/admin/hero" className="btn-secondary">Gestionare Hero</Link>
          <Link href="/admin/renders" className="btn-secondary">Upload animație</Link>
        </div>
      </div>

      {/* Recent projects */}
      <div>
        <h2 className="font-body text-xs uppercase tracking-widest text-accent mb-4">Proiecte recente</h2>
        <div className="border border-border">
          {recentProjects.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-3 font-body text-sm ${i < recentProjects.length - 1 ? "border-b border-border" : ""}`}
            >
              <div>
                <span className="text-text-primary mr-3">{p.name}</span>
                <span className="text-xs text-text-faint">{p.category}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs ${p.active ? "text-green-600" : "text-text-faint"}`}>
                  {p.active ? "Activ" : "Inactiv"}
                </span>
                <Link href={`/admin/projects/${p.id}/edit`} className="text-accent hover:underline text-xs">
                  Editează
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
