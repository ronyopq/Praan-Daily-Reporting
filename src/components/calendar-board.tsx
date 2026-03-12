"use client";

import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";

export type CalendarEventItem = {
  id: string;
  title: string;
  date?: string;
  start?: string;
  end?: string;
  color?: string;
  extendedProps?: Record<string, unknown>;
};

export function CalendarBoard({
  events,
}: {
  events: CalendarEventItem[];
}) {
  return (
    <div
      className="rounded-[28px] border bg-white p-4"
      style={{ borderColor: "var(--app-line)", boxShadow: "var(--app-shadow-soft)" }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listWeek",
        }}
        height="auto"
        events={events}
      />
    </div>
  );
}
