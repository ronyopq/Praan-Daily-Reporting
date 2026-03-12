import Link from "next/link";
import { ArrowRight, BellRing, CalendarRange, FileText, ShieldCheck } from "lucide-react";

import { APP_NAME } from "@/lib/constants";

const highlights = [
  {
    title: "Work Plan",
    description: "Build the month with Fridays, holidays, and task rows.",
    icon: CalendarRange,
  },
  {
    title: "Daily Entry",
    description: "Add the day's work fast using plan suggestions.",
    icon: FileText,
  },
  {
    title: "Admin Review",
    description: "Approve users, review reports, and manage templates.",
    icon: ShieldCheck,
  },
] as const;

export default function Home() {
  return (
    <div className="marketing-shell">
      <main className="container-xxl px-3 px-lg-4 py-4 py-lg-5">
        <section className="shell-card-strong hero-slab px-4 px-lg-5 py-4 py-lg-5">
          <div className="row g-4 align-items-center">
            <div className="col-12 col-xl-7">
              <div className="brand-chip mb-4">
                <span className="brand-dot" />
                <span className="small fw-semibold text-uppercase" style={{ color: "var(--app-ink-soft)" }}>
                  Simple workflow
                </span>
              </div>
              <h1
                className="mb-3 fw-bold text-dark"
                style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)", letterSpacing: "-0.06em", lineHeight: 0.95 }}
              >
                {APP_NAME}
              </h1>
              <p className="section-copy mb-4" style={{ maxWidth: "44rem", fontSize: "1.08rem" }}>
                A simple internal system for monthly work plans, daily reporting, follow-up reminders, approval flow,
                and print-ready monthly reports.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/login" className="btn btn-warning btn-lg rounded-4 px-4 shadow-sm d-inline-flex align-items-center gap-2">
                  Sign in
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/register" className="btn btn-light btn-lg rounded-4 border px-4 d-inline-flex align-items-center gap-2">
                  Request account
                </Link>
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="shell-card h-100 p-4 p-lg-5">
                <p className="mb-3 fw-bold text-dark" style={{ fontSize: "1.3rem" }}>
                  Easy daily flow
                </p>
                <div className="d-flex flex-column gap-3">
                  {[
                    "Open the work plan",
                    "Add today's daily entry",
                    "Check follow-ups",
                    "Create monthly report",
                  ].map((item, index) => (
                    <div key={item} className="d-flex align-items-center gap-3 rounded-4 px-3 py-3" style={{ background: "var(--app-panel-soft)" }}>
                      <span className="sidebar-help-step-number">{index + 1}</span>
                      <span className="fw-semibold text-dark">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="hero-kpi mt-4 p-4">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "2.75rem", height: "2.75rem", background: "var(--app-primary-soft)", color: "var(--app-primary-strong)" }}
                    >
                      <BellRing className="size-4" />
                    </div>
                    <div>
                      <p className="mb-1 fw-bold text-dark">Reminder-first design</p>
                      <p className="mb-0 section-copy">Follow-ups stay visible until they are completed or rescheduled.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="row g-4 mt-1">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="col-12 col-lg-4">
                <article className="shell-card h-100 p-4 p-xl-5">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-4"
                    style={{ width: "3.25rem", height: "3.25rem", background: "var(--app-primary-soft)", color: "var(--app-primary-strong)" }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-4 mb-2 fs-4 fw-bold text-dark">{item.title}</h2>
                  <p className="mb-0 section-copy">{item.description}</p>
                </article>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
