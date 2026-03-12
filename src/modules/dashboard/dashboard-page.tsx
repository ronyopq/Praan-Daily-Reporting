"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CalendarCheck2,
  ClipboardList,
  FilePlus2,
  Files,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { SummaryCard } from "@/components/summary-card";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const quickStart = [
  {
    href: "/workspace/work-plan",
    title: "Open Work Plan",
    text: "See the month and today's planned work.",
    icon: ClipboardList,
  },
  {
    href: "/workspace/daily-activities",
    title: "Add Daily Entry",
    text: "Write today's work in the register.",
    icon: FilePlus2,
  },
  {
    href: "/workspace/follow-ups",
    title: "Check Follow-ups",
    text: "Clear reminders before they become overdue.",
    icon: BellRing,
  },
] as const;

export function DashboardPage() {
  const { data, isPending } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.dashboard(),
  });

  const summary = data?.summary;

  return (
    <div className="d-flex flex-column gap-4 gap-lg-5">
      <PageHeader
        eyebrow="Dashboard"
        title="What do you want to do today?"
        description="Use one simple step at a time: check your plan, add work, then clear reminders."
        actions={
          <>
            <Link href="/workspace/daily-activities" className={buttonVariants()}>
              <FilePlus2 className="size-4" />
              Daily Entry
            </Link>
            <Link href="/workspace/monthly-reports" className={buttonVariants({ variant: "outline" })}>
              <Files className="size-4" />
              Reports
            </Link>
          </>
        }
      />

      <section className="shell-card-strong hero-slab p-4 p-lg-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-xl-7">
            <div className="d-flex flex-column gap-3">
              <span className="soft-badge align-self-start">
                <span className="soft-dot" />
                Today
              </span>
              <div>
                <h2
                  className="mb-2 fw-bold text-dark"
                  style={{ fontSize: "clamp(2rem, 4vw, 3.3rem)", letterSpacing: "-0.05em" }}
                >
                  Start with the easiest next step.
                </h2>
                <p className="section-copy mb-0" style={{ maxWidth: "42rem" }}>
                  The system shows planned work, unfinished items, and reminders so you can move quickly without
                  searching through many pages.
                </p>
              </div>
              <div className="hero-kpi px-4 py-3 align-self-start">
                <p className="mb-1 small fw-semibold text-uppercase" style={{ letterSpacing: "0.12em", color: "#8c6512" }}>
                  Today&apos;s date
                </p>
                <p className="mb-0 fw-bold text-dark">{data?.today ?? "Loading..."}</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-5">
            <div className="quick-grid">
              {quickStart.map((item) => {
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href} className="action-tile p-4">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-4 d-flex align-items-center justify-content-center"
                        style={{
                          width: "3rem",
                          height: "3rem",
                          background: item.href.includes("daily") ? "var(--app-accent-soft)" : "var(--app-primary-soft)",
                          color: item.href.includes("daily") ? "#8c6512" : "var(--app-primary-strong)",
                        }}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-bold text-dark">{item.title}</p>
                        <p className="mb-0 section-copy">{item.text}</p>
                      </div>
                      <ArrowRight className="size-4 mt-1" style={{ color: "var(--app-ink-soft)" }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="row g-3">
        <div className="col-6 col-xl">
          <SummaryCard label="Planned today" value={summary?.plannedToday ?? (isPending ? "..." : 0)} />
        </div>
        <div className="col-6 col-xl">
          <SummaryCard label="Pending follow-ups" value={summary?.pendingFollowUps ?? (isPending ? "..." : 0)} tone="warning" />
        </div>
        <div className="col-6 col-xl">
          <SummaryCard label="Overdue follow-ups" value={summary?.overdueFollowUps ?? (isPending ? "..." : 0)} tone="danger" />
        </div>
        <div className="col-6 col-xl">
          <SummaryCard label="Entries this month" value={summary?.activitiesThisMonth ?? (isPending ? "..." : 0)} />
        </div>
        <div className="col-12 col-xl">
          <SummaryCard label="Report ready" value={`${summary?.monthlyReportProgress ?? 0}%`} tone="success" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <SectionCard
            title="Today from your plan"
            description="These items come from today's work plan and can be turned into a daily entry fast."
          >
            {data?.todayPlan?.length ? (
              <div className="d-flex flex-column gap-3">
                {data.todayPlan.map((item, index) => (
                  <div key={`${item.id ?? index}`} className="simple-list-item p-4">
                    <div className="d-flex flex-column gap-3 flex-lg-row align-items-lg-center justify-content-lg-between">
                      <div>
                        <p className="mb-1 fw-bold text-dark">{String(item.title ?? "Planned task")}</p>
                        <p className="mb-0 section-copy">
                          {String(item.description ?? item.expectedOutput ?? "No extra detail")}
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <StatusPill status={String(item.status ?? "planned")} />
                        <Link href="/workspace/daily-activities" className={buttonVariants({ variant: "outline" })}>
                          Use this
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No planned work yet" description="Open Work Plan and add tasks for this date." />
            )}
          </SectionCard>
        </div>

        <div className="col-12 col-xl-5">
          <SectionCard title="Quick buttons" description="Open the pages you use most often.">
            <div className="d-flex flex-column gap-3">
              {(data?.quickActions ?? []).map((item) => (
                <Link key={item.href} href={item.href} className="action-tile p-4">
                  <div className="d-flex align-items-center justify-content-between gap-4">
                    <div>
                      <p className="mb-1 fw-bold text-dark">{item.title}</p>
                      <p className="mb-0 section-copy">{item.description}</p>
                    </div>
                    <ArrowRight className="size-4" style={{ color: "var(--app-ink-soft)" }} />
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <SectionCard title="Need attention" description="Finish these follow-ups first so nothing gets lost.">
            {data?.pendingFollowUps?.length ? (
              <div className="d-flex flex-column gap-3">
                {data.pendingFollowUps.map((item, index) => (
                  <div key={`${item.id ?? index}`} className="simple-list-item p-4">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="mt-1 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: "2.8rem", height: "2.8rem", background: "var(--app-danger-soft)", color: "var(--app-danger)" }}
                      >
                        <AlertTriangle className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <p className="mb-0 fw-bold text-dark">{String(item.title ?? "Follow-up")}</p>
                          <StatusPill status={String(item.status ?? "pending")} />
                        </div>
                        <p className="mb-0 mt-2 section-copy">{String(item.note ?? "No note added")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No urgent follow-up" description="When a reminder is due, it will show here." />
            )}
          </SectionCard>
        </div>

        <div className="col-12 col-xl-6">
          <SectionCard title="Helpful suggestions" description="The app suggests the next useful task from your work and reminders.">
            <div className="d-flex flex-column gap-3">
              {(data?.suggestions ?? []).map((item, index) => (
                <div key={`${item.id ?? index}`} className="simple-list-item p-4">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "2.8rem",
                        height: "2.8rem",
                        background: index % 2 === 0 ? "var(--app-primary-soft)" : "var(--app-accent-soft)",
                        color: index % 2 === 0 ? "var(--app-primary-strong)" : "#8c6512",
                      }}
                    >
                      {index % 2 === 0 ? <CalendarCheck2 className="size-4" /> : <BellRing className="size-4" />}
                    </div>
                    <div>
                      <p className="mb-1 fw-bold text-dark">{String(item.title ?? "Suggestion")}</p>
                      <p className="mb-0 section-copy">
                        {String(item.reason ?? item.description ?? "Suggested from your current work status.")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {!data?.suggestions?.length ? (
                <EmptyState title="Suggestions will come here" description="Add plan items and daily entries to get smart suggestions." />
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>

      {data?.adminSummary ? (
        <SectionCard
          title="Admin snapshot"
          description="Because you have admin access, you can also see the main organization numbers here."
        >
          <div className="row g-3">
            <div className="col-6 col-xl-3">
              <SummaryCard label="Active users" value={data.adminSummary.activeUsers} />
            </div>
            <div className="col-6 col-xl-3">
              <SummaryCard label="Pending approvals" value={data.adminSummary.pendingApprovals} tone="warning" />
            </div>
            <div className="col-6 col-xl-3">
              <SummaryCard label="Overdue follow-ups" value={data.adminSummary.overdueFollowUps} tone="danger" />
            </div>
            <div className="col-6 col-xl-3">
              <SummaryCard label="Reports submitted" value={data.adminSummary.reportsSubmitted} tone="success" />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "no-print")}>
              Open admin area
            </Link>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
