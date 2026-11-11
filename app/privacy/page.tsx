import type { Metadata } from "next";
import Link from "@/components/Link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Information",
  description:
    "Information about inquiries and personal data in the BR Construction website preview.",
  alternates: {
    canonical: "https://brconstruction-studio.bytechsol.chatgpt.site/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="legal-page detail-body">
      <p className="section-label">BR Construction / Website information</p>
      <h1 className="display-heading">Privacy information.</h1>
      <div className="demo-notice">
        <p>
          This is a private website preview. This notice describes the preview’s
          intended data handling and requires the company’s review before a
          public business launch. The company’s legal identity, privacy contact,
          and retention schedule have not yet been supplied.
        </p>
      </div>
      <section>
        <h2>Information you choose to provide</h2>
        <p>
          The project inquiry form asks for your name, email, phone number,
          selected service, project location, indicative budget, expected start
          date, and project description. Please avoid including payment details,
          identity documents, access codes, health information, or other
          sensitive material.
        </p>
      </section>
      <section>
        <h2>How inquiries are handled</h2>
        <p>
          Accepted inquiries are stored in the website’s server-side database so
          they can be reviewed and responded to. If the company configures a
          notification service, inquiry information may also be sent to that
          service. A confirmation appears only after the server accepts the
          inquiry; a failed submission does not confirm receipt.
        </p>
      </section>
      <section>
        <h2>Protecting the form</h2>
        <p>
          The form uses validation and spam prevention. The server may process a
          hashed network identifier and request timing information to limit
          abusive submissions. Hosting providers necessarily process network
          requests to operate and secure the website.
        </p>
      </section>
      <section>
        <h2>Service providers</h2>
        <p>
          This preview is hosted through ChatGPT Sites using Cloudflare
          infrastructure. Those providers process technical data under their own
          terms. Any additional email or customer relationship service must be
          configured and reviewed by the company before it is used.
        </p>
      </section>
      <section>
        <h2>Retention and your choices</h2>
        <p>
          A company-approved retention period and verified privacy contact are
          required before a public launch. In this preview, use demonstration
          details when testing. If you need to access, correct, or delete an
          inquiry you submitted, contact the person who shared this private
          preview so the site owner can handle the request.
        </p>
      </section>
      <section>
        <h2>Cookies and local preferences</h2>
        <p>
          This implementation does not require advertising trackers or an
          analytics account. The hosting platform may use security or access
          cookies. Any future analytics, marketing tools, or nonessential
          cookies require a review of this notice and applicable consent
          requirements.
        </p>
      </section>
      <Link className="text-link" href="/">
        Return to the studio <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </main>
  );
}
