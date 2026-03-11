"use client";

import { useQuery } from "@tanstack/react-query";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { api } from "@/lib/api/client";

export function AdminSettingsPage() {
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: api.adminSettings,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Application settings"
        title="Organization-level configuration"
        description="Global values for reminders, signatures, and default organizational behavior."
      />
      <DataTable
        columns={[
          { header: "Category", cell: ({ row }) => <span>{String(row.original.category ?? "-")}</span> },
          { header: "Key", cell: ({ row }) => <span>{String(row.original.key ?? "-")}</span> },
          { header: "Value", cell: ({ row }) => <span>{String(row.original.value ?? "-")}</span> },
          { header: "Description", cell: ({ row }) => <span>{String(row.original.description ?? "-")}</span> },
        ]}
        data={(data?.items as Record<string, unknown>[]) ?? []}
      />
    </div>
  );
}
