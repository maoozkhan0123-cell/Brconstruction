import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projects";
import ProjectGallery from "@/components/ProjectGallery";
import { getSiteOrigin } from "@/lib/site-url";

type PageProps = { params: Promise<{ slug: string }> };
const origin = getSiteOrigin();

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return { title: "Concept not found" };
  return {
    title: `${project.title} — Illustrative Concept`,
    description: `${project.description} An illustrative ${project.category.toLowerCase()} concept, not completed BR Construction work.`,
    alternates: { canonical: `${origin}/projects/${project.slug}` },
    openGraph: {
      title: `${project.title} | BR Construction`,
      description: project.description,
      images: [{ url: `${origin}${project.image}`, alt: project.title }],
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const related = projects
    .filter((item) => item.slug !== project.slug)
    .slice(0, 2);
  const inquiryUrl = `/?service=${encodeURIComponent(project.service)}&project=${encodeURIComponent(project.title)}#contact`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: `${origin}/projects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: project.title,
        item: `${origin}/projects/${project.slug}`,
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
      <section className="detail-hero">
        <img
          src={project.image}
          alt={project.gallery[0].alt}
          width={1920}
          height={1280}
          fetchPriority="high"
        />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <Link className="text-link" href="/projects">
            All projects <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <p className="section-label">
            {project.category} / Illustrative concept
          </p>
          <h1 className="display-heading">{project.title}</h1>
          <p>{project.description}</p>
          <a className="text-link" href="#project-overview">
            Explore the concept <ArrowDown size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
      <div className="detail-body" id="project-overview">
        <div className="demo-notice">
          <span className="section-label">A note on this concept</span>
          <p>
            This project is an illustrative design study. Reference photographs
            are not BR Construction commissions. No client, location, completion
            date, or built project specifications are claimed.
          </p>
        </div>
        <section className="detail-intro">
          <div>
            <p className="section-label">01 / The vision</p>
            <h2 className="display-heading">
              An idea, carefully
              <br />
              considered.
            </h2>
          </div>
          <div>
            <p>{project.overview}</p>
            <dl className="project-specs">
              <div>
                <dt>Discipline</dt>
                <dd>{project.category}</dd>
              </div>
              <div>
                <dt>Project status</dt>
                <dd>Illustrative concept</dd>
              </div>
              <div>
                <dt>Location / area / year</dt>
                <dd>Not applicable to concept</dd>
              </div>
            </dl>
          </div>
        </section>
        <ProjectGallery images={project.gallery} title={project.title} />
        <div className="detail-grid">
          <section className="detail-section">
            <p className="section-label">02 / Concept objectives</p>
            <h2>A sense of purpose.</h2>
            <p>{project.objectives}</p>
          </section>
          <section className="detail-section">
            <p className="section-label">03 / Design & engineering</p>
            <h2>Beauty through resolution.</h2>
            <p>{project.challenge}</p>
          </section>
          <section className="detail-section">
            <p className="section-label">04 / Delivery approach</p>
            <h2>From idea to execution.</h2>
            <p>{project.methodology}</p>
          </section>
          <section className="detail-section">
            <p className="section-label">05 / Material direction</p>
            <h2>A considered palette.</h2>
            <ul className="material-list">
              {project.materials.map((material) => (
                <li key={material}>{material}</li>
              ))}
            </ul>
            <p>
              Materials are illustrative. Final specifications require
              project-specific design and approval.
            </p>
          </section>
        </div>
        <section className="detail-outcome">
          <p className="section-label">06 / The proposition</p>
          <h2 className="display-heading">
            The beginning
            <br />
            of a conversation.
          </h2>
          <p>{project.outcome}</p>
          <Link className="button button-gold" href={inquiryUrl}>
            Discuss a similar vision{" "}
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </section>
        <section className="related-projects">
          <div className="section-heading-row">
            <div>
              <p className="section-label">Continue exploring</p>
              <h2 className="display-heading">Other perspectives.</h2>
            </div>
            <Link className="text-link" href="/projects">
              All concepts <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="related-project-grid">
            {related.map((item) => (
              <Link
                className="project-card"
                href={`/projects/${item.slug}`}
                key={item.slug}
              >
                <div className="project-image">
                  <img
                    src={item.image}
                    alt={item.gallery[0].alt}
                    width={1000}
                    height={750}
                    loading="lazy"
                  />
                </div>
                <div className="project-meta">
                  <span className="section-label">
                    {item.category} / Concept
                  </span>
                  <h3>
                    {item.title}
                    <ArrowUpRight size={22} aria-hidden="true" />
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
