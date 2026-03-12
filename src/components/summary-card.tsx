import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
};

const toneMap = {
  default: "metric-card",
  success: "metric-card metric-card-success",
  warning: "metric-card metric-card-warning",
  danger: "metric-card metric-card-danger",
} as const;

export function SummaryCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "p-4 p-xl-4",
        toneMap[tone],
        className,
      )}
    >
      <p className="mb-0 text-uppercase fw-semibold" style={{ fontSize: "0.72rem", letterSpacing: "0.14em", color: "var(--app-ink-soft)" }}>{label}</p>
      <div className="mt-3 d-flex align-items-end justify-content-between gap-3">
        <p className="mb-0 fw-bold" style={{ fontSize: "2rem", lineHeight: 1, letterSpacing: "-0.05em", color: "var(--app-ink)" }}>{value}</p>
        {hint ? <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>{hint}</p> : null}
      </div>
    </div>
  );
}
