import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
  icon?: ReactNode;
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
  icon,
  className,
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        "p-4 pt-5 p-xl-4",
        toneMap[tone],
        className,
      )}
    >
      <div className="d-flex align-items-start justify-content-between gap-3">
        <p
          className="mb-0 fw-semibold"
          style={{ fontSize: "0.82rem", letterSpacing: "0.02em", color: "var(--app-ink-soft)" }}
        >
          {label}
        </p>
        {icon ? (
          <span
            className="d-inline-flex align-items-center justify-content-center rounded-4"
            style={{ width: "2.35rem", height: "2.35rem", background: "var(--app-panel-soft)", color: "var(--app-primary-strong)" }}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-3 d-flex align-items-end justify-content-between gap-3">
        <p
          className="mb-0 fw-bold"
          style={{ fontSize: "2.15rem", lineHeight: 1, letterSpacing: "-0.06em", color: "var(--app-ink)" }}
        >
          {value}
        </p>
        {hint ? (
          <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
