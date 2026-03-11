/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

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
      toast.success("Month structure generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate month");
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
        <Input value={row.original.title} onChange={(event) => updateRow(row.index, { title: event.target.value })} />
      ),
    },
    {
      header: "Expected output",
      cell: ({ row }) => (
        <Textarea
          rows={2}
          value={row.original.expectedOutput ?? ""}
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
        color: row.holidayType && row.holidayType !== "none" ? "#f59e0b" : "#0284c7",
      })),
    ...calendarDays
      .filter((day) => day.holidayType && day.holidayType !== "none")
      .map((day, index) => ({
        id: `holiday-${index}`,
        title: String(day.holidayLabel ?? "Holiday"),
        date: String(day.planDate),
        color: "#f97316",
      })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Monthly planning"
        title="Plan the month before logging the day"
        description="Generate a Bangladesh-aware month structure, edit planned tasks in rows, and keep calendar visibility aligned with upcoming reporting."
        actions={
          <>
            <div className="w-40">
              <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
            </div>
            <Button variant="outline" onClick={generateMonth}>
              Generate month
            </Button>
            <Button onClick={saveDraft}>Save draft</Button>
          </>
        }
      />

      <SectionCard
        title="Holiday structure"
        description="Fridays and Bangladesh holidays are suggested automatically, but task entry stays open on any date."
      >
        {calendarDays.length ? (
          <div className="flex flex-wrap gap-2">
            {calendarDays
              .filter((day) => day.holidayType && day.holidayType !== "none")
              .map((day) => (
                <div key={String(day.planDate)} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  {String(day.planDate)} · {String(day.holidayLabel)}
                </div>
              ))}
          </div>
        ) : (
          <EmptyState title="No generated dates yet" description="Use Generate month to load Friday and holiday defaults." />
        )}
      </SectionCard>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table view</TabsTrigger>
          <TabsTrigger value="calendar">Calendar view</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <SectionCard
            title="Task rows"
            description="Use quick-add rows for multiple tasks per day, then save the plan as draft or submit it from admin review later."
            actions={
              <Button variant="outline" onClick={addRow}>
                Quick add task
              </Button>
            }
          >
            <DataTable columns={columns} data={rows} />
            {!rows.length && !isFetching ? (
              <div className="mt-5">
                <EmptyState title="No tasks added yet" description="Generate a month structure or add your first planned task." />
              </div>
            ) : null}
          </SectionCard>
        </TabsContent>
        <TabsContent value="calendar">
          <CalendarBoard events={calendarEvents} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
