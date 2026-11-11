import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  service: text("service").notNull(),
  location: text("location").notNull(),
  budget: text("budget").notNull().default(""),
  startDate: text("start_date").notNull().default(""),
  description: text("description").notNull(),
  consentAt: integer("consent_at").notNull(),
  createdAt: integer("created_at").notNull(),
  notificationStatus: text("notification_status")
    .notNull()
    .default("not_configured"),
});

export const inquiryRateLimits = sqliteTable("inquiry_rate_limits", {
  key: text("key").primaryKey(),
  windowStartedAt: integer("window_started_at").notNull(),
  count: integer("count").notNull().default(1),
});
