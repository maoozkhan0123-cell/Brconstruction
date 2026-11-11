"use client";
import { useEffect, useState, type FormEvent, type FocusEvent } from "react";
import { Arrow } from "./Icons";
import { inquiryServiceOptions as options, normalizeInquiryService } from "@/data/inquiry-services";
import { takeInquiryDraft } from "@/lib/inquiry-draft";
export default function ContactForm() {
  const [service, setService] = useState("");
  const [project, setProject] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [draftNotice, setDraftNotice] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  useEffect(() => {
    setStartedAt(Date.now());
    const sync = () => {
      const params = new URLSearchParams(window.location.search);
      const selected = params.get("service");
      if (selected) setService(normalizeInquiryService(selected));
      setProject((params.get("project") || "").slice(0, 120));
      const token = params.get("draft");
      if (token) {
        const draft = takeInquiryDraft(token);
        if (draft) {
          setService(draft.service);
          setLocation(draft.location);
          setBudget(draft.budget);
          setDescription(draft.description);
          setDraftNotice("Your project brief is ready. Review the details below, then add your contact information to request a quotation.");
        } else {
          setDraftNotice("Your project brief could not be carried over. Please add your project details below.");
        }
        params.delete("draft");
        const query = params.toString();
        window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
      }
    };
    sync();
    window.addEventListener("br:inquiry", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("br:inquiry", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);
  function validateField(
    input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  ) {
    let error = "";
    if (input.validity.valueMissing)
      error =
        input.name === "consent"
          ? "Please agree to the privacy policy."
          : "Please complete this field.";
    else if (input.validity.typeMismatch)
      error = "Enter a valid email address.";
    else if (input.validity.tooShort && "minLength" in input)
      error = `Please use at least ${input.minLength} characters.`;
    setErrors((previous) => ({ ...previous, [input.name]: error }));
    return error;
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Array.from(form.elements).filter(
      (e) =>
        e instanceof HTMLInputElement ||
        e instanceof HTMLSelectElement ||
        e instanceof HTMLTextAreaElement,
    ) as unknown as Array<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >;
    const invalid = fields.filter((input) => !!validateField(input));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    setStatus("loading");
    setMessage("");
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          startedAt,
          consent: data.get("consent") === "on",
          description: project
            ? `[Concept inspiration: ${project}]\n${payload.description}`
            : payload.description,
        }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        id?: string;
        message?: string;
        error?: string;
        fields?: Record<string, string>;
      };
      if (!response.ok || !result.ok) {
        setErrors(result.fields || {});
        throw new Error(
          result.error || "We couldn’t save your inquiry. Please try again.",
        );
      }
      setReference(result.id || "");
      setMessage(result.message || "Your project inquiry has been received.");
      setStatus("success");
      form.reset();
      setLocation("");
      setBudget("");
      setDescription("");
      setDraftNotice("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Connection unavailable. Please try again.",
      );
    }
  }
  const error = (name: string) => (
    <span className="field-error" id={`${name}-error`}>
      {errors[name] || ""}
    </span>
  );
  const props = (name: string) => ({
    name,
    id: name,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    onBlur: (
      event: FocusEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => validateField(event.currentTarget),
    onInput: (event: FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (errors[name]) validateField(event.currentTarget);
    },
  });
  if (status === "success")
    return (
      <div className="form-success" role="status">
        <span className="success-mark">✓</span>
        <span className="section-label">THE FIRST STEP, TAKEN.</span>
        <h3>
          Your vision is
          <br />
          <em>in good company.</em>
        </h3>
        <p>{message}</p>
        <p className="inquiry-reference">REFERENCE: {reference}</p>
        <button
          className="text-link"
          onClick={() => {
            setStatus("idle");
            setStartedAt(Date.now());
            setService("");
            setProject("");
            setLocation("");
            setBudget("");
            setDescription("");
            setDraftNotice("");
          }}
        >
          Begin another inquiry <Arrow />
        </button>
      </div>
    );
  return (
    <form id="project-inquiry" className="inquiry-form" onSubmit={submit} noValidate>
      <div className="form-heading">
        <span className="section-label">TELL US WHAT YOU HAVE IN MIND</span>
        <span className="form-required">* Required</span>
      </div>
      {draftNotice && <p className="inquiry-draft-notice" role="status">{draftNotice}</p>}
      {project && (
        <p className="project-context">
          Inspired by <strong>{project}</strong>
          <button
            type="button"
            onClick={() => setProject("")}
            aria-label="Remove selected concept"
          >
            ×
          </button>
        </p>
      )}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="fullName">
            Full name <span>*</span>
          </label>
          <input
            {...props("fullName")}
            autoComplete="name"
            placeholder="Your name"
            required
            minLength={2}
            maxLength={100}
          />
          {error("fullName")}
        </div>
        <div className="field">
          <label htmlFor="email">
            Email address <span>*</span>
          </label>
          <input
            {...props("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            maxLength={254}
          />
          {error("email")}
        </div>
        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input
            {...props("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="Include country code"
            maxLength={40}
          />
          {error("phone")}
        </div>
        <div className="field">
          <label htmlFor="service">
            Service required <span>*</span>
          </label>
          <select
            {...props("service")}
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
          >
            <option value="">Select a discipline</option>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          {error("service")}
        </div>
        <div className="field">
          <label htmlFor="location">
            Project location <span>*</span>
          </label>
          <input
            {...props("location")}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            autoComplete="address-level2"
            placeholder="City, country"
            required
            maxLength={160}
          />
          {error("location")}
        </div>
        <div className="field">
          <label htmlFor="budget">Estimated budget</label>
          <input
            {...props("budget")}
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            placeholder="Amount and currency, if known"
            maxLength={100}
          />
          {error("budget")}
        </div>
        <div className="field field-full">
          <label htmlFor="startDate">Expected start date</label>
          <input {...props("startDate")} type="date" />
          {error("startDate")}
        </div>
        <div className="field field-full">
          <label htmlFor="description">
            A little about your vision <span>*</span>
          </label>
          <textarea
            {...props("description")}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="The space you’re imagining. What matters to you. Where we can help."
            rows={3}
            required
            minLength={20}
            maxLength={project ? 4900 : 5000}
          />
          {error("description")}
        </div>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent">
        <input {...props("consent")} type="checkbox" required />
        <span>
          I agree to the <a href="/privacy">privacy policy</a> and to being
          contacted about my inquiry. *
        </span>
      </label>
      {error("consent")}
      <button
        type="submit"
        className="button button-gold submit-button"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Sending your inquiry…" : "Discuss my project"}
        <Arrow diagonal />
      </button>
      <p className="form-message" role="status" aria-live="polite">
        {message}
      </p>
      <span className="form-footnote">
        A thoughtful conversation is where every great space begins.
      </span>
    </form>
  );
}
