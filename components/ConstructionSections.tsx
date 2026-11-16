import {
  Building2,
  Calculator,
  ClipboardList,
  DraftingCompass,
  Hammer,
  HardHat,
  KeyRound,
  Paintbrush,
  PanelsTopLeft,
  Plus,
} from "lucide-react";
import Link from "@/components/Link";
import { Arrow } from "@/components/Icons";
import {
  constructionFaqs,
  constructionServices,
  processStages,
} from "@/data/construction";

const serviceIcons = {
  construction: HardHat,
  structure: Building2,
  renovation: Hammer,
  architecture: DraftingCompass,
  interiors: PanelsTopLeft,
  finishes: Paintbrush,
};

const stageIcons = {
  plan: ClipboardList,
  budget: Calculator,
  build: HardHat,
  handover: KeyRound,
};

export function ConstructionServices() {
  return (
    <section
      className="construction-services section-pad"
      id="expertise"
      aria-labelledby="construction-services-heading"
    >
      <div className="construction-section-intro">
        <div>
          <p className="section-label"><i aria-hidden="true" />What we do</p>
          <h2 id="construction-services-heading">
            Construction at the core.<br />
            <em>Every detail connected.</em>
          </h2>
        </div>
        <div className="construction-section-aside">
          <p>
            Construction in Karachi, supported by architectural thinking,
            structural engineering, and considered interiors. Choose the scope
            your project needs.
          </p>
          <Link className="text-link" href="/#contact">
            Discuss your project <Arrow diagonal />
          </Link>
        </div>
      </div>

      <div className="construction-service-grid">
        {constructionServices.map((service, index) => {
          const Icon = serviceIcons[service.icon];
          return (
            <article
              className={`construction-service-card${index === 0 ? " construction-service-card-primary" : ""}`}
              key={service.title}
            >
              <div className="construction-service-top">
                <span className="construction-service-icon"><Icon size={34} strokeWidth={1.35} aria-hidden="true" /></span>
                <span className="construction-service-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="construction-service-detail">{service.detail}</span>
              <Link
                className="construction-service-link"
                href={`/services/${service.slug}`}
                aria-label={`Explore ${service.title.toLowerCase()}`}
              >
                Explore service <Arrow diagonal />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ConstructionProcess() {
  return (
    <section
      className="construction-process section-pad"
      id="process"
      aria-labelledby="construction-process-heading"
    >
      <div className="construction-process-intro">
        <p className="section-label"><i aria-hidden="true" />Our construction process</p>
        <h2 id="construction-process-heading">
          A clear path.<br className="construction-mobile-break" /> <em>From plan to handover.</em>
        </h2>
        <p>Four connected stages, with the scope and next steps considered along the way.</p>
      </div>

      <ol className="construction-process-grid">
        {processStages.map((stage, index) => {
          const Icon = stageIcons[stage.icon];
          return (
            <li className="construction-process-card" key={stage.title}>
              <div className="construction-process-visual">
                <img src={stage.image} alt="" width={1200} height={800} loading="lazy" decoding="async" />
                <span className="construction-process-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="construction-process-icon"><Icon size={24} strokeWidth={1.4} aria-hidden="true" /></span>
                <h3>{stage.title}</h3>
              </div>
              <div className="construction-process-copy">
                <h4>{stage.subtitle}</h4>
                <p>{stage.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="construction-process-footer">
        <p>Your site, your scope, your next step.</p>
        <Link className="text-link" href="/#contact">Let’s discuss your build <Arrow diagonal /></Link>
      </div>
    </section>
  );
}

export function ConstructionFAQs() {
  return (
    <section
      className="construction-faqs section-pad"
      id="faqs"
      aria-labelledby="construction-faqs-heading"
    >
      <div className="construction-faq-intro">
        <p className="section-label"><i aria-hidden="true" />Before we build</p>
        <h2 id="construction-faqs-heading">Good questions.<br /><em>Clear beginnings.</em></h2>
        <p>A few useful answers before you take the next step with BR Construction.</p>
        <Link className="text-link" href="/#contact">Talk about your project <Arrow diagonal /></Link>
      </div>
      <div className="construction-faq-list">
        {constructionFaqs.map((faq) => (
          <details className="construction-faq" key={faq.question}>
            <summary>{faq.question}<Plus size={19} strokeWidth={1.5} aria-hidden="true" /></summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
