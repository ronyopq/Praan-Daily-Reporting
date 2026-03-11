"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { CalendarBoard } from "@/components/calendar-board";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { getMonthKey } from "@/lib/date";

export function CalendarPage() {
  const [month, setMonth] = useState(getMonthKey());
  const { data } = useQuery({
    queryKey: ["calendar", month],
    queryFn: () => api.calendar(`month=${month}`),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Calendar"
        title="Unified work visibility"
        description="Month, week, and list views combine work plan items, daily activities, follow-ups, holidays, and reporting deadlines."
      />
      <SectionCard
        title="Filters"
        description="Admin users can inspect all-user workload while normal users stay scoped to their own data."
      >
        <div className="max-w-xs">
          <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </div>
      </SectionCard>
      <CalendarBoard events={(data?.events as never[]) ?? []} />
    </div>
  );
}
