"use client";

import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { SummaryCard } from "@/components/summary-card";
import { api } from "@/lib/api/client";

export function AdminOverviewPage() {
  const { data } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.dashboard("scope=admin"),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin control"
        title="Monitor approvals, submissions, and compliance"
        description="Operational admin view across users, follow-ups, and monthly reporting status."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Active users" value={data?.adminSummary?.activeUsers ?? 0} />
        <SummaryCard label="Pending approvals" value={data?.adminSummary?.pendingApprovals ?? 0} tone="warning" />
        <SummaryCard label="Overdue follow-ups" value={data?.adminSummary?.overdueFollowUps ?? 0} tone="danger" />
        <SummaryCard label="Reports submitted" value={data?.adminSummary?.reportsSubmitted ?? 0} tone="success" />
      </div>
      <SectionCard title="Recent submissions" description="Latest user activity and report pressure points.">
        {data?.suggestions?.length ? (
          <div className="space-y-3">
            {(data.suggestions as Array<Record<string, unknown>>).map((item, index) => (
              <div key={`${item.id ?? index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{String(item.title ?? "Submission")}</p>
                <p className="mt-1 text-sm text-slate-500">{String(item.description ?? item.reason ?? "No detail")}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No recent submissions" description="Once users submit plans and reports, recent activity will show here." />
        )}
      </SectionCard>
    </div>
  );
}
