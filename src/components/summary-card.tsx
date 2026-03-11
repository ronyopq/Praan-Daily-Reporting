import { cn } from "@/lib/utils";

type SummaryCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
  className?: string;
};

const toneMap = {
  default: "from-white to-slate-50 text-slate-950",
  success: "from-emerald-50 to-white text-emerald-950",
  warning: "from-amber-50 to-white text-amber-950",
  danger: "from-rose-50 to-white text-rose-950",
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
        "rounded-3xl border border-slate-200 bg-gradient-to-br p-5 shadow-sm shadow-slate-200/60",
        toneMap[tone],
        className,
      )}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}
