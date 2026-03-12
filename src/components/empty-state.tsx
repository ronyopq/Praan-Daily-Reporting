export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div
      className="rounded-5 px-4 py-5 py-lg-6 text-center"
      style={{
        border: "1px dashed rgba(108, 124, 118, 0.34)",
        background: "linear-gradient(180deg, rgba(255,245,222,0.55), rgba(255,255,255,0.96))",
      }}
    >
      <div
        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
        style={{ width: "3.4rem", height: "3.4rem", background: "var(--app-primary-soft)", color: "var(--app-primary-strong)" }}
      >
        <span className="fw-bold">Go</span>
      </div>
      <h3 className="mb-2 fs-6 fw-bold text-dark">{title}</h3>
      <p className="mb-0 section-copy">{description}</p>
    </div>
  );
}
