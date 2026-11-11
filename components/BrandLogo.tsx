/** The supplied artwork is framed in CSS; the original PNG remains untouched. */
export default function BrandLogo() {
  return (
    <>
      <span className="brand-mark" aria-hidden="true">
        <img
          src="/images/br-construction-logo.webp"
          width={512}
          height={512}
          alt=""
          decoding="async"
          fetchPriority="low"
        />
      </span>
      <span className="brand-copy">
        <strong>BR<span>CONSTRUCTION</span></strong>
        <small>ARCHITECTURE / ENGINEERING / BUILD</small>
      </span>
    </>
  );
}
