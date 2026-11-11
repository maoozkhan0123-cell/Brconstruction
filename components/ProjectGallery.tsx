"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";

interface GalleryImage {
  src: string;
  alt: string;
}

export default function ProjectGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive((index) => (index + 1) % images.length);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive((index) => (index - 1 + images.length) % images.length);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, images.length]);

  const showImage = (index: number) => {
    setActive(index);
    setOpen(true);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  return (
    <>
      <div className="detail-gallery">
        {images.map((image, index) => (
          <button
            className="gallery-thumbnail"
            type="button"
            key={`${image.src}-${index}`}
            onClick={() => showImage(index)}
            aria-label={`Open image ${index + 1}: ${image.alt}`}
          >
            <img
              src={image.src}
              alt={image.alt}
              width={1400}
              height={1050}
              loading="lazy"
            />
            <span className="gallery-expand">
              <Expand size={20} aria-hidden="true" /> View full screen
            </span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-label={`${title} image gallery`}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <button
          className="gallery-close"
          type="button"
          aria-label="Close gallery"
          onClick={close}
        >
          <X size={26} aria-hidden="true" />
        </button>
        {open && (
          <img
            className="gallery-image"
            src={images[active].src}
            alt={images[active].alt}
            width={1800}
            height={1350}
          />
        )}
        <div className="gallery-controls">
          <button
            type="button"
            aria-label="Previous image"
            onClick={() =>
              setActive((index) => (index - 1 + images.length) % images.length)
            }
          >
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <p aria-live="polite">
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </p>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => setActive((index) => (index + 1) % images.length)}
          >
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        </div>
      </dialog>
    </>
  );
}
