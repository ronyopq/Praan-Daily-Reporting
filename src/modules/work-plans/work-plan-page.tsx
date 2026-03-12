/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, Plus, Save } from "lucide-react";

import { CalendarBoard } from "@/components/calendar-board";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { PRIORITY_OPTIONS, WORK_PLAN_ITEM_STATUSES } from "@/lib/constants";
import { getMonthKey } from "@/lib/date";

type WorkPlanRow = {
  id?: string;
  planDate: string;
  title: string;
  description?: string | null;
  expectedOutput?: string | null;
  category?: string | null;
  priority: string;
  status: string;
  holidayType?: string;
  holidayLabel?: string | null;
  followUpRequired?: boolean;
};

export function WorkPlanPage() {
  const [month, setMonth] = useState(getMonthKey());
  const [rows, setRows] = useState<WorkPlanRow[]>([]);
  const [calendarDays, setCalendarDays] = useState<Array<Record<string, unknown>>>([]);

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["work-plans", month],
    queryFn: () => api.workPlans(`month=${month}`),
  });

  useEffect(() => {
    setRows((data?.items as WorkPlanRow[]) ?? []);
    setCalendarDays((data?.generatedDays as Array<Record<string, unknown>>) ?? []);
  }, [data]);

  function updateRow(index: number, patch: Partial<WorkPlanRow>) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((current) => [
      ...current,
      {
        planDate: calendarDays[0]?.planDate?.toString() ?? `${month}-01`,
        title: "",
        description: "",
        expectedOutput: "",
        category: "",
        priority: "medium",
        status: "planned",
      },
    ]);
  }

  async function generateMonth() {
    try {
      const response = await api.generateWorkPlan({
        month,
        duplicatePreviousMonth: true,
        carryForwardUnfinished: true,
      });
      setCalendarDays((response.generatedDays as Array<Record<string, unknown>>) ?? []);
      setRows((response.suggestedItems as WorkPlanRow[]) ?? []);
      toast.success("Month ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to build the month");
    }
  }

  async function saveDraft() {
    try {
      await api.saveWorkPlan({
        id: data?.workPlan?.id,
        month,
        status: "draft",
        items: rows.filter((row) => row.title.trim()),
      });
      toast.success("Work plan saved");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save work plan");
    }
  }

  const columns: ColumnDef<WorkPlanRow>[] = [
    {
      header: "Date",
      cell: ({ row }) => (
        <Input
          type="date"
          value={row.original.planDate}
          onChange={(event) => updateRow(row.index, { planDate: event.target.value })}
        />
      ),
    },
    {
      header: "Task",
      cell: ({ row }) => (
        <Input
          value={row.original.title}
          placeholder="Write the task name"
          onChange={(event) => updateRow(row.index, { title: event.target.value })}
        />
      ),
    },
    {
      header: "Expected output",
      cell: ({ row }) => (
        <Textarea
          rows={2}
          value={row.original.expectedOutput ?? ""}
          placeholder="What should be finished?"
          onChange={(event) => updateRow(row.index, { expectedOutput: event.target.value })}
        />
      ),
    },
    {
      header: "Priority",
      cell: ({ row }) => (
        <Select
          value={row.original.priority}
          onValueChange={(value) => {
            if (value) {
              updateRow(row.index, { priority: value });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Status",
      cell: ({ row }) => (
        <Select
          value={row.original.status}
          onValueChange={(value) => {
            if (value) {
              updateRow(row.index, { status: value });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORK_PLAN_ITEM_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replaceAll("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  const calendarEvents = [
    ...rows
      .filter((row) => row.title.trim())
      .map((row, index) => ({
        id: row.id ?? `plan-${index}`,
        title: row.title,
        date: row.planDate,
        color: row.holidayType && row.holidayType !== "none" ? "#f3bc58" : "#2f9a98",
      })),
    ...calendarDays
      .filter((day) => day.holidayType && day.holidayType !== "none")
      .map((day, index) => ({
        id: `holiday-${index}`,
        title: String(day.holidayLabel ?? "Holiday"),
        date: String(day.planDate),
        color: "#dc9f2d",
      })),
  ];

  const holidayDays = calendarDays.filter((day) => day.holidayType && day.holidayType !== "none");

  return (
    <div className="d-flex flex-column gap-4 gap-lg-5">
      <PageHeader
        eyebrow="Work plan"
        title="Plan the month in a simple way"
        description="Choose the month, build the calendar, add tasks, then save. Fridays and Bangladesh holidays are added for you."
        actions={
          <>
            <div style={{ width: "11rem" }}>
              <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
            </div>
            <Button variant="secondary" onClick={generateMonth}>
              <CalendarDays className="size-4" />
              Build month
            </Button>
            <Button onClick={saveDraft}>
              <Save className="size-4" />
              Save
            </Button>
          </>
        }
      />

      <section className="shell-card-strong hero-slab p-4 p-lg-5">
        <div className="row g-3">
          {[
            ["1", "Build month", "Create the month with Fridays and holiday labels."],
            ["2", "Add tasks", "Write one or more tasks for each day."],
            ["3", "Save plan", "Keep the draft ready for later review and print."],
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

      <SectionCard
        title="Holiday labels"
        description="Holiday labels help planning. You can still add work on any holiday date."
      >
        {holidayDays.length ? (
          <div className="d-flex flex-wrap gap-2">
            {holidayDays.map((day) => (
              <div key={String(day.planDate)} className="soft-badge">
                <span className="soft-dot" style={{ background: "var(--app-accent)" }} />
                {String(day.planDate)} - {String(day.holidayLabel)}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No holiday labels yet" description="Tap Build month to load Fridays and saved holidays." />
        )}
      </SectionCard>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Task table</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <SectionCard
            title="Task list"
            description="Add tasks row by row. Keep the wording short and clear for easy daily entry later."
            actions={
              <Button variant="outline" onClick={addRow}>
                <Plus className="size-4" />
                Add row
              </Button>
            }
          >
            <DataTable columns={columns} data={rows} />
            {!rows.length && !isFetching ? (
              <div className="mt-5">
                <EmptyState title="No tasks added yet" description="Build the month first, then add your first task row." />
              </div>
            ) : null}
          </SectionCard>
        </TabsContent>

        <TabsContent value="calendar">
          <SectionCard
            title="Calendar view"
            description="Use the calendar to see task coverage, holidays, and busy dates at a glance."
          >
            <CalendarBoard events={calendarEvents} />
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
