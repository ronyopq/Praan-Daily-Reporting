"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  BellRing,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ADMIN_NAVIGATION, APP_NAME, WORKSPACE_NAVIGATION } from "@/lib/constants";
import { api } from "@/lib/api/client";
import { clearSessionSnapshot } from "@/lib/session-cache";
import { cn } from "@/lib/utils";

type AppShellProps = {
  user?: {
    profile?: {
      fullName?: string;
      designation?: string;
      departmentName?: string | null;
    };
    role?: string;
  } | null;
  area: "workspace" | "admin";
  children: React.ReactNode;
};

const mobileIcons = [LayoutDashboard, ClipboardList, BellRing, CalendarDays, UserCircle2];

function NavLinks({
  area,
  pathname,
}: {
  area: "workspace" | "admin";
  pathname: string;
}) {
  const items = area === "admin" ? ADMIN_NAVIGATION : WORKSPACE_NAVIGATION;

  return (
    <nav className="d-flex flex-column gap-2">
      {items.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "/workspace" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("shell-nav-link", isActive && "shell-nav-link-active")}
          >
            <div className="flex-grow-1">
              <span className="shell-nav-label">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ user, area, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const items = area === "admin" ? ADMIN_NAVIGATION : WORKSPACE_NAVIGATION;
  const mobileItems = items.slice(0, 5);
  const canAccessAdmin = ["admin", "super_admin"].includes(user?.role ?? "");

  async function handleLogout() {
    await api.logout();
    clearSessionSnapshot();
    queryClient.setQueryData(["session"], { user: null });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="shell-layout">
      <div className="container-fluid px-0">
        <div className="row g-0">
          <aside className="col-lg-4 col-xl-3 d-none d-lg-block px-3 px-xl-4 py-3 py-xl-4">
            <div className="shell-sidebar shell-card-strong p-4 p-xl-5">
              <div className="d-flex flex-column gap-4">
                <div className="d-flex flex-column gap-3">
                  <div className="brand-chip align-self-start">
                    <span className="brand-dot" />
                    <span className="small fw-semibold text-uppercase text-secondary">PRAAN workflow</span>
                  </div>
                  <div>
                    <h1 className="mb-2 fw-bold text-dark" style={{ fontSize: "2rem", letterSpacing: "-0.05em" }}>{APP_NAME}</h1>
                    <p className="mb-0 section-copy">
                      Fast, mobile-first reporting for work plan execution, follow-up visibility, and monthly compliance.
                    </p>
                  </div>
                </div>

                <NavLinks area={area} pathname={pathname} />

                <div className="shell-card p-4">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white"
                      style={{ width: "3rem", height: "3rem", background: "linear-gradient(135deg, var(--app-primary-strong), var(--app-primary))" }}
                    >
                      <UserCircle2 className="size-5" />
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1 fw-bold text-dark">{user?.profile?.fullName ?? "Signed in user"}</p>
                      <p className="mb-1 small" style={{ color: "var(--app-ink-soft)" }}>
                        {user?.profile?.designation ?? "Team member"}
                      </p>
                      <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                        {user?.profile?.departmentName ?? "PRAAN team"} | {user?.role ?? area}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 d-flex flex-wrap gap-2">
                    {area === "workspace" && canAccessAdmin ? (
                      <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "flex-fill")}>
                        <ShieldCheck className="size-4" />
                        Admin
                      </Link>
                    ) : null}
                    <Button variant="ghost" className="flex-fill" onClick={handleLogout}>
                      <LogOut className="size-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="col-12 col-lg-8 col-xl-9">
            <header className="shell-topbar sticky-top px-3 px-lg-4 py-3">
              <div className="d-flex align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <Sheet>
                    <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "icon" }), "d-lg-none")}>
                      <Menu className="size-4" />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[92vw] max-w-[360px] border-0 bg-transparent p-3 shadow-none">
                      <div className="shell-card-strong h-full p-4">
                        <SheetHeader className="p-0">
                          <div className="brand-chip align-self-start">
                            <span className="brand-dot" />
                            <span className="small fw-semibold text-uppercase text-secondary">PRAAN</span>
                          </div>
                          <SheetTitle className="mt-3 text-start fs-4 fw-bold text-dark">{APP_NAME}</SheetTitle>
                        </SheetHeader>
                        <p className="mt-2 mb-4 section-copy">
                          Mobile-first command center for planning, activity capture, approvals, and reminders.
                        </p>
                        <NavLinks area={area} pathname={pathname} />
                        <div className="shell-card mt-4 p-4">
                          <p className="mb-1 fw-bold text-dark">{user?.profile?.fullName ?? "PRAAN user"}</p>
                          <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                            {user?.profile?.designation ?? "Team member"} | {user?.role ?? area}
                          </p>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <div>
                    <p className="mb-0 small fw-semibold text-uppercase" style={{ letterSpacing: "0.18em", color: "var(--app-primary)" }}>{area}</p>
                    <p className="mb-0 fw-semibold text-dark">{user?.profile?.fullName ?? "PRAAN team workspace"}</p>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {canAccessAdmin && area === "workspace" ? (
                    <Link href="/admin" className={cn(buttonVariants({ variant: "outline" }), "d-none d-sm-inline-flex")}>
                      <ShieldCheck className="size-4" />
                      Admin
                    </Link>
                  ) : null}
                  <Link href="/workspace/daily-activities" className={cn(buttonVariants({ variant: "outline" }), "d-none d-md-inline-flex")}>
                    <Plus className="size-4" />
                    Daily Entry
                  </Link>
                  <Link href="/workspace/profile" className={buttonVariants({ variant: "default" })}>
                    Profile
                  </Link>
                </div>
              </div>
            </header>

            <main className="px-3 px-lg-4 py-4">{children}</main>
          </div>
        </div>
      </div>

      <nav className="shell-mobile-nav d-lg-none">
        <div className="shell-mobile-nav-inner">
          {mobileItems.map((item, index) => {
            const Icon = mobileIcons[index] ?? LayoutDashboard;
            const isActive =
              pathname === item.href || (item.href !== "/workspace" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("shell-mobile-nav-link", isActive && "shell-mobile-nav-link-active")}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Link href="/workspace/daily-activities" className="daily-entry-fab">
        <Plus className="size-4" />
        <span>Daily Entry</span>
      </Link>
    </div>
  );
}
