"use client";

import { useId, useState } from "react";
import type { ProofImage } from "@/data/company-proof";

/** Receives approved image props only; no approval records or client data. */
export default function ProjectEvidence({ title, before, after, caption }: {
  title: string;
  before: ProofImage;
  after: ProofImage;
  caption?: string;
}) {
  const [position, setPosition] = useState(50);
  const id = useId();
  return (
    <figure className="proof-comparison">
      <div className="proof-comparison-images" style={{ aspectRatio: `${after.width} / ${after.height}` }}>
        <img src={after.src} alt={after.alt} width={after.width} height={after.height} loading="lazy" decoding="async" />
        <div className="proof-comparison-before" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
          <img src={before.src} alt={before.alt} width={before.width} height={before.height} loading="lazy" decoding="async" />
        </div>
        {position > 0 && <span className="proof-comparison-label proof-comparison-label--before" aria-hidden="true">Before</span>}
        {position < 100 && <span className="proof-comparison-label proof-comparison-label--after" aria-hidden="true">After</span>}
        <span className="proof-comparison-divider" style={{ left: `${position}%` }} aria-hidden="true"><span>↔</span></span>
      </div>
      <div className="proof-comparison-controls">
        <label htmlFor={id}>Compare before and after: {title}</label>
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={event => setPosition(Number(event.target.value))}
          aria-valuetext={`${position}% before, ${100 - position}% after`}
        />
        <div className="proof-comparison-actions">
          <button type="button" onClick={() => setPosition(100)}>Show before</button>
          <button type="button" onClick={() => setPosition(0)}>Show after</button>
        </div>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
