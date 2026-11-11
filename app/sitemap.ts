import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { getSiteOrigin } from "@/lib/site-url";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  return [
    "",
    "/about",
    "/projects",
    "/contact",
    "/privacy",
    "/terms",
    ...projects.map((p) => `/projects/${p.slug}`),
    ...services.map((s) => `/services/${s.slug}`),
  ].map((path) => ({
    url: origin + path,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
