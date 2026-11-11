import { company, officeMapUrl, whatsappUrl } from "@/data/company";
import { Arrow } from "./Icons";

export default function ContactDetails({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`contact-details${compact ? " contact-details--footer" : ""}`}>
      <div className="contact-detail">
        <span className="contact-detail-label">EMAIL US</span>
        <a href={`mailto:${company.email}`}>{company.email}</a>
      </div>
      <div className="contact-detail">
        <span className="contact-detail-label">CALL US</span>
        <div className="contact-phone-links">
          {company.phones.map(phone => <a href={`tel:${phone.number}`} key={phone.number}>{phone.label}</a>)}
          <a className="contact-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Discuss your project on WhatsApp (opens in a new tab)">Message on WhatsApp <Arrow diagonal /></a>
        </div>
      </div>
      <div className="contact-detail contact-detail--office">
        <span className="contact-detail-label">KARACHI OFFICE</span>
        <address>{company.address.line1}<br/>{company.address.line2}<br/>{company.address.city}</address>
        <a className="contact-map-link" href={officeMapUrl} target="_blank" rel="noopener noreferrer" aria-label="View our Karachi office on Google Maps (opens in a new tab)">View on Google Maps <Arrow diagonal/></a>
      </div>
    </div>
  );
}
