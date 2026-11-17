/**
 * Official BR Construction logo, supplied by the company (transparent PNG).
 * The full-resolution master is public/brand/br-construction-logo.png; the
 * 600px WebP is a straight downscale for the web — the artwork is unchanged.
 */
export default function BrandLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="brand-logo"
      src="/brand/br-construction-logo-600.webp"
      width={600}
      height={351}
      alt="BR Construction"
      decoding="async"
    />
  );
}
