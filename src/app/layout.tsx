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
    default: "Alexandra Stefana — Interior Design Studio Cluj-Napoca",
    template: "%s | Alexandra Stefana Studio",
  },
  description:
    "Alexandra Stefana is an interior design studio based in Cluj-Napoca, Romania. We design personal, functional spaces — from family homes to commercial interiors.",
  keywords: [
    "interior design",
    "Cluj-Napoca",
    "residential design",
    "commercial design",
    "3D visualization",
    "design studio",
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
        url: "/assets/images/about.jpg",
        width: 1200,
        height: 630,
        alt: "Alexandra Stefana Studio — Interior Design",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/images/about.jpg"],
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
      lang="en"
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
