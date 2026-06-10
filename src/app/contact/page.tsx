import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Alexandra Stefana Interior Design Studio. Based in Cluj-Napoca, Romania — reach us by phone, email, or via the contact form.",
};

const SITE_URL = process.env.APP_URL ?? "https://alexandrastefana.studio";

export default function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact — Alexandra Stefana Studio",
    url: `${SITE_URL}/contact`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE_URL}/contact` },
      ],
    },
  };

  return (
    <>
      <JsonLd data={contactJsonLd} />
      <Header />
      <main>
        <section className="contact-section" style={{ padding: "120px 0 90px" }}>
          <div className="mx-auto" style={{ maxWidth: "1100px", padding: "0 40px" }}>
            <h2 className="font-display" style={{ fontSize: "26px", fontWeight: 700, letterSpacing: "5px", marginBottom: "55px", color: "var(--text-muted)" }}>
              <em style={{ fontStyle: "normal" }}>CONTACT</em>
            </h2>

            <div className="contact-col" style={{ paddingRight: "80px" }}>
              <p className="font-body" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "3px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "28px" }}>
                Alexandra Ștefana Interior Design
              </p>
              <p className="font-body" style={{ fontSize: "13px", lineHeight: 1.9, color: "var(--text-muted)", opacity: 0.85, marginBottom: "20px" }}>
                An interior design studio based in Cluj-Napoca, Romania. We design spaces that feel like home — personal, functional, and crafted with care.
              </p>

              <dl>
                <div className="contact-detail-row" style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "8px" }}>
                  <span className="font-body" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2.5px", color: "var(--text-muted)", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>Phone :</span>
                  <a href="tel:+40754559627" className="font-body hover:text-accent transition-colors" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    +40 754 559 627
                  </a>
                </div>
                <div className="contact-detail-row" style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "8px" }}>
                  <span className="font-body" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2.5px", color: "var(--text-muted)", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>Email :</span>
                  <a href="mailto:contact@alexandrastefana.studio" className="font-body hover:text-accent transition-colors" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    contact@alexandrastefana.studio
                  </a>
                </div>
                <div className="contact-detail-row" style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "8px" }}>
                  <span className="font-body" style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "2.5px", color: "var(--text-muted)", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0 }}>Address :</span>
                  <span className="font-body" style={{ fontSize: "13px", color: "var(--text-muted)" }}>Cluj-Napoca, Romania</span>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
