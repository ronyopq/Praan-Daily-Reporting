"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
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
  Search,
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
  "/workspace": "Home",
  "/workspace/work-plan": "Month plan",
  "/workspace/daily-activities": "Add work",
  "/workspace/follow-ups": "Reminders",
  "/workspace/monthly-reports": "Month report",
  "/workspace/calendar": "Dates",
  "/workspace/print": "Print",
  "/workspace/profile": "My account",
  "/admin": "Overview",
  "/admin/users": "People",
  "/admin/approvals": "Requests",
  "/admin/templates": "Formats",
  "/admin/holidays": "Holiday list",
  "/admin/settings": "Config",
  "/admin/audit": "History",
};

function displayName(fullName?: string) {
  return fullName?.trim().split(/\s+/)[0] ?? "Team";
}

function getInitials(fullName?: string) {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) {
    return "PR";
  }

  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
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
  const initials = getInitials(user?.profile?.fullName);

  async function handleLogout() {
    await api.logout();
    clearSessionSnapshot();
    queryClient.setQueryData(["session"], { user: null });
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  const utilityLinks =
    area === "admin"
      ? [{ href: "/admin/settings", label: "Settings", icon: Settings }]
      : [{ href: "/workspace/profile", label: "Profile", icon: Settings }];

  return (
    <div className="shell-layout">
      <div className="container-fluid px-0 px-lg-3">
        <div className="app-shell-frame">
          <div className="row g-0">
            <aside className="col-lg-4 col-xl-3 d-none d-lg-block">
              <div className="shell-sidebar shell-sidebar-panel px-3 py-4 px-xl-4">
                <div className="d-flex h-100 flex-column">
                  <div className="shell-card p-4">
                    <div className="brand-chip align-self-start">
                      <span className="brand-dot" />
                      <span className="small fw-semibold text-uppercase" style={{ color: "var(--app-ink-soft)" }}>
                        PRAAN
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="mb-1 fw-bold text-dark" style={{ fontSize: "1.15rem", letterSpacing: "-0.03em" }}>
                        {APP_NAME}
                      </p>
                      <p className="mb-0 small" style={{ color: "var(--app-ink-soft)", lineHeight: 1.8 }}>
                        Clear menus, short labels, and fast daily reporting.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <NavLinks area={area} pathname={pathname} />
                  </div>

                  <div className="mt-auto d-flex flex-column gap-2 pt-4">
                    {utilityLinks.map((item) => {
                      const Icon = item.icon;

                      return (
                        <Link key={item.href} href={item.href} className="shell-nav-link">
                          <span className="shell-nav-icon">
                            <Icon className="size-4" />
                          </span>
                          <span className="shell-nav-label">{item.label}</span>
                        </Link>
                      );
                    })}

                    <button
                      type="button"
                      className="shell-nav-link border-0 bg-transparent text-start"
                      onClick={handleLogout}
                    >
                      <span className="shell-nav-icon">
                        <LogOut className="size-4" />
                      </span>
                      <span className="shell-nav-label">Logout</span>
                    </button>

                    <div className="d-flex align-items-center gap-3 rounded-4 px-3 py-3 mt-2" style={{ background: "var(--app-panel-soft)" }}>
                      <div className="shell-avatar">{initials}</div>
                      <div className="min-w-0">
                        <p className="mb-1 fw-bold text-dark text-truncate">{user?.profile?.fullName ?? "PRAAN user"}</p>
                        <p className="mb-0 small text-truncate" style={{ color: "var(--app-ink-soft)" }}>
                          {user?.profile?.designation ?? "Team member"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div className="col-12 col-lg-8 col-xl-9 shell-main-panel">
              <header className="shell-topbar px-3 px-lg-4 py-3">
                <div className="shell-topbar-card px-3 px-lg-4 py-3">
                  <div className="d-flex align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
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
                                <span className="small fw-semibold text-uppercase" style={{ color: "var(--app-ink-soft)" }}>
                                  PRAAN
                                </span>
                              </div>
                              <SheetTitle className="mt-3 text-start fs-4 fw-bold text-dark">
                                {APP_NAME}
                              </SheetTitle>
                            </SheetHeader>
                            <p className="mt-2 mb-4 section-copy">
                              Open one page at a time. The plus button always opens Daily Entry.
                            </p>
                            <NavLinks area={area} pathname={pathname} />
                            <div className="d-flex flex-column gap-2 mt-4">
                              <Link href="/workspace/profile" className={buttonVariants({ variant: "outline" })}>
                                Profile
                              </Link>
                              <Button variant="ghost" onClick={handleLogout}>
                                <LogOut className="size-4" />
                                Logout
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>

                      <div className="d-none d-md-flex flex-grow-1">
                        <div className="shell-search-display flex-grow-1">
                          <Search className="size-4" />
                          <span>Search page, task, reminder, or report</span>
                        </div>
                      </div>

                      <div className="d-md-none">
                        <p className="mb-0 small fw-semibold text-uppercase" style={{ letterSpacing: "0.12em", color: "var(--app-primary)" }}>
                          {area === "admin" ? "Admin" : "Workspace"}
                        </p>
                        <p className="mb-0 fw-bold text-dark">{firstName}</p>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {canAccessAdmin && area === "workspace" ? (
                        <Link href="/admin" className={cn(buttonVariants({ variant: "secondary" }), "d-none d-lg-inline-flex")}>
                          <ShieldCheck className="size-4" />
                          Admin
                        </Link>
                      ) : null}

                      <Link
                        href="/workspace/daily-activities"
                        className={cn(buttonVariants({ size: "sm" }), "d-none d-md-inline-flex")}
                      >
                        <Plus className="size-4" />
                        Daily Entry
                      </Link>

                      <button type="button" className={buttonVariants({ variant: "outline", size: "icon-sm" })}>
                        <Bell className="size-4" />
                      </button>

                      <Link href="/workspace/profile" className="shell-user-chip d-none d-sm-inline-flex">
                        <span className="shell-avatar">{initials}</span>
                        <span className="d-flex flex-column text-start">
                          <span className="fw-bold text-dark" style={{ fontSize: "0.88rem", lineHeight: 1.1 }}>
                            {user?.profile?.fullName ?? "PRAAN user"}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: "var(--app-ink-soft)", lineHeight: 1.1 }}>
                            {user?.profile?.designation ?? "Team member"}
                          </span>
                        </span>
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
