"use client";
import Link from "@/components/Link";
import { useEffect, useState } from "react";
import { Arrow } from "./Icons";
import { services } from "@/data/services";
import ContactForm from "./ContactForm";
import ProjectExplorer from "./ProjectExplorer";
import CinematicVideo from "./CinematicVideo";

const slides = [
  {
    image: "/images/hero.webp",
    title: "A study in quiet luxury",
    category: "RESIDENTIAL ARCHITECTURE",
  },
  {
    image: "/images/project-02.webp",
    title: "The art of feeling at home",
    category: "BESPOKE INTERIORS",
  },
  {
    image: "/images/project-03.webp",
    title: "Space shaped around you",
    category: "DESIGN & CONSTRUCTION",
  },
  {
    image: "/images/project-04.webp",
    title: "A new perspective on possibility",
    category: "COMMERCIAL ARCHITECTURE",
  },
];
const stages = [
  {
    title: "Discover & conceptualize",
    label: "THE VISION",
    copy: "We begin by listening. Your ambitions, the way you live, and the possibilities of the site form the foundation for everything that follows.",
    image: "/images/about.webp",
  },
  {
    title: "Design & engineer",
    label: "THE INTELLIGENCE",
    copy: "Architectural ideas take shape through considered plans, structural thinking, material exploration, and a coordinated strategy for approvals.",
    image: "/images/project-04.webp",
  },
  {
    title: "Construct & execute",
    label: "THE CRAFT",
    copy: "With a shared plan in place, we coordinate site operations, materials, engineering execution, and quality reviews to bring the design to life.",
    image: "/images/project-03.webp",
  },
  {
    title: "Refine & handover",
    label: "THE FINAL DETAIL",
    copy: "Finishes, interior details, inspections, and documentation come together in a considered handover. A complete space, ready for its next chapter.",
    image: "/images/detail-01.webp",
  },
];

function Hero() {
  const [slide, setSlide] = useState(0);
  const [visited, setVisited] = useState([0]);
  const showSlide = (index: number) => {
    setVisited((previous) =>
      previous.includes(index) ? previous : [...previous, index],
    );
    setSlide(index);
  };
  return (
    <section
      id="home"
      className="hero"
      aria-label="BR Construction introduction"
    >
      <div className="hero-images">
        {slides.map((item, i) => (
          <img
            key={item.image}
            className={i === slide ? "current" : ""}
            src={visited.includes(i) ? item.image : undefined}
            alt={
              i === slide
                ? "Illustrative contemporary architecture with sculptural lines and considered natural light"
                : ""
            }
            width="1920"
            height="1280"
            fetchPriority={i === 0 ? "high" : "auto"}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      <CinematicVideo
        source={process.env.NEXT_PUBLIC_HERO_VIDEO_URL}
        active={slide === 0}
      />
      <div className="hero-shade" />
      <div className="hero-side-note">FORM / FUNCTION / FEELING</div>
      <div className="hero-content">
        <div className="eyebrow">
          <span /> DESIGN. ENGINEER. BUILD. TRANSFORM.
        </div>
        <h1>
          <span className="hero-heading-line">Architecting <em>Visions.</em></span>
          <span className="hero-heading-line">Constructing Legacies.</span>
        </h1>
        <p>
          Visionary architecture. Intelligent engineering.
          <br className="desktop-break" /> Extraordinary spaces, from the first
          sketch to the final detail.
        </p>
        <div className="hero-actions">
          <Link href="/#projects" className="button button-gold">
            Explore our projects <Arrow diagonal />
          </Link>
          <Link href="/#contact" className="button button-outline">
            Book a consultation <Arrow diagonal />
          </Link>
        </div>
      </div>
      <div className="hero-bottom">
        <a href="#about" className="scroll-cue">
          <span className="scroll-line" /> SCROLL TO DISCOVER
        </a>
        <div className="hero-project" aria-live="polite">
          <span className="section-label">
            {slides[slide].category} / VISUAL REFERENCE
          </span>
          <span>{slides[slide].title}</span>
        </div>
        <div className="hero-controls">
          <span>
            0{slide + 1}
            <i> / 04</i>
          </span>
          <div className="slide-tracks">
            {slides.map((_, i) => (
              <button
                key={i}
                className={slide === i ? "current" : ""}
                onClick={() => showSlide(i)}
                aria-label={`Show architectural image ${i + 1}`}
                aria-pressed={slide === i}
              />
            ))}
          </div>
          <button
            className="hero-next"
            onClick={() => showSlide((slide + 1) % slides.length)}
            aria-label="Next architectural image"
          >
            <Arrow />
          </button>
        </div>
      </div>
      <div className="hero-edition">
        BR / AN INTEGRATED DESIGN & BUILD PRACTICE
      </div>
    </section>
  );
}
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
          At BR Construction, we bring imagination, engineering intelligence,
          and uncompromising craftsmanship together. From the first
          architectural sketch to the final handcrafted detail, our approach is
          considered, connected, and complete.
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
function Expertise() {
  const [active, setActive] = useState<number | null>(0);
  return (
    <section id="expertise" className="expertise-section section-pad">
      <div className="section-intro reveal">
        <div>
          <span className="section-label">
            <i />
            02 / OUR EXPERTISE
          </span>
          <h2 className="display-heading">
            One vision.
            <br />
            <em>Every discipline.</em>
          </h2>
        </div>
        <p>
          From concept to completion, an integrated
          <br className="desktop-break" /> practice. A single, uncompromising
          standard.
        </p>
      </div>
      <div className="expertise-cards">
        {services.map((service, index) => (
          <article
            key={service.slug}
            className={`expertise-card ${active === index ? "expanded" : ""}`}
          >
            <img
              src={service.image}
              alt=""
              width="1000"
              height="1200"
              loading="lazy"
            />
            <div className="expertise-overlay" />
            <button
              className="expertise-toggle"
              onClick={() => setActive(active === index ? null : index)}
              aria-expanded={active === index}
              aria-controls={`expertise-${index}`}
            >
              <span className="expertise-number">{service.number}</span>
              <span className="expertise-title">{service.shortTitle}</span>
              <span className="expand-sign">
                {active === index ? "−" : "+"}
              </span>
            </button>
            <div
              className="expertise-content"
              id={`expertise-${index}`}
              hidden={active !== index}
            >
              <p>{service.description}</p>
              <ul>
                {service.capabilities.slice(0, 4).map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
              <Link className="text-link" href={`/services/${service.slug}`}>
                Explore expertise <Arrow diagonal />
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="expertise-foot">
        <span>FOUR DISCIPLINES. ONE SEAMLESS EXPERIENCE.</span>
        <Link href="/#contact" className="text-link">
          Find your starting point <Arrow diagonal />
        </Link>
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
function Process() {
  const [active, setActive] = useState(0);
  return (
    <section id="process" className="process-section section-pad">
      <div className="section-intro reveal">
        <div>
          <span className="section-label">
            <i />
            04 / HOW WE BRING IT TO LIFE
          </span>
          <h2 className="display-heading">
            From first sketch
            <br />
            to <em>final signature.</em>
          </h2>
        </div>
        <p>
          Clarity at every stage.
          <br />
          Confidence in every decision.
        </p>
      </div>
      <div className="process-visual">
        <div className="process-image">
          {stages.map((stage, i) => (
            <img
              key={stage.title}
              src={stage.image}
              alt={
                i === active
                  ? `${stage.title} — architectural visual reference`
                  : ""
              }
              width="1200"
              height="900"
              loading="lazy"
              className={i === active ? "current" : ""}
            />
          ))}
          <span className="process-image-label">
            THE PROCESS / 0{active + 1}
          </span>
        </div>
        <div className="process-description" aria-live="polite">
          <span className="process-large-number">0{active + 1}</span>
          <span className="section-label">{stages[active].label}</span>
          <h3>{stages[active].title}</h3>
          <p>{stages[active].copy}</p>
          <Link href="/#contact" className="text-link">
            Begin the conversation <Arrow diagonal />
          </Link>
        </div>
      </div>
      <div className="process-timeline" aria-label="Explore our process">
        {stages.map((stage, i) => (
          <button
            key={stage.title}
            onClick={() => setActive(i)}
            aria-pressed={active === i}
            className={i <= active ? "reached" : ""}
          >
            <span className="timeline-node" />
            <span className="section-label">0{i + 1}</span>
            <strong>{stage.title}</strong>
            <Arrow diagonal />
          </button>
        ))}
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
      <Hero />
      <div className="discipline-strip">
        <span>VISION IN EVERY LINE.</span>
        <div>
          <span>Architecture</span>
          <i>+</i>
          <span>Engineering</span>
          <i>+</i>
          <span>Construction</span>
          <i>+</i>
          <span>Interiors</span>
        </div>
        <span>PRECISION IN EVERY DETAIL.</span>
      </div>
      <About />
      <Expertise />
      <Portfolio />
      <Philosophy />
      <Process />
      <Commitment />
      <ContactSection />
    </main>
  );
}
