import Link from "@/components/Link";
import ProjectEvidence from "@/components/ProjectEvidence";
import {
  approvedCaseStudies,
  approvedTeam,
  approvedTestimonials,
  isPublishableProofImage,
} from "@/data/company-proof";

export default function CompanyProof() {
  const team = approvedTeam.filter(member => member.publicationPermission === true &&
    member.name.trim() && member.role.trim() && member.biography.trim() &&
    (!member.portrait || isPublishableProofImage(member.portrait)));
  const testimonials = approvedTestimonials.filter(review => review.publicationPermission === true &&
    review.quote.trim() && review.clientName.trim());

  if (!team.length && !testimonials.length) return null;

  return (
    <div className="company-proof">
      {team.length > 0 && (
        <section className="proof-section" aria-labelledby="proof-team-title">
          <span className="section-label">THE PEOPLE BEHIND THE PRACTICE</span>
          <h2 className="display-heading" id="proof-team-title">Meet our <em>team.</em></h2>
          <div className="proof-team-grid">
            {team.map(member => (
              <article className="proof-team-card" key={member.id}>
                {member.portrait ? (
                  <img className="proof-team-portrait" src={member.portrait.src} alt={member.portrait.alt} width={member.portrait.width} height={member.portrait.height} loading="lazy" decoding="async" />
                ) : (
                  <div className="proof-team-initials" aria-hidden="true">{member.name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("")}</div>
                )}
                <h3>{member.name}</h3>
                <p className="proof-team-role">{member.role}</p>
                <p className="proof-team-biography">{member.biography}</p>
                {member.qualifications && member.qualifications.length > 0 && (
                  <ul className="proof-qualifications" aria-label={`${member.name}'s qualifications`}>
                    {member.qualifications.map(qualification => <li key={qualification}>{qualification}</li>)}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
      {testimonials.length > 0 && (
        <section className="proof-section" aria-labelledby="proof-reviews-title">
          <span className="section-label">SHARED EXPERIENCES</span>
          <h2 className="display-heading" id="proof-reviews-title">In our clients’ <em>words.</em></h2>
          <div className="proof-review-grid">
            {testimonials.map(review => (
              <figure className="proof-review" key={review.id}>
                <span className="proof-quote-mark" aria-hidden="true">“</span>
                <blockquote><p>{review.quote}</p></blockquote>
                <figcaption><span>{review.clientName}</span>{review.attribution && <span>{review.attribution}</span>}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function VerifiedCaseStudies() {
  const cases = approvedCaseStudies.filter(study => study.publicationPermission === true &&
    study.title.trim() && study.service.trim() && study.scope.trim() && study.summary.trim() &&
    ["Completed", "In progress"].includes(study.status) && isPublishableProofImage(study.cover));
  if (!cases.length) return null;

  return (
    <section className="company-proof proof-section proof-case-studies" aria-labelledby="proof-cases-title">
      <span className="section-label">BR CONSTRUCTION PROJECTS</span>
      <h2 className="display-heading" id="proof-cases-title">Our work, <em>in detail.</em></h2>
      <div className="proof-case-list">
        {cases.map(study => (
          <article className="proof-case" key={study.id}>
            <img className="proof-case-cover" src={study.cover.src} alt={study.cover.alt} width={study.cover.width} height={study.cover.height} loading="lazy" decoding="async" />
            <div className="proof-case-copy">
              <span className="proof-case-status">{study.status}</span>
              <h3>{study.title}</h3>
              <p>{study.summary}</p>
              <dl className="proof-case-facts">
                <div><dt>Service</dt><dd>{study.service}</dd></div>
                {study.location && <div><dt>Location</dt><dd>{study.location}</dd></div>}
                <div><dt>Scope</dt><dd>{study.scope}</dd></div>
                {study.status === "Completed" && study.completionDate && <div><dt>Completed</dt><dd>{study.completionDate}</dd></div>}
              </dl>
              <Link className="text-link" href={study.serviceSlug ? `/contact?service=${encodeURIComponent(study.serviceSlug)}` : "/contact"}>Discuss a similar project <span aria-hidden="true">↗</span></Link>
            </div>
            {study.beforeAfter && isPublishableProofImage(study.beforeAfter.before) && isPublishableProofImage(study.beforeAfter.after) && (
              <ProjectEvidence title={study.title} before={study.beforeAfter.before} after={study.beforeAfter.after} caption={study.beforeAfter.caption} />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
