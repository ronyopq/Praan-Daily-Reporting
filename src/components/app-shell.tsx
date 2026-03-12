"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  CalendarDays,
  ClipboardList,
  FileText,
  Files,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Printer,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
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

const navIconMap: Record<string, LucideIcon> = {
  "/workspace": LayoutDashboard,
  "/workspace/work-plan": ClipboardList,
  "/workspace/daily-activities": FileText,
  "/workspace/follow-ups": BellRing,
  "/workspace/monthly-reports": Files,
  "/workspace/calendar": CalendarDays,
  "/workspace/print": Printer,
  "/workspace/profile": UserCircle2,
  "/admin": LayoutDashboard,
  "/admin/users": Users,
  "/admin/approvals": ShieldCheck,
  "/admin/templates": Files,
  "/admin/holidays": CalendarDays,
  "/admin/settings": Settings,
  "/admin/audit": ClipboardList,
};

const navNoteMap: Record<string, string> = {
  "/workspace": "Start here",
  "/workspace/work-plan": "Plan tasks",
  "/workspace/daily-activities": "Add work",
  "/workspace/follow-ups": "Check reminders",
  "/workspace/monthly-reports": "Build reports",
  "/workspace/calendar": "See dates",
  "/workspace/print": "Print forms",
  "/workspace/profile": "My details",
  "/admin": "Admin home",
  "/admin/users": "Manage people",
  "/admin/approvals": "Approve access",
  "/admin/templates": "Print format",
  "/admin/holidays": "Holiday list",
  "/admin/settings": "App setup",
  "/admin/audit": "Review history",
};

function displayName(fullName?: string) {
  return fullName?.trim().split(/\s+/)[0] ?? "Team";
}

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
        const Icon = navIconMap[item.href] ?? LayoutDashboard;
        const isActive =
          pathname === item.href || (item.href !== `/${area}` && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("shell-nav-link", isActive && "shell-nav-link-active")}
          >
            <span className="shell-nav-icon">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <span className="shell-nav-label">{item.label}</span>
              <span className="shell-nav-note">{navNoteMap[item.href] ?? "Open page"}</span>
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
  const firstName = displayName(user?.profile?.fullName);

  async function handleLogout() {
    await api.logout();
    clearSessionSnapshot();
    queryClient.setQueryData(["session"], { user: null });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  const helpSteps =
    area === "admin"
      ? ["Check new approvals", "Review submissions", "Open templates"]
      : ["Open work plan", "Tap Daily Entry", "Clear follow-ups"];

  return (
    <div className="shell-layout">
      <div className="container-fluid px-0 px-lg-3">
        <div className="app-shell-frame">
          <div className="row g-0">
            <aside className="col-lg-4 col-xl-3 d-none d-lg-block">
              <div className="shell-sidebar shell-sidebar-panel p-3 p-xl-4">
                <div className="d-flex h-100 flex-column gap-4">
                  <div className="shell-card-strong hero-slab p-4">
                    <div className="brand-chip align-self-start">
                      <span className="brand-dot" />
                      <span className="small fw-semibold text-uppercase" style={{ color: "var(--app-ink-soft)" }}>
                        PRAAN
                      </span>
                    </div>
                    <h1
                      className="mt-3 mb-2 fw-bold text-dark"
                      style={{ fontSize: "2rem", letterSpacing: "-0.05em" }}
                    >
                      {APP_NAME}
                    </h1>
                    <p className="mb-0 section-copy">
                      Easy daily reporting with simple steps, reminders, and print-ready forms.
                    </p>
                  </div>

                  <NavLinks area={area} pathname={pathname} />

                  <div className="sidebar-help mt-auto p-4">
                    <p className="mb-3 fw-bold text-dark">Use in 3 easy steps</p>
                    <div className="d-flex flex-column gap-3">
                      {helpSteps.map((step, index) => (
                        <div key={step} className="sidebar-help-step">
                          <span className="sidebar-help-step-number">{index + 1}</span>
                          <span className="fw-semibold" style={{ color: "var(--app-ink)" }}>
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="shell-card p-4">
                    <div className="d-flex align-items-start gap-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: "3rem",
                          height: "3rem",
                          background: "var(--app-primary-soft)",
                          color: "var(--app-primary-strong)",
                        }}
                      >
                        <UserCircle2 className="size-5" />
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-bold text-dark">{user?.profile?.fullName ?? "Signed in user"}</p>
                        <p className="mb-1 small" style={{ color: "var(--app-ink-soft)" }}>
                          {user?.profile?.designation ?? "Team member"}
                        </p>
                        <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                          {user?.profile?.departmentName ?? "PRAAN team"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 d-flex flex-wrap gap-2">
                      <Link href="/workspace/profile" className={cn(buttonVariants({ variant: "outline" }), "flex-fill")}>
                        Profile
                      </Link>
                      <Button variant="ghost" className="flex-fill" onClick={handleLogout}>
                        <LogOut className="size-4" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="col-12 col-lg-8 col-xl-9 shell-main-panel">
              <header className="shell-topbar px-3 px-lg-4 py-3">
                <div className="shell-topbar-card px-3 px-lg-4 py-3">
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <Sheet>
                        <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "icon" }), "d-lg-none")}>
                          <Menu className="size-4" />
                        </SheetTrigger>
                        <SheetContent
                          side="left"
                          className="w-[92vw] max-w-[360px] border-0 bg-transparent p-3 shadow-none"
                        >
                          <div className="shell-card-strong h-full p-4">
                            <SheetHeader className="p-0">
                              <div className="brand-chip align-self-start">
                                <span className="brand-dot" />
                                <span
                                  className="small fw-semibold text-uppercase"
                                  style={{ color: "var(--app-ink-soft)" }}
                                >
                                  PRAAN
                                </span>
                              </div>
                              <SheetTitle className="mt-3 text-start fs-4 fw-bold text-dark">
                                {APP_NAME}
                              </SheetTitle>
                            </SheetHeader>
                            <p className="mt-2 mb-4 section-copy">
                              Open one page at a time. The yellow button always adds a daily entry.
                            </p>
                            <NavLinks area={area} pathname={pathname} />
                            <div className="shell-card mt-4 p-4">
                              <p className="mb-1 fw-bold text-dark">{user?.profile?.fullName ?? "PRAAN user"}</p>
                              <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                                {user?.profile?.designation ?? "Team member"}
                              </p>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>

                      <div>
                        <p
                          className="mb-1 small fw-semibold text-uppercase"
                          style={{ letterSpacing: "0.14em", color: "var(--app-primary)" }}
                        >
                          {area === "admin" ? "Admin area" : "My workspace"}
                        </p>
                        <p className="mb-0 fw-bold text-dark" style={{ fontSize: "1.15rem", letterSpacing: "-0.03em" }}>
                          Hello, {firstName}
                        </p>
                        <p className="mb-0 small" style={{ color: "var(--app-ink-soft)" }}>
                          Choose one clear action and keep the day moving.
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {canAccessAdmin && area === "workspace" ? (
                        <Link
                          href="/admin"
                          className={cn(buttonVariants({ variant: "secondary" }), "d-none d-md-inline-flex")}
                        >
                          <ShieldCheck className="size-4" />
                          Admin
                        </Link>
                      ) : null}
                      <Link
                        href="/workspace/daily-activities"
                        className={cn(buttonVariants(), "d-none d-sm-inline-flex")}
                      >
                        <Plus className="size-4" />
                        Daily Entry
                      </Link>
                      <Link href="/workspace/profile" className={buttonVariants({ variant: "outline" })}>
                        Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </header>

              <main className="px-3 px-lg-4 pb-4 pb-lg-5">
                <div className="d-flex flex-column gap-4 gap-lg-5">{children}</div>
              </main>
            </div>
          </div>
        </div>
      </div>

      <nav className="shell-mobile-nav d-lg-none">
        <div className="shell-mobile-nav-inner">
          {mobileItems.map((item) => {
            const Icon = navIconMap[item.href] ?? LayoutDashboard;
            const isActive =
              pathname === item.href || (item.href !== `/${area}` && pathname.startsWith(item.href));

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
