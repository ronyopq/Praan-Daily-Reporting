import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("d-flex flex-column gap-3 gap-lg-4 flex-lg-row align-items-lg-end justify-content-lg-between", className)}>
      <div className="d-flex flex-column gap-3">
        {eyebrow ? <p className="section-kicker mb-0">{eyebrow}</p> : null}
        <div className="d-flex flex-column gap-2">
          <h1 className="section-title mb-0">{title}</h1>
          {description ? (
            <p className="section-copy mb-0" style={{ maxWidth: "50rem" }}>
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="d-flex flex-wrap align-items-center gap-2 gap-lg-3">{actions}</div> : null}
    </div>
  );
}
