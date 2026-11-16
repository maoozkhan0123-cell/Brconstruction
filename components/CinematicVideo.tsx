"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type ConnectionPreferences = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (event: string, listener: () => void) => void;
  removeEventListener?: (event: string, listener: () => void) => void;
};

const LOCAL_FILM = "/videos/br-construction-hero.mp4";
const LOCAL_POSTER = "/images/construction-hero-poster.webp";

function connectionPreferences() {
  return (navigator as Navigator & { connection?: ConnectionPreferences })
    .connection;
}

function allowAutomaticPlayback() {
  const connection = connectionPreferences();
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !connection?.saveData &&
    !["slow-2g", "2g"].includes(connection?.effectiveType || "")
  );
}

function subscribeToPlaybackPreferences(update: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = connectionPreferences();
  motion.addEventListener("change", update);
  connection?.addEventListener?.("change", update);
  return () => {
    motion.removeEventListener("change", update);
    connection?.removeEventListener?.("change", update);
  };
}

function safeVideoSource(source?: string) {
  const value = source?.trim();
  if (
    !value ||
    value.includes("\\") ||
    Array.from(value).some((character) => character.charCodeAt(0) < 32)
  ) {
    return LOCAL_FILM;
  }
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password) {
      return url.href;
    }
  } catch {
    // An invalid optional override must not replace the local film.
  }
  return LOCAL_FILM;
}

function wasPlaybackInterrupted(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Decorative, silent footage with an explicit alternative to automatic motion. */
export default function CinematicVideo({
  source,
  poster = LOCAL_POSTER,
  active = true,
}: {
  source?: string;
  poster?: string;
  active?: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const automaticPlayback = useSyncExternalStore(
    subscribeToPlaybackPreferences,
    allowAutomaticPlayback,
    () => false,
  );
  const [intent, setIntent] = useState<"automatic" | "play" | "pause">(
    "automatic",
  );
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const film = safeVideoSource(source);
  const shouldLoad = active && (automaticPlayback || intent !== "automatic");
  const shouldPlay =
    active &&
    !failed &&
    (intent === "play" ||
      (intent === "automatic" && automaticPlayback && !blocked));

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (!shouldPlay) {
      element.pause();
      return;
    }
    let cancelled = false;
    element.muted = true;
    void element.play().catch((error: unknown) => {
      if (!cancelled && !wasPlaybackInterrupted(error)) {
        setBlocked(true);
        setIntent("pause");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [film, shouldPlay]);

  function togglePlayback() {
    const element = video.current;
    if (!element) return;
    if (playing) {
      setIntent("pause");
      element.pause();
      return;
    }

    // Start within the click event for browsers that require a user gesture.
    // The source stays unloaded on reduced-motion and data-saving visits.
    if (failed || element.getAttribute("src") !== film) {
      element.src = film;
      element.load();
    }
    element.muted = true;
    setFailed(false);
    setIntent("play");
    void element.play().catch((error: unknown) => {
      if (!wasPlaybackInterrupted(error)) {
        setBlocked(true);
        setIntent("pause");
      }
    });
  }

  const action = failed ? "Retry" : playing ? "Pause" : "Play";

  return (
    <>
      <video
        ref={video}
        className={`construction-hero__video${hasFrame && shouldLoad && !failed ? " is-visible" : ""}`}
        src={shouldLoad ? film : undefined}
        poster={poster}
        autoPlay={automaticPlayback && intent === "automatic" && !blocked}
        muted
        loop
        playsInline
        preload={shouldLoad ? "auto" : "none"}
        disablePictureInPicture
        disableRemotePlayback
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => {
          setPlaying(true);
          setHasFrame(true);
        }}
        onPause={() => setPlaying(false)}
        onError={() => {
          setFailed(true);
          setPlaying(false);
        }}
      >
        Your browser can display the background photograph instead of the film.
      </video>
      <button
        type="button"
        className="construction-hero__video-control"
        onClick={togglePlayback}
        aria-label={`${action} background video`}
        aria-pressed={playing}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          {playing ? (
            <path d="M9 5v14M15 5v14" />
          ) : (
            <path d="m9 5 10 7-10 7V5Z" />
          )}
        </svg>
        <span>{action} film</span>
      </button>
    </>
  );
}
