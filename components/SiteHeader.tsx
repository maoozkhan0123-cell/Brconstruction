"use client";
import Link from "@/components/Link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Arrow, Mark } from "./Icons";
const navigation = [
  ["Home", "/#home"],
  ["About", "/#about"],
  ["Expertise", "/#expertise"],
  ["Projects", "/#projects"],
  ["Our Process", "/#process"],
  ["Contact", "/#contact"],
];
export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 45);
    check();
    window.addEventListener("scroll", check, { passive: true });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        }),
      { rootMargin: "-15% 0px -60% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((node) => observer.observe(node));
    return () => {
      window.removeEventListener("scroll", check);
      observer.disconnect();
    };
  }, [pathname]);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className={`site-header ${scrolled || ["/projects", "/privacy", "/terms"].includes(pathname) ? "is-scrolled" : ""}`}>
        <Link href="/" className="brand" aria-label="BR Construction home">
          <Mark />
          <span>
            <strong>
              BR<span>CONSTRUCTION</span>
            </strong>
            <small>ARCHITECTURE / ENGINEERING / BUILD</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(([label, href]) => (
            <Link
              className={active === href.split("#")[1] ? "active" : ""}
              key={label}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/#contact" className="header-cta">
          Start your project <Arrow diagonal />
        </Link>
        <button
          ref={trigger}
          className="menu-toggle"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label="Open navigation"
        >
          <span />
          <span />
        </button>
      </header>
      <dialog
        ref={dialog}
        id="mobile-navigation"
        className="mobile-menu"
        aria-label="Navigation"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
      >
        <div className="mobile-menu-top">
          <span className="section-label">BR CONSTRUCTION</span>
          <button
            className="icon-button close-button"
            onClick={close}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {navigation.map(([label, href], index) => (
            <Link key={label} href={href} onClick={close}>
              <span>0{index + 1}</span>
              {label}
              <Arrow diagonal />
            </Link>
          ))}
        </nav>
        <Link href="/#contact" className="button button-gold" onClick={close}>
          Let’s discuss your vision <Arrow diagonal />
        </Link>
        <p className="menu-caption">
          ARCHITECTING VISIONS. CONSTRUCTING LEGACIES.
        </p>
      </dialog>
      <Link
        href="/#contact"
        className={`floating-consultation ${scrolled ? "visible" : ""}`}
        aria-label="Book a consultation"
      >
        Let’s talk <Arrow diagonal />
      </Link>
    </>
  );
}
