import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8fafc_0%,_#e0f2fe_100%)] px-4">
      <div className="max-w-2xl surface p-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Approval pending</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Your registration is waiting for admin review</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Once approved, you can sign in and access your work plan, daily activity register, follow-up reminders,
          and monthly report tools. If you need urgent access, contact your PRAAN admin.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-slate-950 px-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Return to sign in
          </Link>
          <Link
            href="/"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
