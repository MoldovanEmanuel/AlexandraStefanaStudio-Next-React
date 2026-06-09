import { motion } from "framer-motion";

const services = [
  {
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10 text-accent">
        <rect x="8" y="8" width="44" height="44" />
        <line x1="8" y1="22" x2="52" y2="22" />
        <line x1="22" y1="22" x2="22" y2="52" />
        <line x1="36" y1="22" x2="36" y2="52" />
      </svg>
    ),
    title: "Design Interior",
    description:
      "Concepem spații rezidențiale și comerciale cu atenție la detalii, funcționalitate și estetică rafinată.",
  },
  {
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10 text-accent">
        <rect x="10" y="18" width="40" height="28" />
        <polyline points="10,18 30,6 50,18" />
        <rect x="22" y="30" width="16" height="16" />
      </svg>
    ),
    title: "Proiecte Rezidențiale",
    description:
      "De la apartamente la vile, creăm acasă personalizate care reflectă stilul și personalitatea proprietarilor.",
  },
  {
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10 text-accent">
        <rect x="6" y="16" width="48" height="34" />
        <rect x="14" y="24" width="12" height="8" />
        <rect x="34" y="24" width="12" height="8" />
        <line x1="6" y1="50" x2="54" y2="50" />
      </svg>
    ),
    title: "Spații Comerciale",
    description:
      "Birouri, restaurante, boutique-uri — transformăm spațiile comerciale în experiențe memorabile pentru clienți.",
  },
  {
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10 text-accent">
        <circle cx="30" cy="30" r="22" />
        <path d="M20 30 Q30 16 40 30 Q30 44 20 30" />
        <circle cx="30" cy="30" r="4" fill="currentColor" />
      </svg>
    ),
    title: "Vizualizare 3D",
    description:
      "Randări și animații 3D fotorealiste care aduc proiectele la viață înainte de execuție.",
  },
];

export function ServicesSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto max-w-8xl px-6 lg:px-12">
        <div className="mb-16">
          <p className="section-subtitle mb-3">Ce oferim</p>
          <h2 className="section-title">Servicii</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <div
              key={service.title}
              className="group border border-border p-8 transition-all duration-500 hover:border-accent/40 hover:bg-bg-card"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-6">{service.icon}</div>
              <h3 className="font-display text-xl tracking-widest text-text-primary mb-3">
                {service.title}
              </h3>
              <p className="font-body text-sm text-text-muted leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
