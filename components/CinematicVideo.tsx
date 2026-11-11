"use client";
import { useEffect, useRef, useState } from "react";

/** Optional company-approved footage; the photograph remains the default. */
export default function CinematicVideo({
  source,
  active,
}: {
  source?: string;
  active: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [allowed, setAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const update = () =>
      setAllowed(
        !motion.matches &&
          !connection?.saveData &&
          !["slow-2g", "2g"].includes(connection?.effectiveType || ""),
      );
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);
  if (!source || !active || !allowed || failed) return null;
  async function toggle() {
    if (!video.current) return;
    if (paused) {
      try {
        await video.current.play();
        setPaused(false);
      } catch {
        setFailed(true);
      }
    } else {
      video.current.pause();
      setPaused(true);
    }
  }
  return (
    <>
      <video
        ref={video}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/images/hero.webp"
        aria-hidden="true"
        onError={() => setFailed(true)}
      >
        <source
          src={source}
          type={source.endsWith(".webm") ? "video/webm" : "video/mp4"}
        />
      </video>
      <button
        className="video-control"
        onClick={toggle}
        aria-label={paused ? "Play background video" : "Pause background video"}
      >
        {paused ? "▶" : "Ⅱ"} <span>{paused ? "PLAY FILM" : "PAUSE FILM"}</span>
      </button>
    </>
  );
}
