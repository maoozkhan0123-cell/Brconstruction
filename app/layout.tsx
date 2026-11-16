import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatWidget from "@/components/ChatWidget";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import "./globals.css";
import "./contact-details.css";
import "./chat-widget.css";
import "./company-proof.css";
import "./construction-hero.css";
import "./construction-sections.css";
import "./floating-whatsapp.css";
import { company } from "@/data/company";
import { getSiteOrigin } from "@/lib/site-url";
const origin = getSiteOrigin();
export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: "BR Construction — Constructing Legacies. Architecting Visions.",
    template: "%s | BR Construction",
  },
  description:
    "Residential and commercial construction, grey structure, renovation, engineering, and interiors in Karachi. A coordinated approach from planning to handover.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BR Construction",
    title: "BR Construction — Constructing Legacies. Architecting Visions.",
    description:
      "Construction comes first. Coordinated engineering, architecture, and interiors, from planning to handover.",
    images: [
      {
        url: "/images/construction-hero-poster.webp",
        width: 1280,
        height: 720,
        alt: "Construction planning visual from the BR Construction brand film",
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
        <FloatingWhatsApp />
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
                "Construction-led residential and commercial delivery, supported by engineering, architecture, renovation, and interior design.",
            }),
          }}
        />
      </body>
    </html>
  );
}
