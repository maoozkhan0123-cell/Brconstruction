"use client";
import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { projects } from "@/data/projects";
import { Arrow } from "./Icons";
const categories = [
  "All Projects",
  "Architecture",
  "Interior Design",
  "Construction",
  "Commercial",
];
export default function ProjectExplorer({
  expanded = false,
}: {
  expanded?: boolean;
}) {
  const [filter, setFilter] = useState("All Projects");
  useEffect(() => {
    const sync = () => {
      const value = new URLSearchParams(window.location.search).get("category");
      setFilter(value && categories.includes(value) ? value : "All Projects");
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  function change(category: string) {
    setFilter(category);
    const url = new URL(window.location.href);
    if (category === "All Projects") url.searchParams.delete("category");
    else url.searchParams.set("category", category);
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }
  const visible = projects
    .filter((p) => filter === "All Projects" || p.category === filter)
    .slice(0, expanded ? 99 : 4);
  return (
    <>
      <div className="portfolio-toolbar">
        <div className="project-filters" aria-label="Filter projects">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => change(category)}
              aria-pressed={filter === category}
              className={filter === category ? "selected" : ""}
            >
              {category}
              <span>
                {category === "All Projects"
                  ? projects.length
                  : projects.filter((p) => p.category === category).length}
              </span>
            </button>
          ))}
        </div>
        <span className="concept-tag">
          <span /> ILLUSTRATIVE COLLECTION
        </span>
      </div>
      <div
        className={`project-grid ${filter !== "All Projects" ? "filtered" : ""}`}
        aria-live="polite"
      >
        {visible.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className={`project-card project-card-${index + 1}`}
          >
            <div className="project-image">
              <img
                src={project.image}
                alt={`${project.title} — illustrative ${project.category.toLowerCase()} concept`}
                loading="lazy"
                width="1200"
                height="1000"
              />
              <span className="project-number">
                0{projects.indexOf(project) + 1} / CONCEPT STUDY
              </span>
              <span className="project-open">
                <Arrow diagonal />
              </span>
            </div>
            <div className="project-caption">
              <div>
                <span className="section-label">{project.category}</span>
                <h3>{project.title}</h3>
              </div>
              <Arrow diagonal />
            </div>
          </Link>
        ))}
      </div>
      <div className="portfolio-bottom">
        <p>
          Ideas in form. This collection presents design references
          <br className="desktop-break" /> and illustrative concepts, rather
          than completed BR work.
        </p>
        <Link href={expanded ? "/#contact" : "/projects"} className="text-link">
          {expanded ? "Discuss your own vision" : "Explore the collection"}
          <Arrow diagonal />
        </Link>
      </div>
    </>
  );
}
