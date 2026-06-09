import type { Metadata, Viewport } from "next";
import { League_Gothic, Montserrat } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const leagueGothic = League_Gothic({
  subsets: ["latin"],
  variable: "--font-league-gothic",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const SITE_URL = process.env.APP_URL ?? "https://alexandrastefana.studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Alexandra Stefana Studio | Design Interior Cluj-Napoca",
    template: "%s | Alexandra Stefana Studio",
  },
  description:
    "Studio de design interior în Cluj-Napoca, specializat în soluții rezidențiale și comerciale. Design elegant, personalizat și funcțional.",
  keywords: [
    "design interior",
    "Cluj-Napoca",
    "design rezidențial",
    "design comercial",
    "3D vizualizare",
    "studio design",
  ],
  authors: [{ name: "Alexandra Stefana Studio" }],
  creator: "Alexandra Stefana Studio",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: SITE_URL,
    siteName: "Alexandra Stefana Studio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Alexandra Stefana Studio — Design Interior",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0b09",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ro"
      className={`${leagueGothic.variable} ${montserrat.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
