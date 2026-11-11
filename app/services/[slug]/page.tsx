import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { services } from "@/data/services";
import { projects } from "@/data/projects";
import { getSiteOrigin } from "@/lib/site-url";

type PageProps = { params: Promise<{ slug: string }> };
const origin = getSiteOrigin();

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: service.intro,
    alternates: { canonical: `${origin}/services/${service.slug}` },
    openGraph: {
      title: `${service.title} | BR Construction`,
      description: service.description,
      images: [
        {
          url: `${origin}${service.image}`,
          alt: `${service.shortTitle} illustrative architectural reference`,
        },
      ],
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const related = projects
    .filter((project) => project.service === service.slug)
    .slice(0, 2);
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: "Expertise",
        item: `${origin}/#expertise`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.shortTitle,
        item: `${origin}/services/${service.slug}`,
      },
    ],
  };
  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c"),
        }}
      />
      <section className="detail-hero service-detail-hero">
        <img
          src={service.image}
          alt={`Illustrative architectural reference for ${service.shortTitle.toLowerCase()}`}
          width={1920}
          height={1280}
          fetchPriority="high"
        />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <Link className="text-link" href="/#expertise">
            Our expertise <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <p className="section-label">
            Discipline {service.number} / BR Construction
          </p>
          <h1 className="display-heading">{service.title}</h1>
          <p>{service.description}</p>
          <Link
            className="button button-gold"
            href={`/?service=${service.slug}#contact`}
          >
            Start a conversation <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <span className="service-image-credit">
          Illustrative architectural reference
        </span>
      </section>
      <div className="detail-body">
        <section className="detail-intro">
          <div>
            <p className="section-label">One vision. Every discipline.</p>
            <h2 className="display-heading">
              Considered from
              <br />
              every angle.
            </h2>
          </div>
          <div>
            <p>{service.intro}</p>
            <p>
              Project scope, professional appointments, required approvals,
              cost, and programme are established during consultation and
              confirmed in a written agreement.
            </p>
          </div>
        </section>
        <section className="service-capabilities">
          <div>
            <p className="section-label">What we bring</p>
            <h2 className="display-heading">
              Expertise,
              <br />
              in detail.
            </h2>
          </div>
          <ul>
            {service.capabilities.map((capability) => (
              <li key={capability}>
                <Check size={18} aria-hidden="true" />
                {capability}
              </li>
            ))}
          </ul>
        </section>
        <section className="service-approach">
          <p className="section-label">A connected approach</p>
          <h2 className="display-heading">Clarity at every stage.</h2>
          <div className="detail-grid">
            {service.approach.map((step, index) => (
              <div className="detail-section" key={step}>
                <span className="section-label">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>
        {related.length > 0 && (
          <section className="related-projects">
            <p className="section-label">
              Illustrative studies / Not completed company work
            </p>
            <h2 className="display-heading">Explore the possibilities.</h2>
            <div className="related-project-grid">
              {related.map((project) => (
                <Link
                  className="project-card"
                  href={`/projects/${project.slug}`}
                  key={project.slug}
                >
                  <div className="project-image">
                    <img
                      src={project.image}
                      alt={project.gallery[0].alt}
                      width={1000}
                      height={750}
                      loading="lazy"
                    />
                  </div>
                  <div className="project-meta">
                    <span className="section-label">
                      {project.category} / Concept
                    </span>
                    <h3>
                      {project.title}
                      <ArrowUpRight size={22} aria-hidden="true" />
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="detail-outcome">
          <p className="section-label">Your next chapter</p>
          <h2 className="display-heading">
            Let’s give your
            <br />
            vision a foundation.
          </h2>
          <p>
            Tell us about the space you have in mind. We’ll begin with the
            brief, the possibilities, and the questions that matter to your
            project.
          </p>
          <Link
            className="button button-gold"
            href={`/?service=${service.slug}#contact`}
          >
            Discuss your project <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
