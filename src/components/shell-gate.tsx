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

  if (isPending) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-10">
        <Skeleton className="h-20 rounded-[28px]" />
        <div className="grid gap-6 lg:grid-cols-4">
          <Skeleton className="h-[600px] rounded-[32px]" />
          <Skeleton className="h-[600px] rounded-[32px] lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <AppShell user={user} area={area}>{children}</AppShell>;
}
