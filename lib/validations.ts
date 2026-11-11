import { z } from "zod";
import { inquiryServiceOptions } from "../data/inquiry-services.ts";

export const inquiryServices = inquiryServiceOptions;

const optionalText = (maximum: number) =>
  z.string().trim().max(maximum).optional().default("");

export const inquirySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(100, "Please use 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254)
    .transform((value) => value.toLowerCase()),
  phone: optionalText(40).refine(
    (value) =>
      !value ||
      (/^[+()\d\s.\-]{7,40}$/.test(value) &&
        value.replace(/\D/g, "").length >= 7),
    "Please enter a valid phone number.",
  ),
  service: z.enum(inquiryServices, {
    errorMap: () => ({ message: "Please select a service." }),
  }),
  location: z
    .string()
    .trim()
    .min(2, "Please enter the project location.")
    .max(160),
  budget: optionalText(100),
  startDate: optionalText(40).refine(
    (value) =>
      !value ||
      (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value),
    "Please enter a valid date.",
  ),
  description: z
    .string()
    .trim()
    .min(
      20,
      "Please tell us a little more about your project (at least 20 characters).",
    )
    .max(5000, "Please use 5,000 characters or fewer."),
  website: z
    .string()
    .max(0, "Please leave this field empty.")
    .optional()
    .default(""),
  startedAt: z.number().int().positive(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Please agree to the privacy notice." }),
  }),
});

export type InquiryInput = z.input<typeof inquirySchema>;

export function validateInquiry(value: unknown, now = Date.now()) {
  const result = inquirySchema.safeParse(value);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return {
      success: false as const,
      fields,
      error: "Please check the highlighted fields.",
    };
  }
  const elapsed = now - result.data.startedAt;
  if (elapsed < 2000 || elapsed > 24 * 60 * 60 * 1000) {
    return {
      success: false as const,
      fields: {},
      error:
        elapsed < 2000
          ? "Please take a moment to review your inquiry before sending."
          : "This form has expired. Refresh the page and try again.",
    };
  }
  return { success: true as const, data: result.data };
}
