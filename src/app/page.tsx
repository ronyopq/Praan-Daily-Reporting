import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarRange,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { APP_NAME } from "@/lib/constants";

const highlights = [
  {
    title: "Monthly Work Plan",
    description:
      "Generate month structure with Friday and Bangladesh holiday awareness, copy previous plans, and carry unfinished items forward.",
    icon: CalendarRange,
  },
  {
    title: "Daily Activity Register",
    description:
      "Convert plan to activity in one click, maintain register-style output, and keep follow-ups visible until resolved.",
    icon: FileText,
  },
  {
    title: "Admin Control",
    description:
      "Approve users, review submissions, manage templates, holidays, roles, and audit-sensitive actions in one workspace.",
    icon: ShieldCheck,
  },
] as const;

export default function Home() {
  return (
    <div className="marketing-shell">
      <main className="container-xxl px-3 px-lg-4 py-4 py-lg-5">
        <section className="shell-card-strong position-relative overflow-hidden px-4 px-lg-5 py-4 py-lg-5">
          <div className="hero-orb" />
          <div className="row g-4 align-items-center">
            <div className="col-12 col-xl-7">
              <div className="brand-chip mb-4">
                <span className="brand-dot" />
                <span className="small fw-semibold text-uppercase text-secondary">Bootstrap 5 mobile-first redesign</span>
              </div>
              <h1 className="mb-3 fw-bold text-dark" style={{ fontSize: "clamp(2.6rem, 7vw, 5.4rem)", letterSpacing: "-0.06em", lineHeight: 0.95 }}>
                {APP_NAME}
              </h1>
              <p className="section-copy mb-4" style={{ maxWidth: "46rem", fontSize: "1.05rem" }}>
                A fast internal workflow platform for monthly work plans, daily activity registers,
                follow-up reminders, admin approvals, and clean A4 reporting across PRAAN teams.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/login" className="btn btn-primary btn-lg rounded-4 px-4 shadow-sm d-inline-flex align-items-center gap-2">
                  Sign in
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="/register" className="btn btn-light btn-lg rounded-4 border px-4 d-inline-flex align-items-center gap-2">
                  Request account
                </Link>
              </div>

              <div className="row g-3 mt-2">
                {[
                  ["Plan to report", "Work plan suggestions reduce typing every day."],
                  ["Never lose follow-ups", "Overdue reminders stay visible until cleared."],
                  ["Print first", "Daily register, monthly plan, and report layouts stay A4-ready."],
                ].map(([title, text]) => (
                  <div key={title} className="col-12 col-md-4">
                    <div className="shell-card h-100 p-4">
                      <p className="mb-2 fw-bold text-dark">{title}</p>
                      <p className="mb-0 section-copy">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-12 col-xl-5">
              <div className="rounded-5 p-4 p-lg-5 text-white" style={{ background: "linear-gradient(180deg, #0d3b66 0%, #0f766e 100%)", boxShadow: "0 24px 42px rgba(13, 59, 102, 0.22)" }}>
                <div className="panel-note p-4">
                  <p className="mb-2 text-uppercase fw-semibold" style={{ letterSpacing: "0.22em", color: "#bfdbfe" }}>
                    Workflow
                  </p>
                  <div className="d-flex flex-column gap-3 mt-4">
                    {[
                      "Monthly Work Plan",
                      "Daily Activity Entry",
                      "Follow-up Reminder",
                      "Monthly Report Draft",
                      "Admin Review & Approval",
                    ].map((item) => (
                      <div key={item} className="d-flex align-items-center gap-3 rounded-4 px-3 py-3" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <CheckCircle2 className="size-4 text-emerald-300" />
                        <span className="fw-semibold">{item}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 mb-0 small" style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}>
                    Mobile-first navigation, bilingual labels, Bangladesh holiday defaults, admin controls, and controlled templates without a risky page builder.
                  </p>
                </div>

                <div className="row g-3 mt-1">
                  {[
                    { icon: Smartphone, title: "Mobile menu first" },
                    { icon: BellRing, title: "Reminder visibility" },
                    { icon: ShieldCheck, title: "Approval controls" },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="col-4">
                        <div className="panel-note h-100 p-3 text-center">
                          <Icon className="mx-auto mb-2 size-4" />
                          <p className="mb-0 small fw-semibold">{item.title}</p>
                        </div>
                      </div>
                    );
                  })}
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
                  <div className="d-inline-flex align-items-center justify-content-center rounded-4" style={{ width: "3.25rem", height: "3.25rem", background: "var(--app-primary-soft)", color: "var(--app-primary)" }}>
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
