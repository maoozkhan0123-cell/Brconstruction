/** Shared form choices keep the chatbot handoff and inquiry form in agreement. */
export const inquiryServiceOptions = [
  "Residential Construction",
  "Commercial Construction",
  "Architecture & Planning",
  "Structural Engineering",
  "Interior Design",
  "Renovation & Turnkey Delivery",
  "Other",
] as const;

const serviceBySlug: Record<string, string> = {
  "architecture-engineering": "Architecture & Planning",
  "residential-commercial-construction": "Residential Construction",
  "interior-design": "Interior Design",
  "turnkey-renovation": "Renovation & Turnkey Delivery",
};

export function normalizeInquiryService(value: unknown): string {
  if (typeof value !== "string") return "";
  const service = serviceBySlug[value] || value;
  return inquiryServiceOptions.some(option => option === service) ? service : "";
}
