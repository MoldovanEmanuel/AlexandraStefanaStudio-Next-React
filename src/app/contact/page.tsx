import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactForm } from "@/components/contact/ContactForm";
import { JsonLd } from "@/components/ui/JsonLd";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactați Alexandra Stefana Studio pentru proiecte de design interior în Cluj-Napoca.",
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
        { "@type": "ListItem", position: 1, name: "Acasă", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE_URL}/contact` },
      ],
    },
  };

  return (
    <>
      <JsonLd data={contactJsonLd} />
      <Header />
      <main className="pt-[var(--nav-height)]">
        <section className="py-16 lg:py-24 border-b border-border">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            <p className="section-subtitle mb-3">Hai să vorbim</p>
            <h1 className="font-display text-display-lg text-text-primary">
              Contact
            </h1>
          </div>
        </section>

        <section className="py-16 lg:py-32">
          <div className="mx-auto max-w-8xl px-6 lg:px-12">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
              {/* Info */}
              <div>
                <h2 className="font-display text-2xl tracking-widest text-text-primary mb-8 gold-line">
                  Informații de contact
                </h2>

                <dl className="space-y-6">
                  <div>
                    <dt className="font-body text-xs uppercase tracking-widest text-accent mb-1">
                      Locație
                    </dt>
                    <dd className="font-body text-sm text-text-muted">
                      Cluj-Napoca, România
                    </dd>
                  </div>
                  <div>
                    <dt className="font-body text-xs uppercase tracking-widest text-accent mb-1">
                      Email
                    </dt>
                    <dd>
                      <a
                        href="mailto:contact@alexandrastefana.studio"
                        className="font-body text-sm text-text-muted transition-colors hover:text-accent"
                      >
                        contact@alexandrastefana.studio
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-body text-xs uppercase tracking-widest text-accent mb-1">
                      Instagram
                    </dt>
                    <dd>
                      <a
                        href="https://www.instagram.com/alexandrastefana.studio"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm text-text-muted transition-colors hover:text-accent"
                      >
                        @alexandrastefana.studio
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Form */}
              <div>
                <h2 className="font-display text-2xl tracking-widest text-text-primary mb-8 gold-line">
                  Trimite un mesaj
                </h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
