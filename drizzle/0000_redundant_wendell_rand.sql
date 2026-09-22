CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`company` text NOT NULL,
	`interest` text NOT NULL,
	`message` text NOT NULL,
	`consent` integer NOT NULL,
	`created_at` text NOT NULL
);
