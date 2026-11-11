import Link from "@/components/Link";
export default function NotFound() {
  return (
    <main id="main-content" className="not-found section-pad">
      <span className="section-label">404 / UNCHARTED SPACE</span>
      <h1 className="display-heading">
        Let’s find
        <br />
        <em>your way back.</em>
      </h1>
      <p>This page is no longer here, or the address has changed.</p>
      <Link href="/" className="button button-gold">
        Return to the studio ↗
      </Link>
    </main>
  );
}
