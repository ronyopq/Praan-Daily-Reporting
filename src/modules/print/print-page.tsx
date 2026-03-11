"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api/client";
import { getMonthKey, todayInDhaka } from "@/lib/date";

export function PrintPage() {
  const [type, setType] = useState("daily");
  const [month, setMonth] = useState(getMonthKey());
  const [fromDate, setFromDate] = useState(todayInDhaka());
  const [toDate, setToDate] = useState(todayInDhaka());

  const dailyQuery = useQuery({
    queryKey: ["print-daily", fromDate, toDate],
    queryFn: () => api.dailyActivities(`fromDate=${fromDate}&toDate=${toDate}`),
    enabled: type === "daily",
  });

  const planQuery = useQuery({
    queryKey: ["print-work-plan", month],
    queryFn: () => api.workPlans(`month=${month}`),
    enabled: type === "work-plan",
  });

  const reportQuery = useQuery({
    queryKey: ["print-report", month],
    queryFn: () => api.monthlyReports(`month=${month}`),
    enabled: type === "report",
  });

  const dailyData = dailyQuery.data;
  const workPlanData = planQuery.data;
  const reportData = reportQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Print center"
        title="A4-ready output preview"
        description="Preview daily activity register, monthly work plan, or monthly report before printing in the browser."
        actions={<Button onClick={() => window.print()}>Print current preview</Button>}
      />

      <SectionCard title="Print settings" description="Choose the document type and reporting period.">
        <div className="grid gap-4 md:grid-cols-4">
          <Select
            value={type}
            onValueChange={(value) => {
              if (value) {
                setType(value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Activity Register</SelectItem>
              <SelectItem value="work-plan">Monthly Work Plan</SelectItem>
              <SelectItem value="report">Monthly Report</SelectItem>
            </SelectContent>
          </Select>
          <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          <Input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <Input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </div>
      </SectionCard>

      <div className="print-sheet surface p-8">
        <div className="border-b border-slate-200 pb-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-700">PRAAN</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {type === "daily"
              ? "Daily Activity Register"
              : type === "work-plan"
                ? "Monthly Work Plan"
                : "Monthly Report"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {type === "daily" ? `${fromDate} to ${toDate}` : month}
          </p>
        </div>

        <div className="mt-6">
          {type === "daily" ? (
            (dailyData?.activities as Array<Record<string, unknown>>)?.length ? (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3">Task&apos;s Description</th>
                    <th className="py-2 pr-3">Output</th>
                    <th className="py-2 pr-3">Note</th>
                    <th className="py-2">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {(dailyData?.activities as Array<Record<string, unknown>>).map((item, index) => (
                    <tr key={`${item.id ?? index}`} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-3">{String(item.activityTime ?? "-")}</td>
                      <td className="py-3 pr-3">{String(item.taskDescription ?? "-")}</td>
                      <td className="py-3 pr-3">{String(item.output ?? "-")}</td>
                      <td className="py-3 pr-3">{String(item.note ?? "-")}</td>
                      <td className="py-3">{String(item.delivery ?? "-")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No activity lines to print" description="Choose a date range with saved daily activities." />
            )
          ) : null}

          {type === "work-plan" ? (
            (workPlanData?.items as Array<Record<string, unknown>>)?.length ? (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Task</th>
                    <th className="py-2 pr-3">Expected Output</th>
                    <th className="py-2 pr-3">Priority</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(workPlanData?.items as Array<Record<string, unknown>>).map((item, index) => (
                    <tr key={`${item.id ?? index}`} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-3">{String(item.planDate ?? "-")}</td>
                      <td className="py-3 pr-3">{String(item.title ?? "-")}</td>
                      <td className="py-3 pr-3">{String(item.expectedOutput ?? "-")}</td>
                      <td className="py-3 pr-3">{String(item.priority ?? "-")}</td>
                      <td className="py-3">{String(item.status ?? "-")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState title="No work plan items to print" description="Save a work plan for the selected month first." />
            )
          ) : null}

          {type === "report" ? (
            reportData?.report ? (
              <div className="space-y-6 text-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-slate-500">Project&apos;s Name</p>
                    <p className="font-medium text-slate-900">{String(reportData.report.projectName ?? "-")}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Designation</p>
                    <p className="font-medium text-slate-900">{String(reportData.report.designationSnapshot ?? "-")}</p>
                  </div>
                </div>
                {[
                  { title: "Completed Task", items: reportData.report.completedItems },
                  { title: "Ongoing Tasks", items: reportData.report.ongoingItems },
                  { title: "Tasks for Next Month", items: reportData.report.nextMonthItems },
                ].map(({ title, items }) => (
                  <div key={title}>
                    <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                    <div className="mt-3 space-y-2">
                      {(items as Array<Record<string, unknown>>)?.map((item, index) => (
                        <div key={`${title}-${index}`} className="rounded-2xl border border-slate-200 p-3">
                          <p className="font-medium text-slate-900">{String(item.taskName ?? "-")}</p>
                          <p className="mt-1 text-slate-500">{String(item.output ?? item.remarks ?? "-")}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No monthly report available" description="Generate or save a report for this month first." />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
