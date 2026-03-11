import { cn } from "@/lib/utils";

const statusClasses: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  submitted: "bg-sky-100 text-sky-700",
  approved: "bg-emerald-100 text-emerald-700",
  completed: "bg-emerald-100 text-emerald-700",
  ongoing: "bg-amber-100 text-amber-700",
  pending: "bg-amber-100 text-amber-700",
  overdue: "bg-rose-100 text-rose-700",
  returned: "bg-orange-100 text-orange-700",
  rejected: "bg-rose-100 text-rose-700",
  suspended: "bg-rose-100 text-rose-700",
  review: "bg-indigo-100 text-indigo-700",
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        statusClasses[status] ?? "bg-slate-100 text-slate-700",
        className,
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
