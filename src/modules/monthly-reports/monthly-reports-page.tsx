/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";
import { getMonthKey } from "@/lib/date";

type ReportItem = {
  taskName: string;
  taskDate?: string | null;
  output?: string | null;
  remarks?: string | null;
};

export function MonthlyReportsPage() {
  const [month, setMonth] = useState(getMonthKey());
  const [report, setReport] = useState({
    month,
    projectName: "",
    reportName: "",
    designationSnapshot: "",
    lessonsLearned: "",
    comments: "",
    completedItems: [] as ReportItem[],
    ongoingItems: [] as ReportItem[],
    nextMonthItems: [] as ReportItem[],
  });

  const { data, refetch } = useQuery({
    queryKey: ["monthly-reports", month],
    queryFn: () => api.monthlyReports(`month=${month}`),
  });

  useEffect(() => {
    if (!data?.report) {
      return;
    }

    setReport({
      month,
      projectName: String(data.report.projectName ?? ""),
      reportName: String(data.report.reportName ?? ""),
      designationSnapshot: String(data.report.designationSnapshot ?? ""),
      lessonsLearned: String(data.report.lessonsLearned ?? ""),
      comments: String(data.report.comments ?? ""),
      completedItems: (data.report.completedItems as ReportItem[]) ?? [],
      ongoingItems: (data.report.ongoingItems as ReportItem[]) ?? [],
      nextMonthItems: (data.report.nextMonthItems as ReportItem[]) ?? [],
    });
  }, [data, month]);

  async function generateDraft() {
    try {
      const response = await api.generateMonthlyReport({ month });
      setReport((current) => ({
        ...current,
        completedItems: (response.completedItems as ReportItem[]) ?? [],
        ongoingItems: (response.ongoingItems as ReportItem[]) ?? [],
        nextMonthItems: (response.nextMonthItems as ReportItem[]) ?? [],
      }));
      toast.success("Draft generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate draft");
    }
  }

  async function saveReport() {
    try {
      await api.saveMonthlyReport({
        id: data?.report?.id,
        status: "draft",
        ...report,
      });
      toast.success("Monthly report saved");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save report");
    }
  }

  function addItem(key: "completedItems" | "ongoingItems" | "nextMonthItems") {
    setReport((current) => ({
      ...current,
      [key]: [...current[key], { taskName: "", output: "", remarks: "" }],
    }));
  }

  function updateItem(
    key: "completedItems" | "ongoingItems" | "nextMonthItems",
    index: number,
    field: keyof ReportItem,
    value: string,
  ) {
    setReport((current) => ({
      ...current,
      [key]: current[key].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Monthly reporting"
        title="Draft structured monthly reports from daily work"
        description="Completed activity, open follow-up, and next-month plans are turned into editable report sections before submission."
        actions={
          <>
            <div className="w-40">
              <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
            </div>
            <Button variant="outline" onClick={generateDraft}>
              Generate draft
            </Button>
            <Button onClick={saveReport}>Save draft</Button>
          </>
        }
      />

      <SectionCard title="Report metadata" description="This information fills the report header and signature blocks.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project&apos;s name</Label>
            <Input id="projectName" value={report.projectName} onChange={(event) => setReport({ ...report, projectName: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reportName">Name</Label>
            <Input id="reportName" value={report.reportName} onChange={(event) => setReport({ ...report, reportName: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designationSnapshot">Designation</Label>
            <Input id="designationSnapshot" value={report.designationSnapshot} onChange={(event) => setReport({ ...report, designationSnapshot: event.target.value })} />
          </div>
        </div>
        {data?.report?.status ? (
          <div className="mt-4">
            <StatusPill status={String(data.report.status)} />
          </div>
        ) : null}
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-3">
        {[
          ["completedItems", "Completed Task", "Completed daily activity and final outputs drive this section."],
          ["ongoingItems", "Ongoing Tasks", "Open follow-ups and unfinished items surface here."],
          ["nextMonthItems", "Tasks for Next Month", "Next month work plan suggestions can be refined here."],
        ].map(([key, title, description]) => (
          <SectionCard
            key={key}
            title={title}
            description={description}
            actions={<Button variant="outline" onClick={() => addItem(key as never)}>Add row</Button>}
          >
            {(report[key as keyof typeof report] as ReportItem[]).length ? (
              <div className="space-y-3">
                {(report[key as keyof typeof report] as ReportItem[]).map((item, index) => (
                  <div key={`${key}-${index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Task name"
                        value={item.taskName}
                        onChange={(event) => updateItem(key as never, index, "taskName", event.target.value)}
                      />
                      <Input
                        type="date"
                        value={item.taskDate ?? ""}
                        onChange={(event) => updateItem(key as never, index, "taskDate", event.target.value)}
                      />
                      <Textarea
                        rows={2}
                        placeholder="Output"
                        value={item.output ?? ""}
                        onChange={(event) => updateItem(key as never, index, "output", event.target.value)}
                      />
                      <Textarea
                        rows={2}
                        placeholder="Remarks"
                        value={item.remarks ?? ""}
                        onChange={(event) => updateItem(key as never, index, "remarks", event.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title={`No ${title.toLowerCase()} yet`} description="Use Generate draft or add rows manually." />
            )}
          </SectionCard>
        ))}
      </div>

      <SectionCard title="Reflection and comments" description="Lessons learned and remarks are preserved in the print-ready report format.">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lessonsLearned">Lesson learned</Label>
            <Textarea id="lessonsLearned" rows={6} value={report.lessonsLearned} onChange={(event) => setReport({ ...report, lessonsLearned: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" rows={6} value={report.comments} onChange={(event) => setReport({ ...report, comments: event.target.value })} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
