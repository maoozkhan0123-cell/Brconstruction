import type { Metadata } from "next";
import ProjectExplorer from "@/components/ProjectExplorer";
export const metadata: Metadata = {
  title: "Project Collection",
  description:
    "Explore illustrative architectural concepts, bespoke interiors, and contemporary spaces. Visual references for your next project.",
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
        THE BR COLLECTION / ILLUSTRATIVE CONCEPTS
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
    </main>
  );
}
