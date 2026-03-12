export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-5 border border-dashed px-4 py-5 py-lg-6 text-center" style={{ borderColor: "rgba(140, 162, 196, 0.4)", background: "rgba(241, 246, 255, 0.62)" }}>
      <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: "3.25rem", height: "3.25rem", background: "rgba(15, 118, 110, 0.1)", color: "var(--app-primary)" }}>
        <span className="fw-bold">PR</span>
      </div>
      <h3 className="mb-2 fs-6 fw-bold text-dark">{title}</h3>
      <p className="mb-0 section-copy">{description}</p>
    </div>
  );
}
