import { whatsappUrl } from "@/data/company";

export default function FloatingWhatsApp() {
  return (
    <a
      className="floating-whatsapp"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with BR Construction on WhatsApp (opens in a new tab)"
    >
      <img src="/icons/whatsapp.svg" width={30} height={30} alt="" aria-hidden="true" />
      <span className="floating-whatsapp__label">WhatsApp our team</span>
    </a>
  );
}
