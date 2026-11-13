export type RequestOriginContext = {
  development: boolean;
  vercel: boolean;
};

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Keep production strict; accommodate Next's loopback normalization only in local development. */
export function isAllowedRequestOrigin(
  request: Request,
  context: RequestOriginContext = {
    development: process.env.NODE_ENV === "development",
    vercel: process.env.VERCEL === "1",
  },
): boolean {
  if (request.headers.get("sec-fetch-site")?.trim().toLowerCase() === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const requestUrl = new URL(request.url);
    if (origin === requestUrl.origin) return true;
    if (!context.development || context.vercel) return false;

    const originUrl = new URL(origin);
    // Origin headers contain an origin only, never credentials, paths, queries,
    // alternate numeric IP spellings, or a list of origins.
    if (origin !== originUrl.origin) return false;
    if (!["http:", "https:"].includes(requestUrl.protocol)) return false;
    if (!LOOPBACK_HOSTS.has(requestUrl.hostname) || !LOOPBACK_HOSTS.has(originUrl.hostname)) return false;
    if (originUrl.protocol !== requestUrl.protocol || originUrl.port !== requestUrl.port) return false;

    const actualHost = request.headers.get("host");
    return Boolean(actualHost && actualHost.trim().toLowerCase() === originUrl.host.toLowerCase());
  } catch {
    return false;
  }
}
