"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { BellRing, CalendarDays, Save } from "lucide-react";

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
      toast.success("Daily entry saved");
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
      toast.error(error instanceof Error ? error.message : "Unable to save daily entry");
    }
  }

  const columns: ColumnDef<Record<string, unknown>>[] = [
    { header: "Time", cell: ({ row }) => <span>{String(row.original.activityTime ?? "-")}</span> },
    { header: "Task", cell: ({ row }) => <span>{String(row.original.taskDescription ?? "-")}</span> },
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
    <div className="d-flex flex-column gap-4 gap-lg-5">
      <PageHeader
        eyebrow="Daily entry"
        title="Write today's work quickly"
        description="Use a plan suggestion if possible. If not, write the work manually and save the line."
      />

      <section className="shell-card-strong hero-slab p-4 p-lg-5">
        <div className="row g-3">
          {[
            ["1", "Pick date and time", "Start with the date and time fields."],
            ["2", "Write short task text", "Keep the task, output, and note easy to read."],
            ["3", "Add follow-up if needed", "Set a date only if the work needs reminder."],
          ].map(([number, title, text]) => (
            <div key={title} className="col-12 col-md-4">
              <div className="action-tile h-100 p-4">
                <div className="d-flex align-items-center gap-3">
                  <span className="sidebar-help-step-number">{number}</span>
                  <div>
                    <p className="mb-1 fw-bold text-dark">{title}</p>
                    <p className="mb-0 section-copy">{text}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <SectionCard
            title="Plan suggestions"
            description="Tap one item to fill the form faster."
          >
            {data?.suggestedPlanItems?.length ? (
              <div className="d-flex flex-column gap-3">
                {(data.suggestedPlanItems as Array<Record<string, unknown>>).map((item, index) => (
                  <div key={`${item.id ?? index}`} className="simple-list-item p-4">
                    <div className="d-flex flex-column gap-3">
                      <div>
                        <p className="mb-1 fw-bold text-dark">{String(item.title ?? "Planned task")}</p>
                        <p className="mb-0 section-copy">
                          {String(item.expectedOutput ?? item.description ?? "No extra detail")}
                        </p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center gap-3">
                        <span className="soft-badge">
                          <CalendarDays className="size-4" />
                          From work plan
                        </span>
                        <Button variant="outline" onClick={() => applySuggestion(item)}>
                          Use this
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No plan suggestion" description="When a work plan exists for this date, suggestions will appear here." />
            )}
          </SectionCard>
        </div>

        <div className="col-12 col-xl-7">
          <SectionCard title="Daily entry form" description="Fill the register fields below and save one line at a time.">
            <div className="row g-4">
              <div className="col-12 col-md-6 d-flex flex-column gap-2">
                <Label htmlFor="activityDate">Date</Label>
                <Input
                  id="activityDate"
                  type="date"
                  value={form.activityDate}
                  onChange={(event) => setForm({ ...form, activityDate: event.target.value })}
                />
              </div>
              <div className="col-12 col-md-6 d-flex flex-column gap-2">
                <Label htmlFor="activityTime">Time</Label>
                <Input
                  id="activityTime"
                  type="time"
                  value={form.activityTime}
                  onChange={(event) => setForm({ ...form, activityTime: event.target.value })}
                />
              </div>

              <div className="col-12 d-flex flex-column gap-2">
                <Label htmlFor="taskDescription">Task</Label>
                <Textarea
                  id="taskDescription"
                  rows={3}
                  placeholder="Write what you did"
                  value={form.taskDescription}
                  onChange={(event) => setForm({ ...form, taskDescription: event.target.value })}
                />
              </div>

              <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                <Label htmlFor="output">Output</Label>
                <Textarea
                  id="output"
                  rows={3}
                  placeholder="Write the result"
                  value={form.output}
                  onChange={(event) => setForm({ ...form, output: event.target.value })}
                />
              </div>

              <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                <Label htmlFor="delivery">Delivery</Label>
                <Textarea
                  id="delivery"
                  rows={3}
                  placeholder="Who received it or where it was sent"
                  value={form.delivery}
                  onChange={(event) => setForm({ ...form, delivery: event.target.value })}
                />
              </div>

              <div className="col-12 d-flex flex-column gap-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  rows={3}
                  placeholder="Short note if needed"
                  value={form.note}
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                />
              </div>

              <div className="col-12 col-lg-6 d-flex flex-column gap-2">
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

              <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                <Label htmlFor="followUpDate">Follow-up date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={form.followUpDate}
                  onChange={(event) => setForm({ ...form, followUpDate: event.target.value })}
                />
              </div>

              <div className="col-12 d-flex flex-column gap-2">
                <Label htmlFor="followUpNote">Follow-up note</Label>
                <Textarea
                  id="followUpNote"
                  rows={2}
                  placeholder="Write what should happen next"
                  value={form.followUpNote}
                  onChange={(event) => setForm({ ...form, followUpNote: event.target.value })}
                />
              </div>

              <div className="col-12 d-flex flex-wrap gap-2">
                <Button onClick={saveActivity}>
                  <Save className="size-4" />
                  Save entry
                </Button>
                <span className="soft-badge">
                  <BellRing className="size-4" />
                  Add a follow-up only when needed
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="Saved register lines" description="Filter by date and review the activity lines ready for print.">
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </div>
          <div className="col-12 col-md-4">
            <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </div>
          <div className="col-12 col-md-4">
            <Button variant="outline" className="w-100" onClick={() => refetch()}>
              Refresh list
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={(data?.activities as Record<string, unknown>[]) ?? []} />
      </SectionCard>
    </div>
  );
}
