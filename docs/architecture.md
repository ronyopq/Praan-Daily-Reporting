# Architecture Reference

## 1. Product architecture summary

- Static Next.js App Router frontend serves mobile-first screens from Cloudflare Pages.
- Pages Functions provide API/auth backends with D1/KV bindings.
- D1 holds normalized relational workflow data.
- KV stores reminder badge state and session-adjacent metadata.
- Print/export is handled by controlled templates plus A4 print CSS.

## 2. Key assumptions

- Pages-hosted frontend is the required public deployment target.
- Backend logic runs in Pages Functions and must remain Workers-compatible.
- Internal-app SEO is not a priority; API-side protection matters more than HTML secrecy.
- Admins can edit yearly Bangladesh holidays after seed import.
- Sample seed credentials are acceptable for first deployment and should be rotated immediately.

## 3. Folder structure

```text
functions/
  _shared/
  admin/[[path]].ts
  api/[[path]].ts
  workspace/[[path]].ts
src/
  app/
  components/
  db/
    schema/
  hooks/
  lib/
    api/
    validation/
  modules/
drizzle/
seed/
docs/
```

## 4. Route map

- `/`
- `/login`
- `/register`
- `/pending-approval`
- `/workspace`
- `/workspace/work-plan`
- `/workspace/daily-activities`
- `/workspace/follow-ups`
- `/workspace/monthly-reports`
- `/workspace/calendar`
- `/workspace/print`
- `/workspace/profile`
- `/admin`
- `/admin/users`
- `/admin/approvals`
- `/admin/templates`
- `/admin/holidays`
- `/admin/settings`
- `/admin/audit`

## 5. Database schema

Tables implemented:

- `users`
- `roles`
- `user_roles`
- `user_profiles`
- `approval_requests`
- `auth_sessions`
- `departments_or_projects`
- `task_templates`
- `work_plans`
- `work_plan_items`
- `daily_activities`
- `follow_ups`
- `monthly_reports`
- `monthly_report_completed_items`
- `monthly_report_ongoing_items`
- `monthly_report_next_month_items`
- `holidays`
- `templates`
- `template_versions`
- `notifications`
- `audit_logs`
- `app_settings`

## 6. Migration files

- Initial Drizzle SQL: [`drizzle/0000_narrow_deadpool.sql`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/drizzle/0000_narrow_deadpool.sql)
- Drizzle config: [`drizzle.config.ts`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/drizzle.config.ts)

## 7. Seed data

- Roles, departments, projects
- Super admin, admin, approved users, pending user
- Bangladesh holiday starter rows
- Template baseline rows and versions
- App settings
- Sample work plans, daily activities, follow-ups, monthly report, notifications, audit events

Seed file: [`seed/001_seed.sql`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/seed/001_seed.sql)

## 8. Auth and authorization design

- Email/password login with bcrypt
- Registration writes pending user + approval request
- Approved-only access enforced in API and route guards
- JWT session cookie signed with `SESSION_SECRET`
- Session records stored in D1, lightweight metadata touched in KV
- Role gates: `user`, `admin`, `super_admin`

## 9. Template engine/configuration design

- Templates are controlled, not freeform
- Config in `templates.settings_json`
- Historical versions in `template_versions`
- Renderer remains code-based and safe
- Admin can rename labels, set footer/header, manage signature labels

## 10. API / server action design

Implemented API groups:

- `/api/auth/*`
- `/api/dashboard`
- `/api/work-plans`
- `/api/work-plans/generate`
- `/api/daily-activities`
- `/api/follow-ups`
- `/api/follow-ups/:id/complete`
- `/api/follow-ups/:id/snooze`
- `/api/monthly-reports`
- `/api/monthly-reports/generate`
- `/api/calendar`
- `/api/admin/users`
- `/api/admin/approvals`
- `/api/admin/templates`
- `/api/admin/holidays`
- `/api/admin/settings`
- `/api/admin/audit`

## 11. Validation schemas

Zod contracts exist for:

- login
- registration
- profile
- work plan items and plans
- daily activity lines
- follow-ups
- monthly reports and sections
- holidays
- templates
- admin user update payloads

See [`src/lib/validation`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/src/lib/validation).

## 12. UI screen list

- Public landing page
- Login
- Registration
- Pending approval
- Workspace dashboard
- Work plan manager
- Daily activity register
- Follow-up board
- Monthly report editor
- Calendar
- Print center
- Profile
- Admin overview
- Admin users
- Admin approvals
- Admin templates
- Admin holidays
- Admin settings
- Admin audit

## 13. Reusable component list

- `AppShell`
- `ShellGate`
- `PageHeader`
- `SectionCard`
- `SummaryCard`
- `StatusPill`
- `DataTable`
- `CalendarBoard`
- shared `shadcn/ui` primitives

## 14. Full codebase scaffold

- UI/domain/data separation under `src/components`, `src/modules`, `src/lib`, `src/db`
- backend separation under `functions/_shared` and `functions/api`
- deploy/config roots under `wrangler.jsonc`, `drizzle.config.ts`, `seed/`, `docs/`

## 15. Key page implementations

- Dashboard surfaces plan, follow-up pressure, quick actions, and admin metrics
- Work plan supports generated month skeleton + row editing + calendar view
- Daily activities support plan suggestions and register-shaped entry
- Follow-ups expose due/overdue queue with quick add, snooze, complete
- Monthly reports support draft generation and editable sections

## 16. Print/export layout implementation

- A4 print CSS in [`src/app/globals.css`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/src/app/globals.css)
- Print center page switches between daily register, work plan, and monthly report preview
- Controlled template configuration drives labels and footer/header behavior

## 17. Dashboard implementation

- User dashboard aggregates today’s plan, pending/overdue follow-ups, monthly activity count, report progress
- Admin summary overlays organization-wide approval and overdue metrics
- KV reminder badge state is refreshed from dashboard and follow-up reads

## 18. Calendar implementation

- FullCalendar-based month/week/list views
- Events generated from work plan items, activities, follow-ups, and holidays
- Admin-capable data scope via API when role permits

## 19. Follow-up reminder implementation

- Follow-ups become overdue automatically through API refresh
- KV reminder cache stores pending/overdue badge state
- Notification rows are created for activity-generated follow-ups
- Follow-up state remains visible in dashboard, follow-up board, and calendar

## 20. Admin management implementation

- User directory with approval state updates
- Approval queue
- Template management
- Holiday management
- Settings table view
- Audit log view

## 21. README

- See [`README.md`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/README.md)

## 22. env.example

- See [`.env.example`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/.env.example)
- Local secret template: [`.dev.vars.example`](/D:/RONY/OneDrive%20-%20NRDS/CodeX/Praan%20_Daily_Activity/.dev.vars.example)

## 23. Cloudflare deployment steps

- Create Pages project
- Create D1 database
- Create KV namespaces
- Update `wrangler.jsonc`
- Add `SESSION_SECRET`
- Run migrations and seed
- Build and deploy `out/`

Detailed commands are in the README.

## 24. GitHub setup steps

- `git init`
- `git add .`
- `git commit -m "Build PRAAN Daily Reporting platform"`
- `git branch -M main`
- `git remote add origin https://github.com/ronyopq/Praan-Daily-Reporting.git`
- `git push -u origin main`

## 25. D1 + KV setup commands

```bash
npx wrangler d1 create praan-daily-reporting --location apac
npx wrangler kv namespace create APP_KV
npx wrangler kv namespace create APP_KV --preview
npm run db:migrate:remote
npm run db:seed:remote
```

## 26. Future enhancements

- Add email delivery for reminders and approval decisions
- Expand template editor to field-level ordering UI
- Add file/template asset storage in R2
- Add true drag-and-drop row ordering persistence
- Add richer admin analytics with charts
- Add user impersonation-safe preview mode
- Add export to PDF generation service for consistent formatting beyond browser print
