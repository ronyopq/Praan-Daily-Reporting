"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, CalendarCheck2, FilePlus2, TimerReset } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { SummaryCard } from "@/components/summary-card";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function DashboardPage() {
  const { data, isPending } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.dashboard(),
  });

  const summary = data?.summary;

  return (
    <div className="d-flex flex-column gap-4 gap-lg-5">
      <PageHeader
        eyebrow="Workspace overview"
        title="Daily reporting command center"
        description="See today&apos;s plan, unresolved follow-ups, monthly reporting progress, and quick actions from one mobile-first screen."
        actions={
          <>
            <Link href="/workspace/daily-activities" className={buttonVariants()}>
              <FilePlus2 className="size-4" />
              Add today&apos;s activity
            </Link>
            <Link href="/workspace/monthly-reports" className={buttonVariants({ variant: "outline" })}>
              Generate monthly draft
            </Link>
          </>
        }
      />

      <section className="shell-card-strong p-4 p-lg-5">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-xl-8">
            <div className="d-flex flex-column gap-3">
              <div className="brand-chip align-self-start">
                <span className="brand-dot" />
                <span className="small fw-semibold text-uppercase text-secondary">Today at a glance</span>
              </div>
              <div>
                <h2 className="mb-2 fw-bold text-dark" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)", letterSpacing: "-0.05em" }}>
                  Fast path from plan to report.
                </h2>
                <p className="section-copy mb-0" style={{ maxWidth: "48rem" }}>
                  Today&apos;s work plan suggestions, unresolved follow-ups, and report readiness are surfaced immediately so the team can act without digging through menus.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-xl-4">
            <div className="shell-card p-4">
              <p className="mb-1 fw-bold text-dark">Today</p>
              <p className="mb-2 small text-uppercase fw-semibold" style={{ letterSpacing: "0.14em", color: "var(--app-primary)" }}>{data?.today ?? "Loading..."}</p>
              <p className="mb-0 section-copy">
                Suggestions are generated from today&apos;s plan, unfinished work, and overdue follow-ups.
              </p>
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
          <SummaryCard label="Activities this month" value={summary?.activitiesThisMonth ?? (isPending ? "..." : 0)} />
        </div>
        <div className="col-12 col-xl">
          <SummaryCard label="Report completion" value={`${summary?.monthlyReportProgress ?? 0}%`} tone="success" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-7">
          <SectionCard
            title="Today&apos;s plan suggestions"
            description="Planned tasks and carry-forward candidates appear here for quick conversion into daily activity."
          >
            {data?.todayPlan?.length ? (
              <div className="d-flex flex-column gap-3">
                {data.todayPlan.map((item, index) => (
                  <div key={`${item.id ?? index}`} className="shell-card p-4">
                    <div className="d-flex flex-column gap-3 flex-lg-row align-items-lg-center justify-content-lg-between">
                      <div>
                        <p className="mb-1 fw-bold text-dark">{String(item.title ?? "Planned task")}</p>
                        <p className="mb-0 section-copy">{String(item.description ?? item.expectedOutput ?? "No description added")}</p>
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <StatusPill status={String(item.status ?? "planned")} />
                        <Link href="/workspace/daily-activities" className={buttonVariants({ variant: "outline" })}>
                          Convert
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No planned tasks yet" description="Generate your monthly plan or add tasks to see daily suggestions here." />
            )}
          </SectionCard>
        </div>

        <div className="col-12 col-xl-5">
          <SectionCard title="Quick actions" description="Common workflow accelerators for busy mobile-friendly operations.">
            <div className="d-flex flex-column gap-3">
              {(data?.quickActions ?? []).map((item) => (
                <Link key={item.href} href={item.href} className="shell-card p-4">
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
          <SectionCard
            title="Follow-up pressure points"
            description="Due, snoozed, and overdue reminders stay visible until they are resolved."
          >
            {data?.pendingFollowUps?.length ? (
              <div className="d-flex flex-column gap-3">
                {data.pendingFollowUps.map((item, index) => (
                  <div key={`${item.id ?? index}`} className="shell-card p-4">
                    <div className="d-flex align-items-start gap-3">
                      <div className="mt-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "2.75rem", height: "2.75rem", background: "rgba(220,38,38,0.1)", color: "var(--app-danger)" }}>
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
              <EmptyState title="Nothing overdue" description="Resolved follow-ups disappear from this panel once completed or dismissed." />
            )}
          </SectionCard>
        </div>

        <div className="col-12 col-xl-6">
          <SectionCard
            title="Suggestion engine"
            description="Unfinished items, today&apos;s plan, and overdue reminders drive the next recommended actions."
          >
            <div className="d-flex flex-column gap-3">
              {(data?.suggestions ?? []).map((item, index) => (
                <div key={`${item.id ?? index}`} className="shell-card p-4">
                  <div className="d-flex align-items-center gap-3">
                    {index % 3 === 0 ? (
                      <CalendarCheck2 className="size-5" style={{ color: "var(--app-primary)" }} />
                    ) : (
                      <TimerReset className="size-5" style={{ color: "var(--app-warning)" }} />
                    )}
                    <div>
                      <p className="mb-1 fw-bold text-dark">{String(item.title ?? "Suggested task")}</p>
                      <p className="mb-0 section-copy">{String(item.reason ?? item.description ?? "Suggested from your current workflow state.")}</p>
                    </div>
                  </div>
                </div>
              ))}
              {!data?.suggestions?.length ? (
                <EmptyState title="Suggestions will appear here" description="The system will suggest planned tasks, overdue follow-ups, and unfinished work." />
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>

      {data?.adminSummary ? (
        <SectionCard
          title="Admin summary"
          description="Because your role includes admin access, you can see organization-wide pressure points here too."
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
              Open admin console
            </Link>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
