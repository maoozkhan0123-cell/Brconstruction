"use client";
import Link from "@/components/Link";
import { useEffect, useState } from "react";
import { Arrow } from "./Icons";
import ContactForm from "./ContactForm";
import ProjectExplorer from "./ProjectExplorer";
import ConstructionHero from "./ConstructionHero";
import { ConstructionServices, ConstructionProcess, ConstructionFAQs } from "./ConstructionSections";
import ContactDetails from "./ContactDetails";
import AboutShowcase from "./AboutShowcase";
import {
  Building2,
  ClipboardCheck,
  Compass,
  DraftingCompass,
  Gem,
  HardHat,
  MessagesSquare,
  PanelsTopLeft,
  ShieldCheck,
} from "lucide-react";

const aboutPillars = [
  { icon: HardHat, title: "Construction", text: "Site execution & supervision" },
  { icon: Building2, title: "Engineering", text: "Structure & civil works" },
  { icon: DraftingCompass, title: "Architecture", text: "Concepts & drawings" },
  { icon: PanelsTopLeft, title: "Interiors", text: "Fit-outs & finishes" },
];
function About() {
  return (
    <section id="about" className="about-section light-section section-pad">
      <div className="about-backdrop" aria-hidden="true">
        <span>BR</span>
      </div>
      <div className="about-text reveal">
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
        <ul className="about-pillars">
          {aboutPillars.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <span className="about-pillars__icon">
                <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <AboutShowcase />
    </section>
  );
}
function Portfolio() {
  return (
    <section
      id="projects"
      className="portfolio-section section-pad"
    >
      <div className="section-intro reveal">
        <h2 className="display-heading">
          Spaces that speak.
          <br />
          <em>Structures that endure.</em>
        </h2>
      </div>
      <ProjectExplorer />
    </section>
  );
}
const principles = [
  {
    icon: Compass,
    title: "Purposeful design",
    text: "Every decision begins with how a space should function, feel, and evolve.",
  },
  {
    icon: Building2,
    title: "Structural integrity",
    text: "Engineering discipline forms the foundation of enduring architecture.",
  },
  {
    icon: Gem,
    title: "Refined craftsmanship",
    text: "Materials, proportions, and details are executed with deliberate precision.",
  },
];

/** BR Construction renders for Villa 36 — two per principle. */
const philosophySlides = [
  { principle: 0, image: "/images/villa36-living-dining.webp", caption: "Open-plan living & dining", alt: "Double-height living and dining room with sculptural lighting, Villa 36" },
  { principle: 0, image: "/images/villa36-bedroom.webp", caption: "Master bedroom", alt: "Bedroom with upholstered bed and metal wall art, Villa 36" },
  { principle: 1, image: "/images/villa36-staircase.webp", caption: "Floating glass staircase", alt: "Cantilevered stone staircase with glass balustrade and indoor planter, Villa 36" },
  { principle: 1, image: "/images/villa36-lounge.webp", caption: "Marble feature lounge", alt: "Lounge with full-height marble feature wall and ring chandelier, Villa 36" },
  { principle: 2, image: "/images/villa36-wardrobe.webp", caption: "Backlit glass wardrobe", alt: "Walk-in style glass wardrobe with timber shelving and dressing table, Villa 36" },
  { principle: 2, image: "/images/villa36-tv-wall.webp", caption: "Marble TV wall & display", alt: "Marble media wall with lit timber display niche, Villa 36" },
];

const PRINCIPLE_INTERVAL = 2800;

function Philosophy() {
  const [slide, setSlide] = useState(0);
  const [hovering, setHovering] = useState(false);
  const active = philosophySlides[slide].principle;
  const showPrinciple = (index: number) =>
    setSlide(philosophySlides.findIndex((item) => item.principle === index));

  useEffect(() => {
    if (hovering || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(
      () => setSlide((slide + 1) % philosophySlides.length),
      PRINCIPLE_INTERVAL,
    );
    return () => window.clearTimeout(timer);
  }, [slide, hovering]);

  return (
    <section className="philosophy-section section-pad">
      <div className="philosophy-copy reveal">
        <h2 className="display-heading">
          Where engineering
          <br />
          meets <em>artistry.</em>
        </h2>
        <p className="philosophy-lead">
          Form and function. Precision and expression. We believe the most
          enduring spaces are born where these worlds meet.
        </p>
        <ol
          className="philosophy-principles"
          onMouseLeave={() => setHovering(false)}
        >
          {principles.map(({ icon: Icon, title, text }, index) => (
            <li key={title}>
              <button
                type="button"
                className={index === active ? "is-active" : ""}
                aria-pressed={index === active}
                onMouseEnter={() => {
                  setHovering(true);
                  if (index !== active) showPrinciple(index);
                }}
                onFocus={() => {
                  if (index !== active) showPrinciple(index);
                }}
                onClick={() => showPrinciple(index)}
              >
                <span className="philosophy-principles__icon">
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <span className="philosophy-principles__body">
                  <strong>
                    <span>0{index + 1}</span>
                    {title}
                  </strong>
                  <small>{text}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className="philosophy-visual reveal">
        <div className="philosophy-visual__frame" aria-hidden="true" />
        <div className="philosophy-visual__stage">
          {philosophySlides.map((item, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.image}
              src={item.image}
              alt={index === slide ? item.alt : ""}
              aria-hidden={index !== slide}
              className={index === slide ? "is-active" : ""}
              loading="lazy"
              decoding="async"
            />
          ))}
          <div className="philosophy-visual__caption" key={slide}>
            <span>0{active + 1}</span>
            <strong>{principles[active].title}</strong>
            <small>Villa 36 · {philosophySlides[slide].caption}</small>
          </div>
          <div className="philosophy-visual__bars" aria-hidden="true">
            {philosophySlides.map((item, index) => (
              <i
                key={item.image}
                className={index === slide ? "is-active" : index < slide ? "is-done" : ""}
              >
                {index === slide && !hovering && (
                  <b key={slide} style={{ animationDuration: `${PRINCIPLE_INTERVAL}ms` }} />
                )}
              </i>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const commitments = [
  {
    icon: MessagesSquare,
    label: "Open communication",
    title: "Your vision, understood.",
    text: "A remarkable result begins with a thoughtful conversation. We listen closely, ask the right questions, and keep your ambitions at the heart of every decision.",
  },
  {
    icon: ClipboardCheck,
    label: "Thoughtful transparency",
    title: "Clarity, from the outset.",
    text: "Clear scopes, considered budgets, and coordinated plans create a shared understanding. You should know what comes next and why it matters.",
  },
  {
    icon: ShieldCheck,
    label: "Quality & accountability",
    title: "Care in every detail.",
    text: "From structural thinking to the touch of a finished surface, we bring the same considered attention to every part of your project.",
  },
];

const commitmentTicker = [
  "Open communication",
  "Clear scopes",
  "Considered budgets",
  "Site supervision",
  "Structural thinking",
  "Quality finishes",
  "One accountable team",
];

function Commitment() {
  return (
    <section id="commitment" className="commitment-section section-pad">
      <div className="commitment-intro reveal">
        <h2 className="display-heading">
          Trust is built.
          <br />
          <em>Every step of the way.</em>
        </h2>
      </div>

      <ol className="commitment-grid">
        {commitments.map(({ icon: Icon, label, title, text }, index) => (
          <li
            className="commitment-card reveal"
            key={title}
            style={{ animationDelay: `${index * 110}ms` }}
          >
            <span className="commitment-card__glow" aria-hidden="true" />
            <div className="commitment-card__top">
              <span className="commitment-card__icon">
                <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span className="commitment-card__number" aria-hidden="true">
                0{index + 1}
              </span>
            </div>
            <span className="commitment-card__label">{label}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="commitment-card__quote" aria-hidden="true">
              &rdquo;
            </span>
          </li>
        ))}
      </ol>

      <div className="commitment-ticker" aria-hidden="true">
        <div>
          {[...commitmentTicker, ...commitmentTicker].map((item, i) => (
            <span key={i}>
              {item}
              <i>✦</i>
            </span>
          ))}
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
