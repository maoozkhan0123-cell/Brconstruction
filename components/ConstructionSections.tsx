import {
  Building2,
  DraftingCompass,
  Hammer,
  HardHat,
  KeyRound,
  Paintbrush,
  PanelsTopLeft,
  Phone,
  Plus,
  type LucideProps,
} from "lucide-react";
import Link from "@/components/Link";
import { Arrow } from "@/components/Icons";
import { company, whatsappUrl } from "@/data/company";
import ProcessTimeline from "./ProcessTimeline";
import {
  constructionFaqs,
  constructionServices,
} from "@/data/construction";

/** Photography shown at the top of each service card. */
const serviceImages = {
  construction: "/images/villa36-dining.webp",
  structure: "/images/villa36-stair-stone.webp",
  renovation: "/images/villa36-living.webp",
  architecture: "/images/villa36-suite.webp",
  interiors: "/images/villa36-blush-bedroom.webp",
  finishes: "/images/villa36-cabinetry.webp",
}

const serviceIcons = {
  construction: HardHat,
  structure: Building2,
  renovation: Hammer,
  architecture: DraftingCompass,
  interiors: PanelsTopLeft,
  finishes: Paintbrush,
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
          <h2 id="construction-services-heading">
            Construction at the core.<br />
            <em>Every detail connected.</em>
          </h2>
        </div>
      </div>

      <div className="construction-service-grid">
        {constructionServices.map((service, index) => {
          const Icon = serviceIcons[service.icon];
          return (
            <article
              className="construction-service-card reveal"
              key={service.title}
              style={{ animationDelay: `${index * 110}ms` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="construction-service-photo"
                src={serviceImages[service.icon]}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span className="construction-service-icon">
                <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="construction-service-body">
                <h3>{service.title}</h3>
                <div className="construction-service-reveal">
                  <div>
                    <p>{service.description}</p>
                    <ul className="construction-service-tags" aria-label="Includes">
                      {service.detail.split(" · ").map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Link
                  className="construction-service-link"
                  href={`/services/${service.slug}`}
                  aria-label={`Explore ${service.title.toLowerCase()}`}
                >
                  Explore service
                  <span className="construction-service-arrow"><Arrow diagonal /></span>
                </Link>
              </div>
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
      <div className="construction-process-intro reveal">
        <h2 id="construction-process-heading">
          From first sketch
          <br />
          <em>to final handover.</em>
        </h2>
      </div>

      <ProcessTimeline />
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
      <div className="construction-faq-intro reveal">
        <h2 id="construction-faqs-heading">Good questions.<br /><em>Clear beginnings.</em></h2>
        <p>A few useful answers before you take the next step with BR Construction.</p>

        <div className="construction-faq-help">
          <span className="construction-faq-help__icon" aria-hidden="true">
            <Phone size={22} strokeWidth={1.6} />
          </span>
          <h3>Still have a question?</h3>
          <p>Speak with our team directly about your site, scope, or budget.</p>
          <div className="construction-faq-help__phones">
            {company.phones.map((phone) => (
              <a href={`tel:${phone.number}`} key={phone.number}>{phone.label}</a>
            ))}
          </div>
          <a
            className="button button-gold"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message BR Construction on WhatsApp (opens in a new tab)"
          >
            Message on WhatsApp <Arrow diagonal />
          </a>
        </div>
      </div>
      <div className="construction-faq-list">
        {constructionFaqs.map((faq, index) => (
          <details
            className="construction-faq reveal"
            key={faq.question}
            name="construction-faq"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <summary>
              <span className="construction-faq__number">{String(index + 1).padStart(2, "0")}</span>
              <span className="construction-faq__question">{faq.question}</span>
              <span className="construction-faq__toggle" aria-hidden="true">
                <Plus size={18} strokeWidth={1.8} />
              </span>
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
