import type { AnchorHTMLAttributes } from "react";

/** Native navigation keeps fragment links and server-rendered routes reliable. */
export default function Link(props: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a {...props} />;
}
