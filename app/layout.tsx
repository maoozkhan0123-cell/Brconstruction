import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";
import "./contact-details.css";
import "./chat-widget.css";
import "./company-proof.css";
import { company } from "@/data/company";
import { getSiteOrigin } from "@/lib/site-url";
const origin = getSiteOrigin();
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
  icons: { icon: "/favicon.svg?v=br-logo" },
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
        <ChatWidget />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BR Construction",
              url: origin,
              email: company.email,
              telephone: company.phones[0].number,
              address: {
                "@type": "PostalAddress",
                streetAddress: `${company.address.line1}, ${company.address.line2}`,
                addressLocality: company.address.city,
                addressCountry: company.address.country,
              },
              contactPoint: company.phones.map(phone => ({
                "@type": "ContactPoint",
                telephone: phone.number,
                email: company.email,
                contactType: "project inquiries",
              })),
              description:
                "Integrated architecture, engineering, construction, and interior design.",
            }),
          }}
        />
      </body>
    </html>
  );
}
