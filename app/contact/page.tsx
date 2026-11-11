import type { Metadata } from "next";
import { ContactSection } from "@/components/HomeSections";
export const metadata: Metadata = {
  title: "Start Your Project",
  description:
    "Begin a conversation about your architecture, construction, engineering, or interior design project with BR Construction.",
  alternates: { canonical: "/contact" },
};
export default function Contact() {
  return (
    <main id="main-content">
      <ContactSection standalone />
    </main>
  );
}
