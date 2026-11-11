CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`service` text NOT NULL,
	`location` text NOT NULL,
	`budget` text DEFAULT '' NOT NULL,
	`start_date` text DEFAULT '' NOT NULL,
	`description` text NOT NULL,
	`consent_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`notification_status` text DEFAULT 'not_configured' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inquiry_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_started_at` integer NOT NULL,
	`count` integer DEFAULT 1 NOT NULL
);
