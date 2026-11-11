/**
 * Owner-approved business evidence only. These collections intentionally remain
 * empty until BR Construction supplies real project information, team details,
 * and client quotations with permission to publish them.
 *
 * Add photography under public/images/ and use its /images/... URL below. Keep
 * stock/concept imagery in data/projects.ts; it is not proof of delivered work.
 * Do not infer credentials, dates, locations, outcomes, or client endorsements.
 * Before/after photographs must show the same real project with matching views.
 */
export interface ProofImage {
  src: `/images/${string}`;
  alt: string;
  width: number;
  height: number;
  publicationPermission: true;
}

export interface ApprovedTeamMember {
  id: string;
  name: string;
  role: string;
  biography: string;
  qualifications?: readonly string[];
  portrait?: ProofImage;
  publicationPermission: true;
}

export interface ApprovedTestimonial {
  id: string;
  quote: string;
  clientName: string;
  attribution?: string;
  publicationPermission: true;
}

export interface ApprovedCaseStudy {
  id: string;
  title: string;
  service: string;
  serviceSlug?: "architecture-engineering" | "residential-commercial-construction" | "interior-design" | "turnkey-renovation";
  status: "Completed" | "In progress";
  location?: string;
  scope: string;
  summary: string;
  completionDate?: string;
  cover: ProofImage;
  beforeAfter?: { before: ProofImage; after: ProofImage; caption?: string };
  publicationPermission: true;
}

// Set publicationPermission only after the named person/client and the company
// approve the exact copy and photographs. Do not add sample people or reviews.
export const approvedTeam: readonly ApprovedTeamMember[] = [];
export const approvedTestimonials: readonly ApprovedTestimonial[] = [];
export const approvedCaseStudies: readonly ApprovedCaseStudy[] = [];

export function isPublishableProofImage(image: ProofImage | undefined): image is ProofImage {
  return Boolean(image && image.publicationPermission === true &&
    /^\/images\/(?!.*(?:\.\.|[?#\\]))[^\s]+\.(?:avif|webp|png|jpe?g)$/i.test(image.src) &&
    image.alt.trim() && Number.isSafeInteger(image.width) && image.width > 0 &&
    Number.isSafeInteger(image.height) && image.height > 0);
}
