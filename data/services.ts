import type { ProjectCategory } from "./projects";

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  number: string;
  description: string;
  intro: string;
  capabilities: string[];
  approach: string[];
  image: string;
  projectCategory: ProjectCategory;
}

export const services: Service[] = [
  {
    slug: "architecture-engineering",
    title: "Architecture & Structural Engineering",
    shortTitle: "Architecture & Engineering",
    number: "01",
    description: "Visionary concepts, grounded in engineering intelligence.",
    intro:
      "We bring architectural thinking and structural discipline into the same conversation, developing a clear path from early spatial ideas to coordinated technical documentation.",
    capabilities: [
      "Architectural conceptualization",
      "2D and 3D design",
      "BIM modeling",
      "Structural analysis",
      "Civil engineering",
      "Technical drawings",
      "Regulatory planning and permit coordination",
    ],
    approach: [
      "Understand the brief, site, constraints, and architectural ambition.",
      "Develop concepts and coordinate structural and spatial decisions.",
      "Prepare technical documentation and an appropriate approval strategy.",
    ],
    image: "/images/project-01.webp",
    projectCategory: "Architecture",
  },
  {
    slug: "residential-commercial-construction",
    title: "Residential & Commercial Construction",
    shortTitle: "Construction",
    number: "02",
    description: "Considered execution. Uncompromising attention to detail.",
    intro:
      "A well-conceived project deserves carefully coordinated execution. Our construction approach connects site planning, engineering, procurement, and supervision around a clearly defined scope.",
    capabilities: [
      "Luxury residential development",
      "Commercial construction",
      "Structural construction",
      "Civil works",
      "Site execution",
      "Construction supervision",
      "Material procurement",
    ],
    approach: [
      "Establish the construction scope, programme, and site requirements.",
      "Coordinate materials, contractors, sequencing, and quality checks.",
      "Review progress and resolve technical details throughout execution.",
    ],
    image: "/images/project-03.webp",
    projectCategory: "Construction",
  },
  {
    slug: "interior-design",
    title: "Bespoke Interior Design",
    shortTitle: "Interior Design",
    number: "03",
    description: "Spaces shaped around the way you live, work, and feel.",
    intro:
      "We approach interiors through the relationship between space, material, light, and everyday use. Each decision contributes to an environment that feels coherent from the first impression to the smallest detail.",
    capabilities: [
      "Luxury interior concepts",
      "Space planning",
      "Custom cabinetry",
      "Premium finishes",
      "Lighting design",
      "Furniture and material selection",
      "Complete interior execution",
    ],
    approach: [
      "Explore how the space should function and the atmosphere it should create.",
      "Refine layouts, materials, lighting, furniture, and cabinetry as one composition.",
      "Coordinate specifications and execution through the finishing stage.",
    ],
    image: "/images/project-02.webp",
    projectCategory: "Interior Design",
  },
  {
    slug: "turnkey-renovation",
    title: "Turnkey Projects & Renovation",
    shortTitle: "Turnkey & Renovation",
    number: "04",
    description:
      "A connected journey from the first idea to the final handover.",
    intro:
      "For new spaces and thoughtful transformations, a turnkey approach keeps design decisions, technical coordination, procurement, and construction connected through a single project journey.",
    capabilities: [
      "End-to-end project delivery",
      "Existing building renovation",
      "Structural retrofitting",
      "Budget estimation",
      "Contractor coordination",
      "Project scheduling",
      "Final handover",
    ],
    approach: [
      "Assess the site or existing building and define the transformation.",
      "Coordinate the design, budget, procurement, and construction programme.",
      "Complete finishing reviews, inspections, documentation, and handover.",
    ],
    image: "/images/project-05.webp",
    projectCategory: "Architecture",
  },
];
