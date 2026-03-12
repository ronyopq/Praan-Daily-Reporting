import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("shell-card p-4 p-lg-4 p-xl-5", className)}>
      <div className="d-flex flex-column gap-4 flex-lg-row align-items-lg-center justify-content-lg-between">
        <div>
          <h2 className="mb-1 fs-5 fw-bold text-dark">{title}</h2>
          {description ? <p className="mb-0 section-copy" style={{ maxWidth: "48rem" }}>{description}</p> : null}
        </div>
        {actions ? <div className="d-flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="soft-divider my-4" />
      <div>{children}</div>
    </section>
  );
}
