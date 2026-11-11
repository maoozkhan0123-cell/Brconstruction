import type { SVGProps } from "react";
export function Arrow({
  diagonal = false,
  ...props
}: SVGProps<SVGSVGElement> & { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      {...props}
    >
      {diagonal ? (
        <path d="M5 19 19 5M5 5h14v14" />
      ) : (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}
export function Mark() {
  return (
    <svg viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <path
        d="M5 40V6h18c11 0 14 12 5 16 13 3 11 18-1 18H5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M13 40V14h10c6 0 6 10 0 10H13m10 0 14 16M5 32h22"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
