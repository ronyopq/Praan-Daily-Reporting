CREATE TABLE `approval_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`rejection_reason` text,
	`submitted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reviewed_at` text,
	`reviewed_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `approval_requests_user_idx` ON `approval_requests` (`user_id`);--> statement-breakpoint
CREATE INDEX `approval_requests_status_idx` ON `approval_requests` (`status`);--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`session_token_hash` text NOT NULL,
	`expires_at` text NOT NULL,
	`user_agent` text,
	`ip_address` text,
	`revoked_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `auth_sessions_user_idx` ON `auth_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_sessions_expires_idx` ON `auth_sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `departments_or_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `departments_projects_type_name_idx` ON `departments_or_projects` (`type`,`name`);--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_system` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_code_idx` ON `roles` (`code`);--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`designation` text NOT NULL,
	`department_id` text,
	`project_id` text,
	`supervisor_id` text,
	`phone` text,
	`preferred_language` text DEFAULT 'bn' NOT NULL,
	`active_status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`department_id`) REFERENCES `departments_or_projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `departments_or_projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supervisor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`is_primary` integer DEFAULT false NOT NULL,
	`assigned_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`assigned_by` text,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_roles_user_idx` ON `user_roles` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`approval_status` text DEFAULT 'pending' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`preferred_language` text DEFAULT 'bn' NOT NULL,
	`session_version` integer DEFAULT 1 NOT NULL,
	`last_login_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_approval_status_idx` ON `users` (`approval_status`);--> statement-breakpoint
CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_settings_category_key_idx` ON `app_settings` (`category`,`key`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_user_id` text,
	`target_user_id` text,
	`entity_type` text NOT NULL,
	`entity_id` text,
	`action` text NOT NULL,
	`summary` text NOT NULL,
	`diff_json` text DEFAULT '{}' NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_logs_actor_idx` ON `audit_logs` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`action_url` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'unread' NOT NULL,
	`meta_json` text DEFAULT '{}' NOT NULL,
	`seen_at` text,
	`dismissed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_status_idx` ON `notifications` (`user_id`,`status`);--> statement-breakpoint
CREATE TABLE `template_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`template_id` text NOT NULL,
	`version_number` integer NOT NULL,
	`label_map_json` text DEFAULT '{}' NOT NULL,
	`visible_fields_json` text DEFAULT '[]' NOT NULL,
	`section_order_json` text DEFAULT '[]' NOT NULL,
	`print_settings_json` text DEFAULT '{}' NOT NULL,
	`signature_blocks_json` text DEFAULT '[]' NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`template_id`) REFERENCES `templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `template_versions_template_version_idx` ON `template_versions` (`template_id`,`version_number`);--> statement-breakpoint
CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`current_version` integer DEFAULT 1 NOT NULL,
	`organization_name` text NOT NULL,
	`organization_logo_url` text,
	`footer_text` text,
	`print_header_text` text,
	`print_footer_text` text,
	`submitted_by_label` text DEFAULT 'Submitted by' NOT NULL,
	`approved_by_label` text DEFAULT 'Approved by' NOT NULL,
	`show_notes_area` integer DEFAULT true NOT NULL,
	`settings_json` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_type_idx` ON `templates` (`type`);--> statement-breakpoint
CREATE TABLE `daily_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`activity_date` text NOT NULL,
	`activity_time` text NOT NULL,
	`task_description` text NOT NULL,
	`output` text,
	`note` text,
	`delivery` text,
	`linked_plan_item_id` text,
	`follow_up_date` text,
	`follow_up_note` text,
	`reminder_status` text DEFAULT 'none' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`print_group_id` text,
	`submitted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`linked_plan_item_id`) REFERENCES `work_plan_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `daily_activities_user_date_idx` ON `daily_activities` (`user_id`,`activity_date`);--> statement-breakpoint
CREATE INDEX `daily_activities_status_idx` ON `daily_activities` (`status`);--> statement-breakpoint
CREATE INDEX `daily_activities_linked_plan_idx` ON `daily_activities` (`linked_plan_item_id`);--> statement-breakpoint
CREATE TABLE `follow_ups` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`source_type` text NOT NULL,
	`source_id` text,
	`title` text NOT NULL,
	`note` text,
	`due_date` text NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reminder_seen` integer DEFAULT false NOT NULL,
	`reminder_dismissed_at` text,
	`completed_at` text,
	`snoozed_until` text,
	`assigned_to_user_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `follow_ups_user_due_idx` ON `follow_ups` (`user_id`,`due_date`);--> statement-breakpoint
CREATE INDEX `follow_ups_status_idx` ON `follow_ups` (`status`);--> statement-breakpoint
CREATE INDEX `follow_ups_assigned_idx` ON `follow_ups` (`assigned_to_user_id`);--> statement-breakpoint
CREATE TABLE `holidays` (
	`id` text PRIMARY KEY NOT NULL,
	`holiday_date` text NOT NULL,
	`holiday_type` text DEFAULT 'govt_holiday' NOT NULL,
	`label` text NOT NULL,
	`country_code` text DEFAULT 'BD' NOT NULL,
	`is_recurring` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_override_allowed` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `holidays_date_idx` ON `holidays` (`holiday_date`);--> statement-breakpoint
CREATE INDEX `holidays_active_idx` ON `holidays` (`is_active`);--> statement-breakpoint
CREATE TABLE `task_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`expected_output` text,
	`linked_project_id` text,
	`usage_count` integer DEFAULT 0 NOT NULL,
	`last_used_at` text,
	`is_shared` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`linked_project_id`) REFERENCES `departments_or_projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `task_templates_user_idx` ON `task_templates` (`user_id`);--> statement-breakpoint
CREATE TABLE `work_plan_items` (
	`id` text PRIMARY KEY NOT NULL,
	`work_plan_id` text NOT NULL,
	`user_id` text NOT NULL,
	`month` text NOT NULL,
	`plan_date` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`expected_output` text,
	`category` text,
	`priority` text DEFAULT 'medium' NOT NULL,
	`linked_project_id` text,
	`holiday_type` text DEFAULT 'none' NOT NULL,
	`holiday_label` text,
	`notes` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`is_auto_generated` integer DEFAULT false NOT NULL,
	`follow_up_required` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`work_plan_id`) REFERENCES `work_plans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`linked_project_id`) REFERENCES `departments_or_projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `work_plan_items_user_date_idx` ON `work_plan_items` (`user_id`,`plan_date`);--> statement-breakpoint
CREATE INDEX `work_plan_items_month_idx` ON `work_plan_items` (`month`);--> statement-breakpoint
CREATE INDEX `work_plan_items_status_idx` ON `work_plan_items` (`status`);--> statement-breakpoint
CREATE TABLE `work_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`month` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`autosaved_at` text,
	`submitted_at` text,
	`approved_at` text,
	`approved_by` text,
	`reviewer_comment` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `work_plans_user_month_idx` ON `work_plans` (`user_id`,`month`);--> statement-breakpoint
CREATE INDEX `work_plans_status_idx` ON `work_plans` (`status`);--> statement-breakpoint
CREATE TABLE `monthly_report_completed_items` (
	`id` text PRIMARY KEY NOT NULL,
	`report_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`task_date` text,
	`task_name` text NOT NULL,
	`output` text,
	`remarks` text,
	`source_activity_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`report_id`) REFERENCES `monthly_reports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_activity_id`) REFERENCES `daily_activities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `monthly_report_completed_report_idx` ON `monthly_report_completed_items` (`report_id`);--> statement-breakpoint
CREATE TABLE `monthly_report_next_month_items` (
	`id` text PRIMARY KEY NOT NULL,
	`report_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`task_name` text NOT NULL,
	`task_date` text,
	`output` text,
	`remarks` text,
	`source_plan_item_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`report_id`) REFERENCES `monthly_reports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_plan_item_id`) REFERENCES `work_plan_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `monthly_report_next_report_idx` ON `monthly_report_next_month_items` (`report_id`);--> statement-breakpoint
CREATE TABLE `monthly_report_ongoing_items` (
	`id` text PRIMARY KEY NOT NULL,
	`report_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`task_name` text NOT NULL,
	`output` text,
	`deadline` text,
	`remarks` text,
	`source_follow_up_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`report_id`) REFERENCES `monthly_reports`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_follow_up_id`) REFERENCES `follow_ups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `monthly_report_ongoing_report_idx` ON `monthly_report_ongoing_items` (`report_id`);--> statement-breakpoint
CREATE TABLE `monthly_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`month` text NOT NULL,
	`project_name` text,
	`report_name` text,
	`designation_snapshot` text,
	`submission_date` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`lessons_learned` text,
	`comments` text,
	`admin_comment` text,
	`submitted_by_name` text,
	`approved_by_name` text,
	`generated_from` text,
	`submitted_at` text,
	`reviewed_at` text,
	`approved_at` text,
	`approved_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_by` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `monthly_reports_user_month_idx` ON `monthly_reports` (`user_id`,`month`);--> statement-breakpoint
CREATE INDEX `monthly_reports_status_idx` ON `monthly_reports` (`status`);