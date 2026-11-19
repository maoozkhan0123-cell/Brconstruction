import type { Metadata } from "next";
import ProjectExplorer from "@/components/ProjectExplorer";
import { VerifiedCaseStudies } from "@/components/CompanyProof";
export const metadata: Metadata = {
  title: "Project Collection",
  description:
    "Explore residential and commercial project presentations, architectural sketches, and interior design visualizations from BR Construction.",
  alternates: { canonical: "/projects" },
};
export default function Projects() {
  return (
    <main
      id="main-content"
      className="collection-page light-section section-pad"
    >
      <span className="section-label">
        <i />
        THE BR COLLECTION / PROJECTS & DESIGN STUDIES
      </span>
      <h1 className="display-heading">
        A world of
        <br />
        <em>possibility.</em>
      </h1>
      <p className="collection-intro">
        An exploration of architecture, light, and material. Discover the ideas
        that could inspire your own extraordinary space.
      </p>
      <ProjectExplorer expanded />
      <VerifiedCaseStudies />
    </main>
  );
}
