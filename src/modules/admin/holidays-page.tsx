"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import { HOLIDAY_TYPES } from "@/lib/constants";

export function AdminHolidaysPage() {
  const [form, setForm] = useState({
    holidayDate: "",
    holidayType: "govt_holiday",
    label: "",
  });

  const { data, refetch } = useQuery({
    queryKey: ["admin-holidays"],
    queryFn: api.adminHolidays,
  });

  async function saveHoliday() {
    try {
      await api.adminSaveHoliday(form);
      toast.success("Holiday saved");
      setForm({ holidayDate: "", holidayType: "govt_holiday", label: "" });
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save holiday");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Holiday calendar"
        title="Manage Bangladesh holidays and overrides"
        description="Fridays are auto-marked, but yearly holiday tables stay editable by admins."
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="surface p-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="holidayDate">Date</Label>
              <Input id="holidayDate" type="date" value={form.holidayDate} onChange={(event) => setForm({ ...form, holidayDate: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.holidayType}
                onValueChange={(value) => {
                  if (value) {
                    setForm({ ...form, holidayType: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOLIDAY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} />
            </div>
            <Button onClick={saveHoliday}>Save holiday</Button>
          </div>
        </div>
        <DataTable
          columns={[
            { header: "Date", cell: ({ row }) => <span>{String(row.original.holidayDate ?? "-")}</span> },
            { header: "Label", cell: ({ row }) => <span>{String(row.original.label ?? "-")}</span> },
            { header: "Type", cell: ({ row }) => <span>{String(row.original.holidayType ?? "-")}</span> },
          ]}
          data={(data?.items as Record<string, unknown>[]) ?? []}
        />
      </div>
    </div>
  );
}
