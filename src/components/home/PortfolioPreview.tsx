import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types";

interface PortfolioPreviewProps {
  projects: Project[];
}

export function PortfolioPreview({ projects }: PortfolioPreviewProps) {
  if (projects.length === 0) return null;

  return (
    <section id="portfolio" style={{ padding: "90px 0", background: "var(--bg)" }}>
      <div className="mx-auto" style={{ maxWidth: "1100px", padding: "0 40px" }}>
        <h2
          className="font-display"
          style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "5px", marginBottom: "55px", color: "var(--text-muted)" }}
        >
          <em>PORTFOLIO</em>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.slug}`}
              className="project-card group block"
              style={{ position: "relative", overflow: "hidden", cursor: "pointer" }}
            >
              <div style={{ position: "relative", height: "400px", overflow: "hidden", background: "#1b120e" }}>
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    sizes="(max-width: 1100px) 33vw, 370px"
                    className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
                    style={{ display: "block" }}
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "#1b120e" }} />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(15,5,0,0.82) 0%, transparent 55%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "28px 26px",
                  }}
                >
                  <span
                    className="font-body"
                    style={{ fontSize: "9px", letterSpacing: "4px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "7px", opacity: 0.85 }}
                  >
                    {project.category}
                  </span>
                  <h3
                    className="font-body"
                    style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "1px", color: "#e8d5c0", textTransform: "uppercase" }}
                  >
                    {project.name.toUpperCase()}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
