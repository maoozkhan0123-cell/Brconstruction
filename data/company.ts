/** Business contact information supplied by BR Construction. */
export const company = {
  name: "BR Construction",
  email: "admin@brconstruction.services",
  whatsappNumber: "+923322249951",
  phones: [
    { label: "+92-332-2249951", number: "+923322249951" },
    { label: "+92-331-2920582", number: "+923312920582" },
  ],
  address: {
    line1: "Office No. 403, Bali Business Boulevard",
    line2: "Plot-19-C, Phase-2-EXT, DHA",
    city: "Karachi",
    country: "PK",
  },
} as const;

export const officeAddress = [company.address.line1, company.address.line2, company.address.city].join(", ");
export const officeMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress)}`;

export function buildWhatsAppUrl(message = "Hello BR Construction, I would like to discuss a project.") {
  return `https://wa.me/${company.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export const whatsappUrl = buildWhatsAppUrl();
