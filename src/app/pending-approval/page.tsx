import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="auth-shell d-flex align-items-center px-3 py-4 py-lg-5">
      <div className="container-lg">
        <div className="shell-card-strong hero-slab mx-auto p-4 p-lg-5 text-center" style={{ maxWidth: "42rem" }}>
          <p className="section-kicker mb-2">Approval pending</p>
          <h1 className="section-title mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Your account request is waiting for review
          </h1>
          <p className="section-copy mb-0">
            After approval, you can sign in and use the work plan, daily entry, follow-ups, and monthly report pages.
            If you need urgent access, contact your PRAAN admin.
          </p>
          <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
            <Link
              href="/login"
              className="d-inline-flex align-items-center justify-content-center gap-2 rounded-4 border-0 px-4 py-3 text-sm fw-semibold text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--app-primary-strong), var(--app-primary))" }}
            >
              Return to sign in
            </Link>
            <Link
              href="/"
              className="d-inline-flex align-items-center justify-content-center gap-2 rounded-4 border bg-white px-4 py-3 text-sm fw-semibold text-slate-700 shadow-sm"
              style={{ borderColor: "var(--app-line)" }}
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
