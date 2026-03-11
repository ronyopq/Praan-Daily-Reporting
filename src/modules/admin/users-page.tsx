"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";

export function AdminUsersPage() {
  const { data, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.adminUsers(),
  });

  async function updateUser(id: string, approvalStatus: string) {
    try {
      await api.adminUpdateUser(id, { approvalStatus });
      toast.success("User updated");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user");
    }
  }

  const columns: ColumnDef<Record<string, unknown>>[] = [
    {
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-950">{String(row.original.fullName ?? row.original.email ?? "-")}</p>
          <p className="text-xs text-slate-500">{String(row.original.email ?? "-")}</p>
        </div>
      ),
    },
    { header: "Designation", cell: ({ row }) => <span>{String(row.original.designation ?? "-")}</span> },
    { header: "Department", cell: ({ row }) => <span>{String(row.original.departmentName ?? "-")}</span> },
    { header: "Role", cell: ({ row }) => <span className="capitalize">{String(row.original.role ?? "user")}</span> },
    { header: "Status", cell: ({ row }) => <StatusPill status={String(row.original.approvalStatus ?? "pending")} /> },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => updateUser(String(row.original.id), "approved")}>
            Approve
          </Button>
          <Button variant="outline" onClick={() => updateUser(String(row.original.id), "suspended")}>
            Suspend
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin users"
        title="Manage accounts and role-based access"
        description="Approve, suspend, and review the user directory with department and role visibility."
      />
      <DataTable columns={columns} data={(data?.items as Record<string, unknown>[]) ?? []} />
    </div>
  );
}
