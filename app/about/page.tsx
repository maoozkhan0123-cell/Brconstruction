import type { Metadata } from "next";
import Link from "@/components/Link";
import { Arrow } from "@/components/Icons";
export const metadata: Metadata = {
  title: "Our Approach",
  description:
    "Meet the thinking behind BR Construction. An integrated practice connecting architecture, engineering, construction, and interior design.",
  alternates: { canonical: "/about" },
};
export default function About() {
  return (
    <main id="main-content">
      <section className="detail-hero">
        <img
          src="/images/about.webp"
          alt="Contemporary residence — illustrative architectural reference"
          width="1600"
          height="1200"
        />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <span className="section-label">THE BR APPROACH</span>
          <h1 className="display-heading">
            Built on vision.
            <br />
            Defined by <em>precision.</em>
          </h1>
          <p>
            One connected practice. From the first sketch to the final detail.
          </p>
        </div>
      </section>
      <div className="detail-body light-section">
        <div className="detail-intro">
          <span className="section-label">A CONSIDERED PERSPECTIVE</span>
          <h2 className="display-heading">
            Great spaces start
            <br />
            with <em>understanding.</em>
          </h2>
          <p>
            At BR Construction, architecture is more than design, and
            construction is more than execution. We bring together imagination,
            engineering intelligence, and craftsmanship to create environments
            that elevate everyday living.
          </p>
        </div>
        <div className="detail-grid">
          <section className="detail-section">
            <span className="section-label">01 / CONNECTED THINKING</span>
            <h2>Every discipline, in conversation.</h2>
            <p>
              Architecture, structural engineering, construction, and interiors
              share a single purpose: a space that works as beautifully as it
              feels. Our integrated approach brings those perspectives together
              from the outset.
            </p>
          </section>
          <section className="detail-section">
            <span className="section-label">02 / CONSIDERED DELIVERY</span>
            <h2>A clear path through complexity.</h2>
            <p>
              Every project begins with listening. We consider your objectives,
              the site, materials, and the practical steps required to move
              forward, creating a coordinated approach from concept through
              handover.
            </p>
          </section>
        </div>
        <section className="detail-outcome">
          <span className="section-label">LET’S EXPLORE WHAT’S POSSIBLE</span>
          <h2 className="display-heading">
            Your vision.
            <br />
            <em>Our shared purpose.</em>
          </h2>
          <Link className="button button-gold" href="/#contact">
            Begin a conversation <Arrow diagonal />
          </Link>
        </section>
      </div>
    </main>
  );
}
