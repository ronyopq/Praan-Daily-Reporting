"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Files,
  TrendingUp,
} from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { SummaryCard } from "@/components/summary-card";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api/client";

function buildWeek() {
  const today = new Date();
  const dayIndex = today.getDay();
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + mondayOffset + index);

    return {
      key: date.toISOString(),
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      dateNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    };
  });
}

export function DashboardPage() {
  const { data, isPending } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.dashboard(),
  });

  const summary = data?.summary;
  const week = useMemo(() => buildWeek(), []);
  const todayItems = (data?.todayPlan as Array<Record<string, unknown>> | undefined) ?? [];
  const suggestionItems = (data?.suggestions as Array<Record<string, unknown>> | undefined) ?? [];
  const followUps = (data?.pendingFollowUps as Array<Record<string, unknown>> | undefined) ?? [];

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-8">
        <div className="d-flex flex-column gap-4">
          <section className="shell-card-strong p-4 p-lg-5">
            <div className="d-flex flex-column gap-4">
              <div className="d-flex flex-column gap-2">
                <p className="mb-0 fw-semibold" style={{ color: "var(--app-ink-soft)" }}>
                  Dashboard
                </p>
                <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-lg-between gap-3">
                  <div>
                    <h1 className="mb-2 fw-bold text-dark" style={{ fontSize: "clamp(1.9rem, 3vw, 2.7rem)", letterSpacing: "-0.05em" }}>
                      Today&apos;s work overview
                    </h1>
                    <p className="mb-0 section-copy">
                      See plan items, daily entries, reminders, and report progress from one easy dashboard.
                    </p>
                  </div>
                  <Link href="/workspace/daily-activities" className={buttonVariants()}>
                    <FileText className="size-4" />
                    Daily Entry
                  </Link>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6 col-lg-3">
                  <SummaryCard
                    label="Planned today"
                    value={summary?.plannedToday ?? (isPending ? "..." : 0)}
                    icon={<ClipboardList className="size-4" />}
                  />
                </div>
                <div className="col-6 col-lg-3">
                  <SummaryCard
                    label="Entries this month"
                    value={summary?.activitiesThisMonth ?? (isPending ? "..." : 0)}
                    icon={<TrendingUp className="size-4" />}
                  />
                </div>
                <div className="col-6 col-lg-3">
                  <SummaryCard
                    label="Pending follow-ups"
                    value={summary?.pendingFollowUps ?? (isPending ? "..." : 0)}
                    tone="warning"
                    icon={<BellRing className="size-4" />}
                  />
                </div>
                <div className="col-6 col-lg-3">
                  <SummaryCard
                    label="Report ready"
                    value={`${summary?.monthlyReportProgress ?? 0}%`}
                    tone="success"
                    icon={<Files className="size-4" />}
                  />
                </div>
              </div>
            </div>
          </section>

          <SectionCard
            title="Today&apos;s work list"
            description="Start with the planned work below. Use one item at a time."
            actions={
              <Link href="/workspace/work-plan" className={buttonVariants({ variant: "outline" })}>
                Open Work Plan
              </Link>
            }
          >
            {todayItems.length ? (
              <div className="d-flex flex-column gap-3">
                {todayItems.map((item, index) => (
                  <div key={`${item.id ?? index}`} className="simple-list-item px-4 py-3">
                    <div className="row g-3 align-items-center">
                      <div className="col-12 col-md-5">
                        <p className="mb-1 fw-bold text-dark">{String(item.title ?? "Planned task")}</p>
                        <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                          {String(item.description ?? item.expectedOutput ?? "No detail")}
                        </p>
                      </div>
                      <div className="col-6 col-md-3">
                        <span className="soft-badge">
                          <CalendarDays className="size-4" />
                          Today
                        </span>
                      </div>
                      <div className="col-6 col-md-2">
                        <StatusPill status={String(item.status ?? "planned")} />
                      </div>
                      <div className="col-12 col-md-2 d-flex justify-content-md-end">
                        <Link href="/workspace/daily-activities" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                          Use
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No work planned for today" description="Add tasks in Work Plan to see them here." />
            )}
          </SectionCard>

          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <SectionCard title="Monthly plan" description="Quick view of your progress this month.">
                <div className="d-flex flex-column gap-3">
                  <div className="hero-kpi p-4">
                    <p className="mb-1 fw-bold text-dark">Work progress</p>
                    <p className="mb-0 section-copy">
                      Planned tasks: {summary?.plannedToday ?? 0} today, {summary?.activitiesThisMonth ?? 0} activity lines this month.
                    </p>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Link href="/workspace/work-plan" className={buttonVariants({ variant: "secondary" })}>
                      Open Plan
                    </Link>
                    <Link href="/workspace/monthly-reports" className={buttonVariants({ variant: "outline" })}>
                      Open Report
                    </Link>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="col-12 col-lg-6">
              <SectionCard title="Suggested tasks" description="These come from unfinished work and reminders.">
                <div className="d-flex flex-column gap-3">
                  {suggestionItems.length ? (
                    suggestionItems.slice(0, 4).map((item, index) => (
                      <div key={`${item.id ?? index}`} className="simple-list-item px-4 py-3">
                        <div className="d-flex align-items-start gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: "1.5rem",
                              height: "1.5rem",
                              marginTop: "0.1rem",
                              background: index % 2 === 0 ? "var(--app-primary-soft)" : "var(--app-accent-soft)",
                              color: index % 2 === 0 ? "var(--app-primary-strong)" : "var(--app-accent-strong)",
                            }}
                          >
                            <CheckCircle2 className="size-3" />
                          </div>
                          <div>
                            <p className="mb-1 fw-bold text-dark">{String(item.title ?? "Suggestion")}</p>
                            <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                              {String(item.reason ?? item.description ?? "Suggested from your current work.")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState title="No suggestion yet" description="Suggestions will appear after work plan and daily entries are added." />
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12 col-xl-4">
        <div className="d-flex flex-column gap-4">
          <SectionCard title="Schedule" description="Current week at a glance.">
            <div className="row row-cols-7 g-2 text-center">
              {week.map((day) => (
                <div key={day.key} className="col">
                  <div
                    className="rounded-4 px-2 py-2 h-100"
                    style={{
                      background: day.isToday ? "var(--app-primary-soft)" : "var(--app-panel-soft)",
                      color: day.isToday ? "var(--app-primary-strong)" : "var(--app-ink-soft)",
                    }}
                  >
                    <p className="mb-1 small fw-semibold">{day.label}</p>
                    <p className="mb-0 fw-bold">{day.dateNumber}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 d-flex flex-column gap-3">
              {todayItems.length ? (
                todayItems.slice(0, 3).map((item, index) => (
                  <div key={`${item.id ?? index}`} className="simple-list-item p-3">
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      <div>
                        <p className="mb-1 fw-bold text-dark">{String(item.title ?? "Today item")}</p>
                        <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                          {String(item.expectedOutput ?? item.description ?? "Planned for today")}
                        </p>
                      </div>
                      <StatusPill status={String(item.status ?? "planned")} />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No item for today" description="Today&apos;s list appears here after planning." />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Follow-ups" description="Keep these visible until done.">
            <div className="d-flex flex-column gap-3">
              {followUps.length ? (
                followUps.slice(0, 4).map((item, index) => (
                  <div key={`${item.id ?? index}`} className="simple-list-item p-3">
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      <div>
                        <p className="mb-1 fw-bold text-dark">{String(item.title ?? "Follow-up")}</p>
                        <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                          {String(item.note ?? "No note")}
                        </p>
                      </div>
                      <StatusPill status={String(item.status ?? "pending")} />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No follow-up now" description="When follow-ups are due, they will appear here." />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Quick links" description="Open common pages fast.">
            <div className="d-flex flex-column gap-3">
              {(data?.quickActions ?? []).slice(0, 4).map((item) => (
                <Link key={item.href} href={item.href} className="action-tile p-3">
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <div>
                      <p className="mb-1 fw-bold text-dark">{item.title}</p>
                      <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                        {item.description}
                      </p>
                    </div>
                    <span className="soft-badge">Open</span>
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
