"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { getMonthKey } from "@/lib/date";

const CalendarBoard = dynamic(
  () => import("@/components/calendar-board").then((module) => module.CalendarBoard),
  {
    ssr: false,
    loading: () => (
      <div className="shell-card p-4 p-lg-5">
        <p className="mb-0 section-copy">Loading calendar view...</p>
      </div>
    ),
  },
);

export function CalendarPage() {
  const [month, setMonth] = useState(getMonthKey());
  const { data } = useQuery({
    queryKey: ["calendar", month],
    queryFn: () => api.calendar(`month=${month}`),
  });

  return (
    <div className="d-flex flex-column gap-4 gap-lg-5">
      <PageHeader
        eyebrow="Calendar"
        title="Unified work visibility"
        description="Month, week, and list views combine work plan items, daily activities, follow-ups, holidays, and reporting deadlines."
      />
      <SectionCard
        title="Filters"
        description="Admin users can inspect all-user workload while normal users stay scoped to their own data."
      >
        <div style={{ maxWidth: "18rem" }}>
          <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </div>
      </SectionCard>
      <CalendarBoard events={(data?.events as never[]) ?? []} />
    </div>
  );
}
