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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace overview"
        title="Daily reporting command center"
        description="See today’s plan, unresolved follow-ups, monthly reporting progress, and quick actions from one screen."
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Planned today" value={summary?.plannedToday ?? (isPending ? "..." : 0)} />
        <SummaryCard label="Pending follow-ups" value={summary?.pendingFollowUps ?? (isPending ? "..." : 0)} tone="warning" />
        <SummaryCard label="Overdue follow-ups" value={summary?.overdueFollowUps ?? (isPending ? "..." : 0)} tone="danger" />
        <SummaryCard label="Activities this month" value={summary?.activitiesThisMonth ?? (isPending ? "..." : 0)} />
        <SummaryCard label="Report completion" value={`${summary?.monthlyReportProgress ?? 0}%`} tone="success" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title="Today’s plan suggestions"
          description="Planned tasks and carry-forward candidates appear here for quick conversion into daily activity."
        >
          {data?.todayPlan?.length ? (
            <div className="space-y-3">
              {data.todayPlan.map((item, index) => (
                <div key={`${item.id ?? index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{String(item.title ?? "Planned task")}</p>
                      <p className="mt-1 text-sm text-slate-500">{String(item.description ?? item.expectedOutput ?? "No description added")}</p>
                    </div>
                    <div className="flex items-center gap-2">
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

        <SectionCard title="Quick actions" description="Common workflow accelerators for busy mobile-friendly operations.">
          <div className="grid gap-3">
            {(data?.quickActions ?? []).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-4 py-4 transition hover:border-sky-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.description}</p>
                  </div>
                  <ArrowRight className="size-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Follow-up pressure points"
          description="Due, snoozed, and overdue reminders stay visible until they are resolved."
        >
          {data?.pendingFollowUps?.length ? (
            <div className="space-y-3">
              {data.pendingFollowUps.map((item, index) => (
                <div key={`${item.id ?? index}`} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-rose-50 p-2 text-rose-600">
                      <AlertTriangle className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-950">{String(item.title ?? "Follow-up")}</p>
                        <StatusPill status={String(item.status ?? "pending")} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{String(item.note ?? "No note added")}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="Nothing overdue" description="Resolved follow-ups disappear from this panel once completed or dismissed." />
          )}
        </SectionCard>

        <SectionCard
          title="Suggestion engine"
          description="Unfinished items, today’s plan, and overdue reminders drive the next recommended actions."
        >
          <div className="grid gap-3">
            {(data?.suggestions ?? []).map((item, index) => (
              <div key={`${item.id ?? index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  {index % 3 === 0 ? (
                    <CalendarCheck2 className="size-5 text-sky-700" />
                  ) : (
                    <TimerReset className="size-5 text-amber-700" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{String(item.title ?? "Suggested task")}</p>
                    <p className="text-sm text-slate-500">{String(item.reason ?? item.description ?? "Suggested from your current workflow state.")}</p>
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

      {data?.adminSummary ? (
        <SectionCard
          title="Admin summary"
          description="Because your role includes admin access, you can see organization-wide pressure points here too."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Active users" value={data.adminSummary.activeUsers} />
            <SummaryCard label="Pending approvals" value={data.adminSummary.pendingApprovals} tone="warning" />
            <SummaryCard label="Overdue follow-ups" value={data.adminSummary.overdueFollowUps} tone="danger" />
            <SummaryCard label="Reports submitted" value={data.adminSummary.reportsSubmitted} tone="success" />
          </div>
          <div className="mt-5">
            <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "no-print")}>
              Open admin console
            </Link>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}
