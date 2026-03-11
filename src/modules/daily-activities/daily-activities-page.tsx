"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { currentDhakaTime, todayInDhaka } from "@/lib/date";

export function DailyActivitiesPage() {
  const today = todayInDhaka();
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [form, setForm] = useState({
    activityDate: today,
    activityTime: currentDhakaTime(),
    taskDescription: "",
    output: "",
    note: "",
    delivery: "",
    status: "submitted",
    followUpDate: "",
    followUpNote: "",
  });

  const { data, refetch } = useQuery({
    queryKey: ["daily-activities", fromDate, toDate],
    queryFn: () => api.dailyActivities(`fromDate=${fromDate}&toDate=${toDate}`),
  });

  async function saveActivity() {
    try {
      await api.saveDailyActivity(form);
      toast.success("Daily activity saved");
      setForm((current) => ({
        ...current,
        taskDescription: "",
        output: "",
        note: "",
        delivery: "",
        followUpDate: "",
        followUpNote: "",
      }));
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save activity");
    }
  }

  const columns: ColumnDef<Record<string, unknown>>[] = [
    { header: "Time", cell: ({ row }) => <span>{String(row.original.activityTime ?? "-")}</span> },
    { header: "Task's Description", cell: ({ row }) => <span>{String(row.original.taskDescription ?? "-")}</span> },
    { header: "Output", cell: ({ row }) => <span>{String(row.original.output ?? "-")}</span> },
    { header: "Note", cell: ({ row }) => <span>{String(row.original.note ?? "-")}</span> },
    { header: "Delivery", cell: ({ row }) => <span>{String(row.original.delivery ?? "-")}</span> },
    {
      header: "Status",
      cell: ({ row }) => <StatusPill status={String(row.original.status ?? "draft")} />,
    },
  ];

  function applySuggestion(item: Record<string, unknown>) {
    setForm((current) => ({
      ...current,
      taskDescription: String(item.title ?? item.taskDescription ?? ""),
      output: String(item.expectedOutput ?? ""),
      note: String(item.description ?? ""),
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily activity"
        title="Log the day with work-plan suggestions"
        description="Today’s work plan, carry-forward items, and overdue follow-ups should reduce typing and keep register formatting intact."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="Today’s plan suggestions" description="Convert or reuse planned work to create your activity register lines.">
          {data?.suggestedPlanItems?.length ? (
            <div className="space-y-3">
              {(data.suggestedPlanItems as Array<Record<string, unknown>>).map((item, index) => (
                <div key={`${item.id ?? index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{String(item.title ?? "Planned task")}</p>
                      <p className="mt-1 text-sm text-slate-500">{String(item.expectedOutput ?? item.description ?? "No detail added")}</p>
                    </div>
                    <Button variant="outline" onClick={() => applySuggestion(item)}>
                      Add from plan
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No plan suggestions right now" description="When a work plan exists for the selected date, suggested activity rows will appear here." />
          )}
        </SectionCard>

        <SectionCard title="Quick add activity" description="The form is aligned with the organization’s daily register structure.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activityDate">Date</Label>
              <Input id="activityDate" type="date" value={form.activityDate} onChange={(event) => setForm({ ...form, activityDate: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityTime">Time</Label>
              <Input id="activityTime" type="time" value={form.activityTime} onChange={(event) => setForm({ ...form, activityTime: event.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="taskDescription">Task&apos;s Description</Label>
              <Textarea id="taskDescription" rows={3} value={form.taskDescription} onChange={(event) => setForm({ ...form, taskDescription: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output">Output</Label>
              <Textarea id="output" rows={3} value={form.output} onChange={(event) => setForm({ ...form, output: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery">Delivery</Label>
              <Textarea id="delivery" rows={3} value={form.delivery} onChange={(event) => setForm({ ...form, delivery: event.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" rows={3} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => {
                  if (value) {
                    setForm({ ...form, status: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="needs_follow_up">Needs follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Follow-up date</Label>
              <Input id="followUpDate" type="date" value={form.followUpDate} onChange={(event) => setForm({ ...form, followUpDate: event.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="followUpNote">Follow-up note</Label>
              <Textarea id="followUpNote" rows={2} value={form.followUpNote} onChange={(event) => setForm({ ...form, followUpNote: event.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={saveActivity}>Save activity line</Button>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Date range register" description="Filter and print clean A4-ready activity lines by date range.">
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
        <DataTable columns={columns} data={(data?.activities as Record<string, unknown>[]) ?? []} />
      </SectionCard>
    </div>
  );
}
