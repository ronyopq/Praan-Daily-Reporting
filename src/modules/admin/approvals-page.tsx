"use client";

import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { api } from "@/lib/api/client";

export function AdminApprovalsPage() {
  const { data } = useQuery({
    queryKey: ["admin-approvals"],
    queryFn: api.adminApprovals,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Approval queue"
        title="Registration and submission approvals"
        description="See who is waiting and what context they provided when requesting access."
      />
      <SectionCard title="Pending approvals" description="New registrations remain blocked until this step is completed.">
        {data?.items?.length ? (
          <div className="space-y-3">
            {(data.items as Array<Record<string, unknown>>).map((item, index) => (
              <div key={`${item.id ?? index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{String(item.fullName ?? item.email ?? "Pending user")}</p>
                    <p className="mt-1 text-sm text-slate-500">{String(item.notes ?? "No note provided")}</p>
                  </div>
                  <StatusPill status={String(item.status ?? "pending")} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No pending approvals" description="New registrations will appear here until approved or rejected." />
        )}
      </SectionCard>
    </div>
  );
}
