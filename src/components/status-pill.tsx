import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  draft: "bg-secondary-subtle text-secondary-emphasis",
  submitted: "bg-info-subtle text-info-emphasis",
  approved: "bg-success-subtle text-success-emphasis",
  completed: "bg-success-subtle text-success-emphasis",
  ongoing: "bg-warning-subtle text-warning-emphasis",
  pending: "bg-warning-subtle text-warning-emphasis",
  overdue: "bg-danger-subtle text-danger-emphasis",
  returned: "bg-warning-subtle text-warning-emphasis",
  rejected: "bg-danger-subtle text-danger-emphasis",
  suspended: "bg-danger-subtle text-danger-emphasis",
  review: "bg-primary-subtle text-primary-emphasis",
  planned: "bg-primary-subtle text-primary-emphasis",
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
      style={{ fontSize: "0.72rem", letterSpacing: "0.06em" }}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
