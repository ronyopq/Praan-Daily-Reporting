import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  draft: "border-0",
  submitted: "border-0",
  approved: "border-0",
  completed: "border-0",
  ongoing: "border-0",
  pending: "border-0",
  overdue: "border-0",
  returned: "border-0",
  rejected: "border-0",
  suspended: "border-0",
  review: "border-0",
  planned: "border-0",
};

const statusStyles: Record<string, CSSProperties> = {
  draft: { background: "var(--app-panel-soft)", color: "var(--app-ink-soft)" },
  submitted: { background: "var(--app-primary-soft)", color: "var(--app-primary-strong)" },
  approved: { background: "var(--app-success-soft)", color: "var(--app-success)" },
  completed: { background: "var(--app-success-soft)", color: "var(--app-success)" },
  ongoing: { background: "var(--app-accent-soft)", color: "#8c6512" },
  pending: { background: "var(--app-accent-soft)", color: "#8c6512" },
  overdue: { background: "var(--app-danger-soft)", color: "var(--app-danger)" },
  returned: { background: "var(--app-accent-soft)", color: "#8c6512" },
  rejected: { background: "var(--app-danger-soft)", color: "var(--app-danger)" },
  suspended: { background: "var(--app-danger-soft)", color: "var(--app-danger)" },
  review: { background: "var(--app-primary-soft)", color: "var(--app-primary-strong)" },
  planned: { background: "var(--app-primary-soft)", color: "var(--app-primary-strong)" },
};

export function StatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "d-inline-flex align-items-center rounded-pill px-3 py-2 fw-semibold text-capitalize",
        statusClasses[status] ?? "bg-secondary-subtle text-secondary-emphasis",
        className,
      )}
      style={{
        fontSize: "0.72rem",
        letterSpacing: "0.06em",
        ...statusStyles[status],
      }}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
