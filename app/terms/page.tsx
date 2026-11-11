import type { Metadata } from "next";
import Link from "@/components/Link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Website Terms",
  description:
    "Terms and demonstration content information for the BR Construction website preview.",
  alternates: {
    canonical: "https://brconstruction-studio.bytechsol.chatgpt.site/terms",
  },
};

export default function TermsPage() {
  return (
    <main id="main-content" className="legal-page detail-body">
      <p className="section-label">BR Construction / Website information</p>
      <h1 className="display-heading">Website terms.</h1>
      <div className="demo-notice">
        <p>
          These are preview website terms and require company and legal review
          before a public business launch. No contracting entity, jurisdiction,
          or professional registration is represented by this draft.
        </p>
      </div>
      <section>
        <h2>About this preview</h2>
        <p>
          This website presents the proposed BR Construction brand and its
          architecture, engineering, construction, and interior design offering.
          It is a private demonstration until the company supplies and approves
          its authentic business information and project content.
        </p>
      </section>
      <section>
        <h2>Illustrative projects and imagery</h2>
        <p>
          Projects labeled “illustrative concept” are design references. They
          are not delivered BR Construction commissions, client endorsements, or
          evidence of company construction history. Reference photography may
          show buildings and interiors created by other designers and is used to
          communicate a visual direction. No ownership of those buildings or
          designs is claimed.
        </p>
      </section>
      <section>
        <h2>Project discussions</h2>
        <p>
          Submitting an inquiry begins a conversation. It does not create a
          professional appointment, construction contract, fixed quotation,
          booking, or commitment to a delivery date. Scope, price, required
          approvals, professional responsibilities, and contractual terms must
          be agreed separately in writing.
        </p>
      </section>
      <section>
        <h2>Information on this website</h2>
        <p>
          Website material provides general context and is not site-specific
          architectural, structural, engineering, planning, or legal advice.
          Technical feasibility, regulations, structural conditions, and
          material suitability require an appropriate assessment by qualified
          professionals.
        </p>
      </section>
      <section>
        <h2>Use of the inquiry form</h2>
        <p>
          Provide information you are authorized to share. Do not use the form
          to send spam, malicious content, confidential third-party material, or
          sensitive personal information. See the privacy information for how
          accepted inquiries are handled.
        </p>
      </section>
      <section>
        <h2>Content and external services</h2>
        <p>
          Brand assets, text, software, and photography may be subject to
          different rights and licenses. Do not assume that images shown here
          may be reused. External services and hosting infrastructure are
          governed by their respective providers’ terms.
        </p>
      </section>
      <section>
        <h2>Review before public launch</h2>
        <p>
          The site owner must confirm the company’s legal identity, verified
          contact information, professional credentials where relevant, rights
          to published assets, and final privacy and website terms before
          opening this preview as a public business website.
        </p>
      </section>
      <Link className="text-link" href="/">
        Return to the studio <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </main>
  );
}
