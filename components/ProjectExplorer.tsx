"use client";
import { useEffect, useState } from "react";
import Link from "@/components/Link";
import { projects, projectCategories } from "@/data/projects";
import { Arrow } from "./Icons";
const categories = [
  "All Projects",
  ...projectCategories.filter((category) =>
    projects.some((project) => project.category === category),
  ),
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
  const bento = !expanded && filter === "All Projects";
  return (
    <>
      <div className="pf-toolbar">
        <div className="pf-filters" aria-label="Filter projects">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => change(category)}
              aria-pressed={filter === category}
              className={filter === category ? "is-selected" : ""}
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
      </div>
      <div
        className={`pf-grid${bento ? " pf-grid--bento" : ""}`}
        aria-live="polite"
      >
        {visible.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className={`pf-card pf-card--${index + 1} reveal`}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={project.gallery[0].alt}
              loading="lazy"
              width="1200"
              height="1000"
            />
            <div className="pf-card__caption">
              <span className="pf-card__category">{project.category}</span>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
            </div>
            <span className="pf-card__open">
              View project <Arrow diagonal />
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
