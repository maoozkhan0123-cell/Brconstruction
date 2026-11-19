import { suppliedProjects } from "./supplied-projects";

export type ProjectCategory =
  | "Architecture"
  | "Interior Design"
  | "Construction"
  | "Commercial";

export interface Project {
  presentation?: "project-design";
  designCredit?: string;
  slug: string;
  title: string;
  category: ProjectCategory;
  image: string;
  description: string;
  service: string;
  location: string;
  year: string;
  overview: string;
  objectives: string;
  challenge: string;
  methodology: string;
  materials: string[];
  outcome: string;
  gallery: { src: string; alt: string }[];
}

export const projectCategories: ProjectCategory[] = [
  "Architecture",
  "Interior Design",
  "Construction",
  "Commercial",
];

export const projects: Project[] = [
  ...suppliedProjects,
  {
    slug: "stillwater-residence",
    title: "The Stillwater Residence",
    category: "Architecture",
    image: "/images/stillwater-architecture-drawing.webp",
    description:
      "An exploration of quiet geometry, natural light, and the art of living well.",
    service: "architecture-engineering",
    location: "Illustrative concept",
    year: "Concept",
    overview:
      "A residential design study exploring how generous horizontal forms and carefully framed views can create a sense of calm. This illustrative concept communicates an architectural direction; it is not a completed BR Construction commission.",
    objectives:
      "Explore a private home that balances openness with retreat. The concept places everyday rituals, daylight, and a close relationship to the landscape at the center of the plan.",
    challenge:
      "The study considers the tension between expansive glazing and personal privacy, and between an apparently weightless roofline and the engineering discipline such a form would require.",
    methodology:
      "A real commission would begin with site investigations and a detailed brief, followed by coordinated architectural and structural models, consultant review, construction documentation, and supervised execution.",
    materials: [
      "Pale mineral surfaces",
      "Natural timber",
      "Clear glazing",
      "Dark metal accents",
    ],
    outcome:
      "A visual proposition for a home shaped by proportion and restraint. Location, floor area, programme, engineering specifications, budget, and completion date are intentionally unpublished because this is a design concept.",
    gallery: [
      {
        src: "/images/stillwater-architecture-drawing.webp",
        alt: "Architectural concept drawing of The Stillwater Residence with a perspective sketch, floor plan, and elevations",
      },
      {
        src: "/images/detail-01.webp",
        alt: "Natural materials and architectural details used as residential design references",
      },
    ],
  },
  {
    slug: "stone-and-light",
    title: "Stone & Light",
    category: "Interior Design",
    image: "/images/project-02.webp",
    description:
      "A material-led interior study in warmth, texture, and considered simplicity.",
    service: "interior-design",
    location: "Illustrative concept",
    year: "Concept",
    overview:
      "An interior concept that brings together tactile finishes, soft light, and purposeful spatial planning. The imagery is an illustrative reference, not a record of work delivered by BR Construction.",
    objectives:
      "Consider an interior that feels composed yet comfortable, with furniture, lighting, and storage working as a coherent whole rather than a collection of decorative elements.",
    challenge:
      "The study explores how a restrained palette can remain expressive through texture and proportion, while accommodating the practical needs of daily use.",
    methodology:
      "For a commissioned interior, space planning and material samples would establish the direction before detailed cabinetry drawings, lighting coordination, procurement, installation, and finishing inspections.",
    materials: [
      "Honed stone",
      "Warm timber",
      "Textured upholstery",
      "Brushed metal",
    ],
    outcome:
      "An illustrative language for a refined interior. Final selections, product availability, dimensions, and execution details would be established against the specific project brief.",
    gallery: [
      {
        src: "/images/project-02.webp",
        alt: "Interior inspiration with a restrained natural material palette",
      },
      {
        src: "/images/detail-02.webp",
        alt: "Interior detail reference showing the relationship between texture and natural light",
      },
    ],
  },
  {
    slug: "courtyard-house",
    title: "The Courtyard House",
    category: "Construction",
    image: "/images/project-03.webp",
    description:
      "A study of indoor–outdoor living, grounded in buildable architectural detail.",
    service: "residential-commercial-construction",
    location: "Illustrative concept",
    year: "Concept",
    overview:
      "A construction-oriented residential concept examining the relationship between sheltered outdoor space and an open internal plan. It is a demonstration of design intent, not a completed or ongoing company project.",
    objectives:
      "Explore a home organized around a sheltered courtyard, connecting shared living spaces while allowing quieter rooms their own sense of privacy.",
    challenge:
      "The concept raises practical questions around waterproofing, drainage, thresholds, shading, and the coordination of structure with large openings.",
    methodology:
      "On a live project, coordinated technical drawings, site-specific structural design, material approvals, sequencing, and documented inspections would translate the concept into a construction plan.",
    materials: [
      "Textured masonry",
      "Timber screening",
      "Stone paving",
      "Slim glazing systems",
    ],
    outcome:
      "An architectural reference for considered residential execution. The photographs do not establish construction performance, certification, or a delivery history.",
    gallery: [
      {
        src: "/images/project-03.webp",
        alt: "Contemporary house reference exploring sheltered outdoor living",
      },
      {
        src: "/images/detail-03.webp",
        alt: "Construction and material junction reference for a contemporary home",
      },
    ],
  },
  {
    // Retain the existing public URL when changing this collection entry.
    slug: "meridian-workplace",
    title: "The Lahore Bungalow",
    category: "Construction",
    image: "/images/pakistan-bungalow-lahore.webp",
    description:
      "A real Lahore home as a reference for contemporary residential construction in Pakistan.",
    service: "residential-commercial-construction",
    location: "Illustrative concept",
    year: "Concept",
    overview:
      "A residential design study using a real house photographed in Lahore, Pakistan. Its facade, entrance, and relationship to the street offer a local reference for a contemporary bungalow. The accompanying Islamabad interior is a separate design reference; neither photograph depicts a verified BR Construction commission.",
    objectives:
      "Explore a family home with a considered arrival, everyday privacy, and a balance of natural light and sheltered living spaces. Use local residential references to start a conversation about the owner's needs.",
    challenge:
      "Consider how the facade, boundary wall, openings, and entrance work together. A commissioned design would need to respond to its actual plot, orientation, climate, and structural requirements.",
    methodology:
      "A residential commission would begin with the brief and site assessment, followed by coordinated drawings, structural design, material choices, construction sequencing, and finishing reviews.",
    materials: [
      "Facade cladding references",
      "Vertical surface detailing",
      "Large glazed openings",
      "Metal entrance and boundary details",
    ],
    outcome:
      "A Pakistan-based visual starting point for a residential brief. The photographs are sourced design references, not evidence of BR Construction's completed work, and do not establish the pictured property's specifications, cost, or performance.",
    gallery: [
      {
        src: "/images/pakistan-bungalow-lahore.webp",
        alt: "Real modern bungalow facade and entrance in Lahore, Pakistan — residential design reference",
      },
      {
        src: "/images/pakistan-interior-islamabad.webp",
        alt: "Living room photographed in Islamabad, Pakistan — a separate interior design reference",
      },
    ],
  },
  {
    slug: "casa-forma",
    title: "Casa Forma",
    category: "Architecture",
    image: "/images/casa-forma-architecture-drawing.webp",
    description:
      "Sculptural form meets a quiet palette in this contemporary residential study.",
    service: "turnkey-renovation",
    location: "Illustrative concept",
    year: "Concept",
    overview:
      "A residential concept exploring sculptural form and the continuity of architecture, landscape, and interior detail. The reference imagery is not represented as original company work or a delivered renovation.",
    objectives:
      "Develop a cohesive direction in which the exterior composition and interior experience share a consistent material and spatial language.",
    challenge:
      "The study explores the level of coordination needed to carry a simple architectural idea through complex junctions, finishing details, and the final handover.",
    methodology:
      "For a turnkey commission, the team would establish the brief and scope, assess the site or existing structure, coordinate design and procurement, supervise execution, and document completion.",
    materials: [
      "Warm render",
      "Natural stone",
      "Oak tones",
      "Bronze-finish accents",
    ],
    outcome:
      "An illustrative direction for a fully coordinated home. No before-and-after comparison is shown because no verified renovation assets have been supplied.",
    gallery: [
      {
        src: "/images/casa-forma-architecture-drawing.webp",
        alt: "Architectural concept drawing of Casa Forma with a sloping-roof perspective, floor plan, and front elevation",
      },
      {
        src: "/images/detail-05.webp",
        alt: "Residential detail inspiration connecting architecture and interior material choices",
      },
    ],
  },
];
