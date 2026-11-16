/** The supplied BR Construction artwork is optimized for repeated website use. */
export default function BrandLogo() {
  return (
    <>
      <span className="brand-mark" aria-hidden="true">
        <img
          src="/images/br-construction-logo.webp"
          width={640}
          height={640}
          alt=""
          decoding="async"
          fetchPriority="low"
        />
      </span>
      <span className="brand-copy">
        <strong>BR<span>CONSTRUCTION</span></strong>
        <small>CONSTRUCTION / DESIGN / ENGINEERING</small>
      </span>
    </>
  );
}
