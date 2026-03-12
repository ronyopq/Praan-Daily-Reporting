"use client";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { useSession } from "@/hooks/use-session";

export function ProfilePage() {
  const { data } = useSession();
  const user = data?.user;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Reporting identity"
        description="These profile fields are reused in reports, approvals, and template-driven print layouts."
      />
      {!user ? (
        <EmptyState title="Profile unavailable" description="Sign in again to refresh your session details." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="User account" description="Authentication and approval state">
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Role</dt>
                <dd className="font-medium capitalize text-slate-900">{user.role.replaceAll("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Approval status</dt>
                <dd className="font-medium capitalize text-slate-900">{user.approvalStatus.replaceAll("_", " ")}</dd>
              </div>
            </dl>
          </SectionCard>
          <SectionCard title="Profile details" description="Displayed in monthly report signature blocks and admin review">
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Full name</dt>
                <dd className="font-medium text-slate-900">{user.profile.fullName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Designation</dt>
                <dd className="font-medium text-slate-900">{user.profile.designation}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Department</dt>
                <dd className="font-medium text-slate-900">{user.profile.departmentName ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Project</dt>
                <dd className="font-medium text-slate-900">{user.profile.projectName ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Supervisor</dt>
                <dd className="font-medium text-slate-900">{user.profile.supervisorName ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Interface language</dt>
                <dd className="font-medium text-slate-900">English</dd>
              </div>
            </dl>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
