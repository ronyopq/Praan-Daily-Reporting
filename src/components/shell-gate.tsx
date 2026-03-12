"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";

export function ShellGate({
  area,
  children,
}: {
  area: "workspace" | "admin";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data, isPending } = useSession();
  const user = data?.user;

  useEffect(() => {
    if (isPending) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (area === "admin" && !["admin", "super_admin"].includes(user.role)) {
      router.replace("/workspace");
    }
  }, [area, isPending, router, user]);

  if (isPending && !user) {
    return (
      <div className="container-fluid px-3 px-lg-4 py-4">
        <div className="shell-card p-4 p-lg-5">
          <div className="d-flex align-items-center gap-3">
            <div className="brand-chip">
              <span className="brand-dot" />
              <span className="small fw-semibold text-uppercase text-secondary">Loading workspace</span>
            </div>
          </div>
          <div className="row g-4 mt-1">
            <div className="col-12 col-lg-4">
              <Skeleton className="h-[380px] rounded-[32px]" />
            </div>
            <div className="col-12 col-lg-8">
              <Skeleton className="h-[380px] rounded-[32px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AppShell user={user} area={area}>{children}</AppShell>;
}
