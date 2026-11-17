"use client";

import { useCallback, useEffect, useState } from "react";

type Slide = {
  src: string;
  alt: string;
  title: string;
  tag: string;
};

/** Owner-supplied BR Construction design work. */
const slides: Slide[] = [
  {
    src: "/images/work-villa-entrance.webp",
    alt: "Classical villa entrance with a tall carved arch, stone pilasters and calligraphy medallion",
    title: "Classical Villa — Grand Entrance",
    tag: "Architecture",
  },
  {
    src: "/images/work-villa-garden.webp",
    alt: "Two-storey classical villa with balustraded terrace, lounge and landscaped garden",
    title: "Classical Villa — Garden Elevation",
    tag: "Architecture & Landscape",
  },
  {
    src: "/images/work-modern-facade.webp",
    alt: "Contemporary two-storey residence with stone cladding, timber louvres and double carport",
    title: "Contemporary Residence — Facade",
    tag: "Elevation Design",
  },
  {
    src: "/images/work-bedroom-render.webp",
    alt: "Master bedroom with arched wall panelling, fluted accents and a globe chandelier",
    title: "Master Bedroom Interior",
    tag: "Interior Design",
  },
  {
    src: "/images/work-pergola-terrace.webp",
    alt: "Outdoor dining terrace under an arched pergola with climbing vines and patterned tiles",
    title: "Pergola Dining Terrace",
    tag: "Outdoor Living",
  },
];

const INTERVAL = 2000;
const pad = (n: number) => String(n).padStart(2, "0");

export default function AboutShowcase() {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const go = useCallback(
    (next: number) => setIndex(next % slides.length),
    [],
  );

  const autoplay = !reducedMotion;
  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [autoplay, index, go]);

  const current = slides[index];

  return (
    <div
      className={`about-showcase reveal${autoplay ? " is-playing" : ""}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected BR Construction design work"
    >
      <div className="about-showcase__stage">
        {slides.map((slide, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.src}
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            aria-hidden={i !== index}
            className={i === index ? "is-active" : ""}
            loading={i <= 1 ? "eager" : "lazy"}
            decoding="async"
          />
        ))}

        <span className="about-showcase__tag" key={`t-${index}`}>
          {current.tag}
        </span>

        <div className="about-showcase__caption" aria-live="polite">
          <span className="about-showcase__count">
            {pad(index + 1)}
            <i>/ {pad(slides.length)}</i>
          </span>
          <span className="about-showcase__title" key={current.src}>
            {current.title}
          </span>
        </div>

        <div className="about-showcase__progress" key={`p-${index}`}>
          <span style={{ animationDuration: `${INTERVAL}ms` }} />
        </div>
      </div>

      {/* Rotating brand seal */}
      <div className="about-showcase__seal" aria-hidden="true">
        <svg viewBox="0 0 120 120">
          <defs>
            <path id="about-seal-path" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
          </defs>
          <text>
            <textPath href="#about-seal-path">
              DESIGN • ENGINEER • BUILD • DELIVER •
            </textPath>
          </text>
        </svg>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/br-construction-logo-600.webp" alt="" />
      </div>

    </div>
  );
}
