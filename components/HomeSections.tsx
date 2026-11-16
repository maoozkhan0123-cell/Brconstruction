"use client";
import Link from "@/components/Link";
import { useEffect, useState } from "react";
import { Arrow } from "./Icons";
import ContactForm from "./ContactForm";
import ProjectExplorer from "./ProjectExplorer";
import ConstructionHero from "./ConstructionHero";
import { ConstructionServices, ConstructionProcess, ConstructionFAQs } from "./ConstructionSections";
import ContactDetails from "./ContactDetails";
function About() {
  return (
    <section id="about" className="about-section light-section section-pad">
      <div className="about-text reveal">
        <span className="section-label">
          <i />
          01 / WHO WE ARE
        </span>
        <h2 className="display-heading">
          Built on vision.
          <br />
          Defined by
          <br />
          <em>precision.</em>
        </h2>
        <p className="large-copy">
          Extraordinary spaces begin with a shared vision. And the expertise to
          see it through.
        </p>
        <p>
          Construction is at the heart of BR Construction. We connect site
          execution, engineering, architectural design, and interiors around
          one considered plan, from the first scope discussion to the final
          finishing detail.
        </p>
        <Link href="/about" className="text-link">
          Discover our story <Arrow diagonal />
        </Link>
      </div>
      <div className="about-composition reveal">
        <div className="about-outline" />
        <img
          className="about-main"
          src="/images/about.webp"
          alt="Illustrative contemporary residence framed by natural surroundings"
          loading="lazy"
          width="1000"
          height="1200"
        />
        <div className="about-detail">
          <img
            src="/images/detail-01.webp"
            alt="Warm material palette and refined interior detailing — visual reference"
            loading="lazy"
            width="600"
            height="700"
          />
          <span>A CONSIDERED APPROACH. EVERY DETAIL.</span>
        </div>
        <span className="image-coordinate">
          FIG. 01 — THE LANGUAGE OF SPACE
        </span>
        <span className="vertical-annotation">
          ARCHITECTURE IS A WAY OF SEEING.
        </span>
      </div>
    </section>
  );
}
function Portfolio() {
  return (
    <section
      id="projects"
      className="portfolio-section light-section section-pad"
    >
      <div className="section-intro reveal">
        <div>
          <span className="section-label">
            <i />
            03 / SPACES & POSSIBILITIES
          </span>
          <h2 className="display-heading">
            Spaces that speak.
            <br />
            <em>Structures that endure.</em>
          </h2>
        </div>
        <p>
          An exploration of form, light, and material.
          <br className="desktop-break" /> A glimpse of what’s possible.
        </p>
      </div>
      <ProjectExplorer />
    </section>
  );
}
function Philosophy() {
  return (
    <section className="philosophy-section">
      <img
        src="/images/philosophy.webp"
        alt="Sculptural architectural forms exploring the interplay of light and shadow — visual reference"
        loading="lazy"
        width="1600"
        height="1000"
      />
      <div className="philosophy-shade" />
      <div className="philosophy-inner">
        <span className="section-label">THE BR PHILOSOPHY</span>
        <h2 className="display-heading">
          Where engineering
          <br />
          meets <em>artistry.</em>
        </h2>
        <p>
          Form and function. Precision and expression.
          <br />
          We believe the most enduring spaces are born
          <br className="desktop-break" /> where these worlds meet.
        </p>
        <div className="principles">
          {[
            [
              "01",
              "Purposeful design",
              "Every decision begins with how a space should function, feel, and evolve.",
            ],
            [
              "02",
              "Structural integrity",
              "Engineering discipline forms the foundation of enduring architecture.",
            ],
            [
              "03",
              "Refined craftsmanship",
              "Materials, proportions, and details are executed with deliberate precision.",
            ],
          ].map(([n, title, text]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function Commitment() {
  const [active, setActive] = useState(0);
  const commitments = [
    {
      title: "Your vision, understood.",
      text: "A remarkable result begins with a thoughtful conversation. We listen closely, ask the right questions, and keep your ambitions at the heart of every decision.",
      label: "OPEN COMMUNICATION",
    },
    {
      title: "Clarity, from the outset.",
      text: "Clear scopes, considered budgets, and coordinated plans create a shared understanding. You should know what comes next and why it matters.",
      label: "THOUGHTFUL TRANSPARENCY",
    },
    {
      title: "Care in every detail.",
      text: "From structural thinking to the touch of a finished surface, we bring the same considered attention to every part of your project.",
      label: "QUALITY & ACCOUNTABILITY",
    },
  ];
  return (
    <section className="commitment-section light-section section-pad">
      <span className="section-label">
        <i />
        05 / OUR COMMITMENT TO YOU
      </span>
      <div className="commitment-content" aria-live="polite">
        <span className="quote-mark" aria-hidden="true">
          “
        </span>
        <h2>{commitments[active].title}</h2>
        <p>{commitments[active].text}</p>
        <span className="section-label">{commitments[active].label}</span>
      </div>
      <div className="commitment-bottom">
        <span>TRUST IS BUILT. EVERY STEP OF THE WAY.</span>
        <div>
          <button
            className="icon-button"
            onClick={() => setActive((active + 2) % 3)}
            aria-label="Previous commitment"
          >
            <Arrow style={{ transform: "rotate(180deg)" }} />
          </button>
          <span>0{active + 1} / 03</span>
          <button
            className="icon-button"
            onClick={() => setActive((active + 1) % 3)}
            aria-label="Next commitment"
          >
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}
export function ContactSection({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  return (
    <section
      id="contact"
      className={`contact-section section-pad ${standalone ? "standalone-contact" : ""}`}
    >
      <div className="contact-intro">
        <span className="section-label">
          <i />
          06 / BEGIN SOMETHING EXTRAORDINARY
        </span>
        {standalone ? (
          <h1 className="display-heading">
            Your vision.
            <br />
            An extraordinary
            <br />
            <em>beginning.</em>
          </h1>
        ) : (
          <h2 className="display-heading">
            Your vision.
            <br />
            An extraordinary
            <br />
            <em>beginning.</em>
          </h2>
        )}
        <p>
          A signature residence. A commercial landmark.
          <br className="desktop-break" /> A space, entirely reimagined. Let’s
          explore
          <br className="desktop-break" /> what’s possible, together.
        </p>
        <ContactDetails />
        <div className="contact-image">
          <img
            src="/images/project-05.webp"
            alt="Illustrative residence with a considered connection to its landscape"
            loading="lazy"
            width="1000"
            height="700"
          />
          <span>EVERY LEGACY STARTS WITH A CONVERSATION.</span>
        </div>
      </div>
      <ContactForm />
    </section>
  );
}
export default function HomeSections() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return (
    <main id="main-content">
      <ConstructionHero />
      <div className="discipline-strip">
        <span>VISION IN EVERY LINE.</span>
        <div>
          <span>Construction</span>
          <i>+</i>
          <span>Engineering</span>
          <i>+</i>
          <span>Architecture</span>
          <i>+</i>
          <span>Interiors</span>
        </div>
        <span>PRECISION IN EVERY DETAIL.</span>
      </div>
      <About />
      <ConstructionServices />
      <Portfolio />
      <Philosophy />
      <ConstructionProcess />
      <Commitment />
      <ConstructionFAQs />
      <ContactSection />
    </main>
  );
}
