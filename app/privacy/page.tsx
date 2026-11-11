import type { Metadata } from "next";
import Link from "@/components/Link";
import { ArrowUpRight } from "lucide-react";
import { company } from "@/data/company";
import { getSiteOrigin } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Privacy Information",
  description:
    "Information about project inquiries and personal data on the BR Construction website.",
  alternates: {
    canonical: `${getSiteOrigin()}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="legal-page detail-body">
      <p className="section-label">BR Construction / Website information</p>
      <h1 className="display-heading">Privacy information.</h1>
      <div className="demo-notice">
        <p>
          This notice describes how website inquiries are handled. The company’s
          legal identity, retention schedule, and final privacy notice still
          require company approval.
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
          Accepted inquiries are stored in private server-side storage so
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
        <h2>AI chat assistant</h2>
        <p>
          When you send a message in the BR Construction assistant, your message
          and recent conversation are processed by Groq to generate a reply based
          on this website. The conversation stays in this page session and is not
          saved as a project inquiry. Clearing the chat or refreshing the page
          removes the conversation from the assistant. Groq processes requests
          under its own privacy terms. Please avoid sharing sensitive information.
        </p>
        <p>
          AI replies can be inaccurate. Prices, project schedules, and bookings
          require confirmation from our team. To submit a project inquiry, use
          the contact form. The server uses a hashed network identifier and
          message counts to limit abuse without storing chat text in that record.
        </p>
      </section>
      <section>
        <h2>Quotation briefs and WhatsApp</h2>
        <p>
          If you choose to continue from the assistant to the inquiry form, the
          project details you select are temporarily stored in this browser tab
          to fill the form. The handoff link contains a random reference rather
          than your project details. The draft is read once and expires after
          30 minutes. You review it and add your contact information and consent
          before submitting; starting a quotation brief does not send an inquiry.
        </p>
        <p>
          WhatsApp links open a conversation with the company on WhatsApp. You
          choose whether to send a message there. WhatsApp processes that
          conversation under its own terms.
        </p>
      </section>
      <section>
        <h2>Service providers</h2>
        <p>
          The website uses hosting and storage providers to operate the site
          and store accepted project inquiries. Those providers process technical
          data under their own terms. Any additional email or customer
          relationship service must be configured and reviewed by the company
          before it is used.
        </p>
      </section>
      <section>
        <h2>Retention and your choices</h2>
        <p>
          A company-approved retention period still requires confirmation. For
          questions about your submitted inquiry, or to request access,
          correction, or deletion, email{" "}
          <a href={`mailto:${company.email}`}>{company.email}</a>.
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
