-- Sample seed data for PRAAN Daily Reporting
-- Default password for seeded users: PraanAdmin@2026

INSERT OR IGNORE INTO roles (
  id, code, name, description, is_system
) VALUES
  ('role_super_admin', 'super_admin', 'Super Admin', 'System-level administrators', 1),
  ('role_admin', 'admin', 'Admin', 'Department administrators', 1),
  ('role_user', 'user', 'User', 'Standard reporting users', 1);

INSERT OR IGNORE INTO departments_or_projects (
  id, type, name, code, description, is_active
) VALUES
  ('dept_me', 'department', 'Monitoring & Evaluation', 'M&E', 'Daily reporting and analytics team', 1),
  ('dept_ops', 'department', 'Operations', 'OPS', 'Operational support department', 1),
  ('proj_youth', 'project', 'Youth Empowerment', 'YE', 'Sample PRAAN project for reporting seeds', 1),
  ('proj_green', 'project', 'Green Transition', 'GT', 'Sample environment-focused project', 1);

INSERT OR IGNORE INTO users (
  id, email, password_hash, approval_status, is_active, preferred_language
) VALUES
  ('user_super', 'superadmin@praan.org', '$2b$10$mXjM1EPiwlBKuVLhmfPKJ.DG4fSSqQiq2Ete0QvA0WaWTTGrNkO9e', 'approved', 1, 'en'),
  ('user_admin', 'admin@praan.org', '$2b$10$mXjM1EPiwlBKuVLhmfPKJ.DG4fSSqQiq2Ete0QvA0WaWTTGrNkO9e', 'approved', 1, 'bn'),
  ('user_rahim', 'rahim@praan.org', '$2b$10$mXjM1EPiwlBKuVLhmfPKJ.DG4fSSqQiq2Ete0QvA0WaWTTGrNkO9e', 'approved', 1, 'bn'),
  ('user_sadia', 'sadia@praan.org', '$2b$10$mXjM1EPiwlBKuVLhmfPKJ.DG4fSSqQiq2Ete0QvA0WaWTTGrNkO9e', 'approved', 1, 'en'),
  ('user_pending', 'new.user@praan.org', '$2b$10$mXjM1EPiwlBKuVLhmfPKJ.DG4fSSqQiq2Ete0QvA0WaWTTGrNkO9e', 'pending', 1, 'bn');

INSERT OR IGNORE INTO user_profiles (
  user_id, full_name, designation, department_id, project_id, supervisor_id, phone, preferred_language, active_status
) VALUES
  ('user_super', 'System Super Admin', 'Principal Systems Lead', 'dept_me', 'proj_youth', NULL, '01700000001', 'en', 'active'),
  ('user_admin', 'Amina Admin', 'Programme Manager', 'dept_me', 'proj_youth', 'user_super', '01700000002', 'bn', 'active'),
  ('user_rahim', 'Rahim Uddin', 'Field Coordinator', 'dept_ops', 'proj_green', 'user_admin', '01700000003', 'bn', 'active'),
  ('user_sadia', 'Sadia Akter', 'Reporting Officer', 'dept_me', 'proj_youth', 'user_admin', '01700000004', 'en', 'active'),
  ('user_pending', 'New Pending User', 'Project Officer', 'dept_ops', 'proj_green', 'user_admin', '01700000005', 'bn', 'active');

INSERT OR IGNORE INTO user_roles (
  user_id, role_id, is_primary
) VALUES
  ('user_super', 'role_super_admin', 1),
  ('user_admin', 'role_admin', 1),
  ('user_rahim', 'role_user', 1),
  ('user_sadia', 'role_user', 1),
  ('user_pending', 'role_user', 1);

INSERT OR IGNORE INTO approval_requests (
  id, user_id, status, notes, reviewed_at, reviewed_by
) VALUES
  ('approval_admin', 'user_admin', 'approved', 'Imported admin account', '2026-03-01T09:00:00.000Z', 'user_super'),
  ('approval_rahim', 'user_rahim', 'approved', 'Approved field reporting access', '2026-03-01T09:10:00.000Z', 'user_admin'),
  ('approval_sadia', 'user_sadia', 'approved', 'Approved reporting access', '2026-03-01T09:15:00.000Z', 'user_admin'),
  ('approval_pending', 'user_pending', 'pending', 'Needs branch approval before activation', NULL, NULL);

INSERT OR IGNORE INTO holidays (
  id, holiday_date, holiday_type, label, country_code, is_recurring, is_active, is_override_allowed
) VALUES
  ('holiday_2026_02_21', '2026-02-21', 'govt_holiday', 'International Mother Language Day', 'BD', 0, 1, 1),
  ('holiday_2026_03_26', '2026-03-26', 'govt_holiday', 'Independence and National Day', 'BD', 0, 1, 1),
  ('holiday_2026_04_14', '2026-04-14', 'govt_holiday', 'Bangla New Year', 'BD', 0, 1, 1),
  ('holiday_2026_05_01', '2026-05-01', 'govt_holiday', 'May Day', 'BD', 0, 1, 1),
  ('holiday_2026_12_16', '2026-12-16', 'govt_holiday', 'Victory Day', 'BD', 0, 1, 1);

INSERT OR IGNORE INTO templates (
  id, type, name, status, current_version, organization_name, footer_text, print_header_text, print_footer_text, submitted_by_label, approved_by_label, show_notes_area, settings_json
) VALUES
  (
    'template_daily',
    'daily_activity_register',
    'Daily Activity Register',
    'active',
    1,
    'PRAAN',
    'Prepared for internal organizational reporting',
    'Daily Activity Register',
    'Generated from PRAAN Daily Reporting',
    'Submitted by',
    'Approved by',
    1,
    '{"visibleFields":["activity_time","task_description","output","note","delivery"],"sectionOrder":["header","table","noteBlock","signature"],"labelMap":{"title":"Daily Activity Register","taskDescription":"Task''s Description","output":"Output","note":"Note","delivery":"Delivery"},"printSettings":{"showDateHeader":true,"compactRows":false,"showFooter":true},"signatureBlocks":["submitted_by","approved_by"]}'
  ),
  (
    'template_plan',
    'monthly_work_plan',
    'Monthly Work Plan',
    'active',
    1,
    'PRAAN',
    'Submitted for monthly operational planning',
    'Monthly Work Plan',
    'Prepared by PRAAN reporting system',
    'Submitted by',
    'Approved by',
    1,
    '{"visibleFields":["plan_date","title","expected_output","category","priority","status"],"sectionOrder":["header","calendarSummary","table","signature"],"labelMap":{"title":"Monthly Work Plan","planDate":"Date","expectedOutput":"Expected Output"},"printSettings":{"showHolidayBadges":true,"showNotesArea":true},"signatureBlocks":["submitted_by","approved_by"]}'
  ),
  (
    'template_report',
    'monthly_report',
    'Monthly Report',
    'active',
    1,
    'PRAAN',
    'For monthly management review',
    'Monthly Report',
    'Generated from PRAAN Daily Reporting',
    'Submitted by',
    'Approved by',
    1,
    '{"visibleFields":["project_name","reporting_month","completed_task","ongoing_tasks","tasks_for_next_month","lesson_learned","comments"],"sectionOrder":["header","completedTasks","ongoingTasks","nextMonth","lessons","comments","signature"],"labelMap":{"title":"Monthly Report","completedTask":"Completed Task","ongoingTasks":"Ongoing Tasks","nextMonthTasks":"Tasks for Next Month","lessonsLearned":"Lesson Learned"},"printSettings":{"showSubmissionDate":true,"showFooter":true},"signatureBlocks":["submitted_by","approved_by"]}'
  );

INSERT OR IGNORE INTO template_versions (
  id, template_id, version_number, label_map_json, visible_fields_json, section_order_json, print_settings_json, signature_blocks_json, is_published, notes
) VALUES
  (
    'template_version_daily_1',
    'template_daily',
    1,
    '{"title":"Daily Activity Register","taskDescription":"Task''s Description","output":"Output","note":"Note","delivery":"Delivery"}',
    '["activity_time","task_description","output","note","delivery"]',
    '["header","table","noteBlock","signature"]',
    '{"showDateHeader":true,"compactRows":false,"showFooter":true}',
    '["submitted_by","approved_by"]',
    1,
    'Initial seed version'
  ),
  (
    'template_version_plan_1',
    'template_plan',
    1,
    '{"title":"Monthly Work Plan","planDate":"Date","expectedOutput":"Expected Output"}',
    '["plan_date","title","expected_output","category","priority","status"]',
    '["header","calendarSummary","table","signature"]',
    '{"showHolidayBadges":true,"showNotesArea":true}',
    '["submitted_by","approved_by"]',
    1,
    'Initial seed version'
  ),
  (
    'template_version_report_1',
    'template_report',
    1,
    '{"title":"Monthly Report","completedTask":"Completed Task","ongoingTasks":"Ongoing Tasks","nextMonthTasks":"Tasks for Next Month","lessonsLearned":"Lesson Learned"}',
    '["project_name","reporting_month","completed_task","ongoing_tasks","tasks_for_next_month","lesson_learned","comments"]',
    '["header","completedTasks","ongoingTasks","nextMonth","lessons","comments","signature"]',
    '{"showSubmissionDate":true,"showFooter":true}',
    '["submitted_by","approved_by"]',
    1,
    'Initial seed version'
  );

INSERT OR IGNORE INTO app_settings (
  id, category, key, value, description, is_public
) VALUES
  ('setting_org_name', 'organization', 'name', 'PRAAN', 'Organization name used in reports and print layouts', 1),
  ('setting_reminder_banner', 'reminders', 'show_top_banner', 'true', 'Display sticky top reminder banner for active follow-ups', 0),
  ('setting_daily_modal', 'reminders', 'show_first_visit_modal', 'true', 'Show due follow-up modal on first visit of the day', 0),
  ('setting_signature_footer', 'print', 'default_footer', 'Generated by PRAAN Daily Reporting', 'Default print footer text', 1);

INSERT OR IGNORE INTO work_plans (
  id, user_id, month, status, reviewer_comment, submitted_at, approved_at, approved_by, created_by, updated_by
) VALUES
  ('plan_rahim_2026_03', 'user_rahim', '2026-03', 'submitted', 'Keep documentation aligned with field visits.', '2026-03-01T10:00:00.000Z', NULL, NULL, 'user_rahim', 'user_rahim'),
  ('plan_sadia_2026_03', 'user_sadia', '2026-03', 'approved', 'Looks good for reporting cycle.', '2026-03-01T11:00:00.000Z', '2026-03-02T09:00:00.000Z', 'user_admin', 'user_sadia', 'user_admin');

INSERT OR IGNORE INTO work_plan_items (
  id, work_plan_id, user_id, month, plan_date, sort_order, title, description, expected_output, category, priority, linked_project_id, holiday_type, holiday_label, notes, status, is_auto_generated, follow_up_required, created_by, updated_by
) VALUES
  ('plan_item_1', 'plan_rahim_2026_03', 'user_rahim', '2026-03', '2026-03-12', 1, 'Conduct field visit to Khulna partner office', 'Review daily implementation and beneficiary attendance.', 'Visit note and action log', 'Field Visit', 'high', 'proj_green', 'none', NULL, 'Coordinate with transport team', 'planned', 0, 1, 'user_rahim', 'user_rahim'),
  ('plan_item_2', 'plan_rahim_2026_03', 'user_rahim', '2026-03', '2026-03-13', 2, 'Prepare weekly follow-up tracker', 'Consolidate unresolved observations from field monitoring.', 'Updated tracker shared with supervisor', 'Documentation', 'medium', 'proj_green', 'friday', 'Weekly Holiday', 'Work may continue if urgent', 'carry_forward', 1, 1, 'user_rahim', 'user_rahim'),
  ('plan_item_3', 'plan_sadia_2026_03', 'user_sadia', '2026-03', '2026-03-12', 1, 'Review daily activity submissions', 'Check completeness of all field activity entries.', 'Reviewed submission summary', 'Reporting', 'high', 'proj_youth', 'none', NULL, 'Flag late submissions for reminder', 'in_progress', 0, 1, 'user_sadia', 'user_sadia'),
  ('plan_item_4', 'plan_sadia_2026_03', 'user_sadia', '2026-03', '2026-03-26', 2, 'Prepare independence day communication note', 'Holiday communication and office status update.', 'Internal circular', 'Communications', 'medium', 'proj_youth', 'govt_holiday', 'Independence and National Day', 'Holiday work allowed if required', 'planned', 1, 0, 'user_sadia', 'user_sadia');

INSERT OR IGNORE INTO daily_activities (
  id, user_id, activity_date, activity_time, task_description, output, note, delivery, linked_plan_item_id, follow_up_date, follow_up_note, reminder_status, status, print_group_id, submitted_at, created_by, updated_by
) VALUES
  ('activity_1', 'user_rahim', '2026-03-12', '09:30', 'Visited Khulna partner office and reviewed attendance records', 'Verified attendance gaps for two beneficiary groups', 'Need updated attendance file by next week', 'Shared summary by email', 'plan_item_1', '2026-03-18', 'Collect corrected attendance file from partner office', 'pending', 'completed', 'print_group_mar_1', '2026-03-12T15:00:00.000Z', 'user_rahim', 'user_rahim'),
  ('activity_2', 'user_sadia', '2026-03-12', '11:00', 'Reviewed 14 daily activity submissions from field team', 'Marked 3 submissions for clarification', 'Clarification note sent to field coordinators', 'Dashboard reminder created', 'plan_item_3', '2026-03-14', 'Check corrected submissions before weekly review', 'pending', 'submitted', 'print_group_mar_2', '2026-03-12T16:00:00.000Z', 'user_sadia', 'user_sadia');

INSERT OR IGNORE INTO follow_ups (
  id, user_id, source_type, source_id, title, note, due_date, priority, status, reminder_seen, assigned_to_user_id, created_by, updated_by
) VALUES
  ('followup_1', 'user_rahim', 'activity', 'activity_1', 'Collect corrected attendance file', 'Partner office must send corrected beneficiary attendance sheet.', '2026-03-18', 'high', 'pending', 0, NULL, 'user_rahim', 'user_rahim'),
  ('followup_2', 'user_sadia', 'activity', 'activity_2', 'Validate corrected daily submissions', 'Three field submissions need corrections before reporting close.', '2026-03-14', 'medium', 'overdue', 0, NULL, 'user_sadia', 'user_sadia'),
  ('followup_3', 'user_admin', 'manual', NULL, 'Review March monthly reports', 'Admin review should begin before final week close.', '2026-03-25', 'high', 'pending', 0, 'user_admin', 'user_admin', 'user_admin');

INSERT OR IGNORE INTO notifications (
  id, user_id, type, title, body, action_url, priority, status, meta_json
) VALUES
  ('notification_1', 'user_rahim', 'follow_up_due', 'Follow-up due soon', 'Collect corrected attendance file from partner office.', '/workspace/follow-ups', 'high', 'unread', '{"followUpId":"followup_1"}'),
  ('notification_2', 'user_sadia', 'follow_up_overdue', 'Overdue follow-up', 'Validate corrected daily submissions before report drafting.', '/workspace/follow-ups', 'high', 'unread', '{"followUpId":"followup_2"}');

INSERT OR IGNORE INTO monthly_reports (
  id, user_id, month, project_name, report_name, designation_snapshot, submission_date, status, lessons_learned, comments, submitted_by_name, approved_by_name, created_by, updated_by
) VALUES
  ('report_sadia_2026_03', 'user_sadia', '2026-03', 'Youth Empowerment', 'Sadia Akter', 'Reporting Officer', '2026-03-28', 'draft', 'Early clarification requests improve report quality.', 'Need closer coordination with field team before month end.', 'Sadia Akter', 'Amina Admin', 'user_sadia', 'user_sadia');

INSERT OR IGNORE INTO monthly_report_completed_items (
  id, report_id, sort_order, task_date, task_name, output, remarks, source_activity_id, created_by, updated_by
) VALUES
  ('report_completed_1', 'report_sadia_2026_03', 1, '2026-03-12', 'Reviewed 14 daily activity submissions', 'Marked 3 submissions for clarification and updated dashboard', 'Completed first-pass quality review', 'activity_2', 'user_sadia', 'user_sadia');

INSERT OR IGNORE INTO monthly_report_ongoing_items (
  id, report_id, sort_order, task_name, output, deadline, remarks, source_follow_up_id, created_by, updated_by
) VALUES
  ('report_ongoing_1', 'report_sadia_2026_03', 1, 'Validate corrected daily submissions', 'Awaiting field team correction', '2026-03-30', 'Still open at draft time', 'followup_2', 'user_sadia', 'user_sadia');

INSERT OR IGNORE INTO monthly_report_next_month_items (
  id, report_id, sort_order, task_name, task_date, output, remarks, source_plan_item_id, created_by, updated_by
) VALUES
  ('report_next_1', 'report_sadia_2026_03', 1, 'Prepare April reporting kick-off summary', '2026-04-02', 'Kick-off note with key risk areas', 'Carry forward from March review findings', 'plan_item_3', 'user_sadia', 'user_sadia');

INSERT OR IGNORE INTO audit_logs (
  id, actor_user_id, target_user_id, entity_type, entity_id, action, summary, diff_json, ip_address, user_agent
) VALUES
  ('audit_seed_1', 'user_admin', 'user_sadia', 'report', 'report_sadia_2026_03', 'seed_import', 'Seeded sample monthly report for preview', '{}', '127.0.0.1', 'seed-script'),
  ('audit_seed_2', 'user_admin', 'user_pending', 'user', 'user_pending', 'registration_pending', 'Seeded pending registration for approval workflow preview', '{}', '127.0.0.1', 'seed-script');
