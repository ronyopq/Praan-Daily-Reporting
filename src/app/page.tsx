import Link from "next/link";
import { ArrowRight, CalendarRange, CheckCircle2, FileText, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen bg-[linear-gradient(180deg,_#e0f2fe_0%,_#f8fafc_28%,_#fff7ed_100%)]">
      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 lg:px-8">
        <section className="overflow-hidden rounded-[40px] border border-white/70 bg-white/80 px-6 py-8 shadow-xl shadow-sky-100/70 backdrop-blur lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-sky-800">
                Internal Workflow Platform
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 lg:text-6xl">
                  {APP_NAME}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 lg:text-lg">
                  Multi-tenant monthly planning, daily reporting, follow-up tracking, calendar visibility,
                  approval workflow, and A4-ready printing for PRAAN teams.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Sign in
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Request account
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Plan to report", "Work Plan suggestions reduce re-typing every day."],
                  ["Never lose follow-ups", "Overdue reminders remain visible across dashboard and calendar."],
                  ["Print first", "Daily register, monthly plan, and monthly report are A4-optimized."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="mt-2 text-sm text-slate-500">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,_#0f172a_0%,_#1e293b_100%)] p-6 text-white shadow-lg shadow-slate-300/60">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-200">
                  Workflow
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    "Monthly Work Plan",
                    "Daily Activity Entry",
                    "Follow-up Reminder",
                    "Monthly Report Draft",
                    "Admin Review & Approval",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3">
                      <CheckCircle2 className="size-4 text-emerald-300" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-200">
                  Bengali + English labels, mobile-first entry, role-based access, Bangladesh holiday defaults,
                  and configurable organizational templates without a risky freeform builder.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="surface p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <Icon className="size-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
