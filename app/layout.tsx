import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";
const origin = "https://brconstruction-studio.bytechsol.chatgpt.site";
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: "BR Construction — Architecting Visions. Constructing Legacies.",
    template: "%s | BR Construction",
  },
  description:
    "Architecture, structural engineering, construction, and bespoke interiors. An integrated approach to extraordinary spaces, from concept to completion.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BR Construction",
    title: "BR Construction — Architecting Visions. Constructing Legacies.",
    description:
      "Visionary architecture. Intelligent engineering. Extraordinary spaces.",
    images: [
      {
        url: "/images/hero.webp",
        width: 1920,
        height: 1280,
        alt: "Contemporary architecture — illustrative design reference",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/cormorant-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BR Construction",
              url: origin,
              description:
                "Integrated architecture, engineering, construction, and interior design.",
            }),
          }}
        />
      </body>
    </html>
  );
}
