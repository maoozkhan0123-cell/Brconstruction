import Link from "@/components/Link";
import { Arrow } from "./Icons";
import CinematicVideo from "./CinematicVideo";

export default function ConstructionHero() {
  return (
    <section
      id="home"
      className="construction-hero"
      aria-labelledby="construction-hero-title"
    >
      {/* This decorative brand film is supplied by the owner, not a case study. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="construction-hero__poster"
        src="/images/construction-hero-poster.webp"
        alt=""
        aria-hidden="true"
        width="1280"
        height="720"
        fetchPriority="high"
        loading="eager"
      />
      <CinematicVideo source={process.env.NEXT_PUBLIC_HERO_VIDEO_URL} />
      <div className="construction-hero__shade" aria-hidden="true" />

      <div className="construction-hero__content">
        <h1 id="construction-hero-title">
          <span className="construction-hero__primary">
            Constructing <em>Legacies.</em>
          </span>{" "}
          <span className="construction-hero__secondary">
            Architecting Visions.
          </span>
        </h1>
        <p className="construction-hero__intro">
          From strong foundations to the final finish. We bring construction,
          engineering and thoughtful design together to shape your next space.
        </p>
        <div className="construction-hero__actions">
          <Link href="/#contact" className="button button-gold">
            Discuss your construction project <Arrow diagonal />
          </Link>
          <Link href="/#expertise" className="button button-outline">
            Explore our services <Arrow diagonal />
          </Link>
        </div>
      </div>

    </section>
  );
}
