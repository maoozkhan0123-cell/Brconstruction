type SiteEnvironment = Record<string, string | undefined>;

function validOrigin(value: string | undefined, allowHostname = false): string | undefined {
  const candidate = value?.trim();
  if (!candidate) return undefined;

  const absolute = allowHostname && !candidate.includes("://")
    ? `https://${candidate}`
    : candidate;
  if (!/^https?:\/\//i.test(absolute)) return undefined;

  try {
    const url = new URL(absolute);
    if (!url.hostname || url.username || url.password) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

/** Server-side origin shared by metadata, structured data, robots, and sitemap. */
export function getSiteOrigin(environment: SiteEnvironment = process.env): string {
  return validOrigin(environment.NEXT_PUBLIC_SITE_URL)
    ?? validOrigin(environment.VERCEL_PROJECT_PRODUCTION_URL, true)
    ?? validOrigin(environment.VERCEL_URL, true)
    ?? "http://localhost:3000";
}
