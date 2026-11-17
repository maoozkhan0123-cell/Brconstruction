"use client";

import { useEffect, useState } from "react";
import { HardHat, KeyRound, type LucideProps } from "lucide-react";
import { processStages } from "@/data/construction";

function BlueprintIcon({ size = 40, strokeWidth = 1.6, ...props }: LucideProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="12" y="10" width="27" height="30" rx="1" />
      <path d="M12 26h15v14M27 10v10h12M27 26h12M19 26v-7a7 7 0 0 1 7 7M16 14h6M31 14h4M16 35h6" />
      <path d="M12 5h27M12 3v4M39 3v4M6 10v30M4 10h4M4 40h4M12 44h27M12 42v4M39 42v4" />
    </svg>
  );
}

function BudgetIcon({ size = 40, strokeWidth = 1.6, ...props }: LucideProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="8" y="7" width="27" height="35" rx="3" />
      <rect x="13" y="12" width="16" height="7" rx="1" />
      <path d="M14 26h2M22 26h2M14 34h2M22 34h2M29 25v10M26 30h6" />
      <circle cx="36" cy="13" r="9" fill="#c8af7c" />
      <path d="M36 7v12M39 9h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-4" />
    </svg>
  );
}

const stageIcons = {
  plan: BlueprintIcon,
  budget: BudgetIcon,
  build: HardHat,
  handover: KeyRound,
};

const STEP_INTERVAL = 2600;

/** Process cards that light up one by one: 01 → 02 → 03 → 04, then repeat. */
export default function ProcessTimeline() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(
      () => setActive((active + 1) % processStages.length),
      STEP_INTERVAL,
    );
    return () => window.clearTimeout(timer);
  }, [active, paused]);

  const progress = (active / (processStages.length - 1)) * 100;

  return (
    <ol
      className="construction-process-grid"
      style={{ ["--process-progress" as string]: `${progress}%` }}
      onMouseLeave={() => setPaused(false)}
    >
      {processStages.map((stage, index) => {
        const Icon = stageIcons[stage.icon];
        const state =
          index === active ? " is-active" : index < active ? " is-done" : "";
        return (
          <li
            className={`construction-process-item reveal${state}`}
            key={stage.title}
            style={{ animationDelay: `${index * 120}ms` }}
            onMouseEnter={() => {
              setPaused(true);
              setActive(index);
            }}
            onFocus={() => setActive(index)}
            tabIndex={0}
            aria-current={index === active ? "step" : undefined}
          >
            <span className="construction-process-marker" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="construction-process-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="construction-process-background"
                src={stage.image}
                alt=""
                aria-hidden="true"
                width="1200"
                height="1400"
                loading="lazy"
                decoding="async"
                style={{ objectPosition: stage.imagePosition }}
              />
              <span className="construction-process-scrim" aria-hidden="true" />
              <div className="construction-process-content">
                <span className="construction-process-icon" aria-hidden="true">
                  <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="construction-process-step">Step {index + 1}</span>
                <h3 className="construction-process-title">{stage.title}</h3>
                <div className="construction-process-copy">
                  <h4>{stage.subtitle}</h4>
                  <p>{stage.description}</p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
