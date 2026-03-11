import { addDays, eachDayOfInterval, endOfMonth, format, isFriday, parseISO, startOfMonth } from "date-fns";

import { DHAKA_TIMEZONE } from "@/lib/constants";

export function getMonthKey(date = new Date()) {
  return format(date, "yyyy-MM");
}

export function getMonthBounds(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  return { start, end };
}

export function listMonthDates(monthKey: string) {
  const { start, end } = getMonthBounds(monthKey);
  return eachDayOfInterval({ start, end }).map((date) => format(date, "yyyy-MM-dd"));
}

export function formatMonthLabel(monthKey: string) {
  const { start } = getMonthBounds(monthKey);
  return format(start, "MMMM yyyy");
}

export function formatShortDate(date: string) {
  return format(parseISO(date), "dd MMM yyyy");
}

export function formatLongDate(date: string) {
  return format(parseISO(date), "EEEE, dd MMMM yyyy");
}

export function isDhakaFriday(date: string) {
  return isFriday(parseISO(date));
}

export function todayInDhaka() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DHAKA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function currentDhakaTime() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DHAKA_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = parts.find((part) => part.type === "hour")?.value ?? "09";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour}:${minute}`;
}

export function addDaysIso(date: string, days: number) {
  return format(addDays(parseISO(date), days), "yyyy-MM-dd");
}

export function createMonthPlanningSkeleton(
  monthKey: string,
  holidayMap: Map<string, { label: string; type: string }>,
) {
  return listMonthDates(monthKey).map((date) => {
    const holiday = holidayMap.get(date);

    if (holiday) {
      return {
        planDate: date,
        holidayType: holiday.type,
        holidayLabel: holiday.label,
      };
    }

    if (isDhakaFriday(date)) {
      return {
        planDate: date,
        holidayType: "friday",
        holidayLabel: "Weekly Holiday",
      };
    }

    return {
      planDate: date,
      holidayType: "none",
      holidayLabel: "",
    };
  });
}
