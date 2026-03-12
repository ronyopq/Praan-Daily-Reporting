"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, BellRing, CheckCircle2, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import { writeSessionSnapshot } from "@/lib/session-cache";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (session.data?.user) {
      router.replace("/workspace");
    }
  }, [router, session.data?.user]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: LoginInput) {
    try {
      const response = await api.login(values);
      writeSessionSnapshot(response.user);
      queryClient.setQueryData(["session"], response);
      toast.success("Welcome back");
      router.push("/workspace");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    }
  }

  return (
    <div className="auth-shell d-flex align-items-center px-3 py-4 py-lg-5">
      <div className="container-xxl">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-lg-5">
            <div className="rounded-5 p-4 p-lg-5 text-white" style={{ background: "linear-gradient(180deg, #0d3b66 0%, #0f766e 100%)", boxShadow: "0 24px 42px rgba(13, 59, 102, 0.22)" }}>
              <div className="brand-chip border-0 bg-white/10">
                <span className="brand-dot" />
                <span className="small fw-semibold text-uppercase text-white">PRAAN workspace</span>
              </div>
              <h1 className="mt-4 mb-3 fw-bold" style={{ fontSize: "clamp(2.3rem, 6vw, 4rem)", letterSpacing: "-0.05em" }}>
                Daily reporting made practical.
              </h1>
              <p className="mb-4" style={{ color: "rgba(255,255,255,0.84)", lineHeight: 1.8 }}>
                Open today&apos;s plan, capture activity fast on mobile, keep follow-ups visible, and turn the month into a clean report.
              </p>
              <div className="d-flex flex-column gap-3">
                {[
                  { icon: Smartphone, text: "Mobile menu first navigation" },
                  { icon: BellRing, text: "Follow-up reminders that stay visible" },
                  { icon: CheckCircle2, text: "Approval-safe reporting workflow" },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.text} className="panel-note d-flex align-items-center gap-3 p-3">
                      <Icon className="size-4" />
                      <span className="fw-semibold">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-7 col-xl-6">
            <div className="shell-card-strong p-4 p-lg-5">
              <div className="d-flex flex-column gap-2">
                <p className="section-kicker mb-0">Sign in</p>
                <h2 className="mb-0 section-title" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>Access your reporting workspace</h2>
                <p className="section-copy mb-0">Approved users only. Pending accounts remain locked until admin review.</p>
              </div>

              <form className="mt-4 d-flex flex-column gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="d-flex flex-column gap-2">
                  <Label htmlFor="email" className="fw-semibold text-dark">Email</Label>
                  <Input id="email" type="email" placeholder="name@praan.org" {...register("email")} />
                  {errors.email ? <p className="mb-0 small text-danger">{errors.email.message}</p> : null}
                </div>

                <div className="d-flex flex-column gap-2">
                  <Label htmlFor="password" className="fw-semibold text-dark">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" {...register("password")} />
                  {errors.password ? <p className="mb-0 small text-danger">{errors.password.message}</p> : null}
                </div>

                <button className={cn(buttonVariants({ size: "lg" }), "w-100")} disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                  <ArrowRight className="size-4" />
                </button>
              </form>

              <div className="mt-4 d-flex flex-column gap-3 flex-sm-row align-items-sm-center justify-content-sm-between">
                <Link href="/register" className="fw-semibold" style={{ color: "var(--app-primary)" }}>
                  Need an account? Register
                </Link>
                <Link href="/pending-approval" style={{ color: "var(--app-ink-soft)" }}>
                  Pending approval help
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
