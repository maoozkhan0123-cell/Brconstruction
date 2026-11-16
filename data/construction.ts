export interface ConstructionService {
  title: string;
  description: string;
  detail: string;
  slug: string;
  icon: "construction" | "structure" | "renovation" | "architecture" | "interiors" | "finishes";
}

/** Landing-page areas drawn from the four established service scopes. */
export const constructionServices: ConstructionService[] = [
  {
    title: "Residential & Commercial Construction",
    description:
      "From a private residence to a commercial space, bring the build together with coordinated site execution, materials, and supervision.",
    detail: "New builds · Site execution · Supervision",
    slug: "residential-commercial-construction",
    icon: "construction",
  },
  {
    title: "Grey Structure & Civil Works",
    description:
      "Establish the structural core of your project through civil works, construction sequencing, and engineering coordination.",
    detail: "Structural work · Civil works · Coordination",
    slug: "residential-commercial-construction",
    icon: "structure",
  },
  {
    title: "Turnkey Projects & Renovation",
    description:
      "Connect design, procurement, construction, and finishing in one considered plan for a new space or an existing building.",
    detail: "Project planning · Renovation · Handover",
    slug: "turnkey-renovation",
    icon: "renovation",
  },
  {
    title: "Architecture & Structural Engineering",
    description:
      "Translate your brief into spatial ideas, technical drawings, and structural decisions that support a practical build.",
    detail: "Concepts · Technical drawings · Engineering",
    slug: "architecture-engineering",
    icon: "architecture",
  },
  {
    title: "Interior Design & Fit-outs",
    description:
      "Shape the way a space works and feels, with connected decisions about layouts, lighting, materials, and interior execution.",
    detail: "Space planning · Lighting · Interior execution",
    slug: "interior-design",
    icon: "interiors",
  },
  {
    title: "Custom Cabinetry & Finishing",
    description:
      "Bring the final details into focus, from bespoke cabinetry and kitchen layouts to material selections and premium finishes.",
    detail: "Cabinetry · Material selection · Finishes",
    slug: "interior-design",
    icon: "finishes",
  },
];

export interface ConstructionStage {
  title: string;
  subtitle: string;
  description: string;
  icon: "plan" | "budget" | "build" | "handover";
}

export const processStages: ConstructionStage[] = [
  {
    title: "Plan",
    subtitle: "Understand the project",
    description:
      "Discuss your site, requirements, and priorities. Coordinate the design and technical decisions that define the scope.",
    icon: "plan",
  },
  {
    title: "Budget",
    subtitle: "Make informed decisions",
    description:
      "Review the scope, material choices, estimated costs, and programme so the next steps have a clear starting point.",
    icon: "budget",
  },
  {
    title: "Build",
    subtitle: "Coordinate the execution",
    description:
      "Bring site work, procurement, and supervision together, with progress reviews and attention to construction details.",
    icon: "build",
  },
  {
    title: "Handover",
    subtitle: "Review the final details",
    description:
      "Walk through the completed scope, review finishing details, and coordinate the essential inspections and handover documents.",
    icon: "handover",
  },
];

export const constructionFaqs = [
  {
    question: "What should I share to start a construction project?",
    answer:
      "Share your site location, plot or covered area, the type of project, and the stage you are at. Existing drawings, your priorities, an indicative budget, and a preferred timeline help our team understand the brief. You can start even if your plans are still taking shape.",
  },
  {
    question: "Can I discuss grey structure work separately from finishing?",
    answer:
      "Yes. Tell us whether you need structural construction and civil works, interior finishing, or a connected turnkey scope. The team will review the site and requirements with you so the proposed scope clearly identifies what is included.",
  },
  {
    question: "How is a construction quotation prepared?",
    answer:
      "A meaningful estimate depends on the site, area, drawings, structural requirements, materials, finishes, and scope of work. Send the details you have through the inquiry form. Our team will review them and confirm what is needed before preparing a project-specific quotation.",
  },
  {
    question: "Can you coordinate design, construction, and interiors?",
    answer:
      "Our services cover architecture and structural engineering, residential and commercial construction, interior design, and turnkey renovation. We can discuss a coordinated scope that connects the stages your project needs, from the initial brief through finishing and handover.",
  },
];
