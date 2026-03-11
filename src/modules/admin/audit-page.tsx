"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api/client";

export function AdminAuditPage() {
  const { data } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => api.adminAudit(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit log"
        title="Track sensitive changes"
        description="Approval actions, template changes, report review, and admin-level changes are recorded here."
      />
      <DataTable
        columns={[
          { header: "Time", cell: ({ row }) => <span>{String(row.original.createdAt ?? "-")}</span> },
          { header: "Actor", cell: ({ row }) => <span>{String(row.original.actorName ?? "-")}</span> },
          { header: "Action", cell: ({ row }) => <span>{String(row.original.action ?? "-")}</span> },
          { header: "Entity", cell: ({ row }) => <span>{String(row.original.entityType ?? "-")}</span> },
          { header: "Summary", cell: ({ row }) => <span>{String(row.original.summary ?? "-")}</span> },
        ]}
        data={(data?.items as Record<string, unknown>[]) ?? []}
      />
    </div>
  );
}
