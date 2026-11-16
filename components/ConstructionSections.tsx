import {
  Building2,
  DraftingCompass,
  Hammer,
  HardHat,
  KeyRound,
  Paintbrush,
  PanelsTopLeft,
  Plus,
  type LucideProps,
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

function BlueprintIcon({ size = 40, strokeWidth = 1.6, ...props }: LucideProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="12" y="10" width="27" height="30" rx="1" />
      <path d="M12 26h15v14M27 10v10h12M27 26h12M19 26v-7a7 7 0 0 1 7 7M16 14h6M31 14h4M16 35h6" />
      <path d="M12 5h27M12 3v4M39 3v4M6 10v30M4 10h4M4 40h4M12 44h27M12 42v4M39 42v4" />
    </svg>
  );
}

function BudgetIcon({ size = 40, strokeWidth = 1.6, ...props }: LucideProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="8" y="7" width="27" height="35" rx="3" />
      <rect x="13" y="12" width="16" height="7" rx="1" />
      <path d="M14 26h2M22 26h2M14 34h2M22 34h2M29 25v10M26 30h6" />
      <circle cx="36" cy="13" r="9" fill="#c8af7c" />
      <path d="M36 7v12M39 9h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-4" />
    </svg>
  );
}

const stageIcons = {
  plan: BlueprintIcon,
  budget: BudgetIcon,
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
        <p className="section-label">OUR 4-STEP PROCESS</p>
        <h2 id="construction-process-heading">
          HOW OUR CONSTRUCTION PROCESS WORKS IN KARACHI
        </h2>
      </div>

      <ol className="construction-process-grid">
        {processStages.map((stage, index) => {
          const Icon = stageIcons[stage.icon];
          return (
            <li className="construction-process-card" key={stage.title}>
              <img
                className="construction-process-background"
                src={stage.image}
                alt=""
                aria-hidden="true"
                width="1200"
                height="1400"
                loading="lazy"
                decoding="async"
                style={{ objectPosition: stage.imagePosition }}
              />
              <span className="construction-process-scrim" aria-hidden="true" />
              <div className="construction-process-content">
                <span className="construction-process-icon" aria-hidden="true">
                  <Icon size={40} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <h3 className="construction-process-title">
                  <span className="construction-process-number">{String(index + 1).padStart(2, "0")}</span>{" "}
                  {stage.title}
                </h3>
                <div className="construction-process-copy">
                  <h4>{stage.subtitle}</h4>
                  <p>{stage.description}</p>
                </div>
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
