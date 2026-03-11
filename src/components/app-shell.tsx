"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ShieldCheck, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ADMIN_NAVIGATION, APP_NAME, WORKSPACE_NAVIGATION } from "@/lib/constants";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type AppShellProps = {
  user?: {
    profile?: {
      fullName?: string;
      designation?: string;
    };
    role?: string;
  } | null;
  area: "workspace" | "admin";
  children: React.ReactNode;
};

function NavLinks({
  area,
  pathname,
}: {
  area: "workspace" | "admin";
  pathname: string;
}) {
  const items = area === "admin" ? ADMIN_NAVIGATION : WORKSPACE_NAVIGATION;

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "/workspace" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-2xl px-4 py-3 text-sm font-medium transition",
              isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            <span className="block">{item.labelEn}</span>
            <span className="block text-xs opacity-75">{item.labelBn}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ user, area, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await api.logout();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_40%,_#f8fafc_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="hidden rounded-[32px] border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/70 backdrop-blur lg:flex lg:flex-col lg:gap-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">PRAAN</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">{APP_NAME}</h1>
            <p className="text-sm text-slate-500">Multi-user planning, activity, and reporting workspace</p>
          </div>
          <NavLinks area={area} pathname={pathname} />
          <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <UserCircle2 className="size-10 text-slate-400" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.profile?.fullName ?? "Signed in user"}</p>
                <p className="text-xs text-slate-500">
                  {user?.profile?.designation ?? "Team member"} | {user?.role ?? area}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {area === "workspace" ? (
                <Link
                  href="/admin"
                  className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                >
                  <ShieldCheck className="size-4" />
                  Admin
                </Link>
              ) : null}
              <Button variant="ghost" className="flex-1" onClick={handleLogout}>
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>
        <div className="flex min-h-screen flex-col gap-4">
          <header className="sticky top-0 z-20 flex items-center justify-between rounded-[28px] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm shadow-slate-200/70 backdrop-blur lg:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{area}</p>
              <p className="text-sm font-medium text-slate-700">
                {user?.profile?.fullName ?? "PRAAN team workspace"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger className={cn(buttonVariants({ variant: "outline", size: "icon" }), "lg:hidden")}>
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px]">
                  <div className="mt-8 space-y-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-sky-700">PRAAN</p>
                      <h2 className="text-2xl font-semibold text-slate-950">{APP_NAME}</h2>
                    </div>
                    <NavLinks area={area} pathname={pathname} />
                  </div>
                </SheetContent>
              </Sheet>
              <Link href="/workspace/profile" className={buttonVariants({ variant: "outline" })}>
                Profile
              </Link>
            </div>
          </header>
          <main className="pb-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
