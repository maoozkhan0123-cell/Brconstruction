"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, MessageSquareText } from "lucide-react";
import { inquiryServiceOptions } from "@/data/inquiry-services";
import { buildInquiryDraftHref } from "@/lib/inquiry-draft";

export type QuoteDetails = {
  service: string;
  location: string;
  budget: string;
  description: string;
};

export default function ChatQuoteForm({
  details,
  onDetailsChange,
  visitorMessages,
  onBack,
}: {
  details: QuoteDetails;
  onDetailsChange: (field: keyof QuoteDetails, value: string) => void;
  visitorMessages: string[];
  onBack: () => void;
}) {
  const [error, setError] = useState("");
  const [continuing, setContinuing] = useState(false);
  const serviceInput = useRef<HTMLSelectElement>(null);
  const canContinue = Boolean(details.service && details.location.trim());
  const recentNotes = visitorMessages.slice(-4).map(message => message.trim()).filter(Boolean).join("\n\n").slice(0, 3000);

  useEffect(() => {
    serviceInput.current?.focus({ preventScroll: true });
    const resume = () => setContinuing(false);
    window.addEventListener("pageshow", resume);
    return () => window.removeEventListener("pageshow", resume);
  }, []);

  function update(field: keyof QuoteDetails, value: string) {
    onDetailsChange(field, value);
    if (error) setError("");
  }

  function continueToInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (continuing || !canContinue) return;
    const cleaned = Object.fromEntries(Object.entries(details).map(([field, value]) => [field, value.trim()])) as QuoteDetails;
    if (/\p{Cc}/u.test([cleaned.service, cleaned.location, cleaned.budget].join("")) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(cleaned.description)) {
      setError("Please remove unusual characters and try again.");
      return;
    }
    setContinuing(true);
    try {
      window.location.assign(buildInquiryDraftHref(cleaned));
    } catch {
      setContinuing(false);
      setError("We could not carry these details over. You can still open the inquiry form below.");
    }
  }

  return (
    <div className="br-chat-quote">
      <button className="br-chat-back" type="button" onClick={onBack}><ArrowLeft size={14} aria-hidden="true" /> Back to chat</button>
      <span className="br-chat-eyebrow">YOUR PROJECT, CONSIDERED</span>
      <h2>Tell us a little<br /><em>about your vision.</em></h2>
      <p className="br-chat-quote-intro">Choose a service and location, then review your project brief in the inquiry form. Add any other details you know.</p>

      <form className="br-chat-quote-form" onSubmit={continueToInquiry}>
        <div className="br-chat-quote-field">
          <label htmlFor="br-quote-service">Service required <span aria-hidden="true">*</span></label>
          <select ref={serviceInput} id="br-quote-service" value={details.service} onChange={event => update("service", event.target.value)} required>
            <option value="">Select a service</option>
            {inquiryServiceOptions.map(service => <option key={service} value={service}>{service}</option>)}
          </select>
        </div>
        <div className="br-chat-quote-field">
          <label htmlFor="br-quote-location">Project location <span aria-hidden="true">*</span></label>
          <input id="br-quote-location" value={details.location} onChange={event => update("location", event.target.value)} maxLength={160} autoComplete="off" placeholder="City or neighbourhood" required />
        </div>
        <div className="br-chat-quote-field">
          <label htmlFor="br-quote-budget">Indicative budget</label>
          <input id="br-quote-budget" value={details.budget} onChange={event => update("budget", event.target.value)} maxLength={100} autoComplete="off" placeholder="Amount and currency, if known" />
        </div>
        <div className="br-chat-quote-field">
          <div className="br-chat-quote-label-row">
            <label htmlFor="br-quote-description">What do you have in mind?</label>
            {recentNotes && <button type="button" onClick={() => update("description", recentNotes)}><MessageSquareText size={11} aria-hidden="true" /> Use my messages</button>}
          </div>
          <textarea id="br-quote-description" value={details.description} onChange={event => update("description", event.target.value)} maxLength={3000} rows={3} placeholder="The space, approximate size, and what matters to you." />
        </div>
        {error && <p className="br-chat-quote-error" role="alert">{error} <a href="/contact">Open the inquiry form</a>.</p>}
        <button className="br-chat-quote-continue" type="submit" disabled={!canContinue || continuing}>{continuing ? "Opening your inquiry…" : "Continue to inquiry"}<ArrowUpRight size={15} aria-hidden="true" /></button>
        <a className="br-chat-quote-skip" href="/contact">Or start directly with our contact form <ArrowUpRight size={12} aria-hidden="true" /></a>
      </form>
      <p className="br-chat-quote-note">You’ll review your details and add your contact information before sending. Our team confirms pricing and project schedules.</p>
    </div>
  );
}
