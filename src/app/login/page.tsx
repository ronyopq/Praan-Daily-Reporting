"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api/client";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";

export default function LoginPage() {
  const router = useRouter();
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
      await api.login(values);
      toast.success("Welcome back");
      router.push("/workspace");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign in");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_45%,_#fff7ed_100%)] px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden rounded-[36px] bg-[linear-gradient(180deg,_#0f172a_0%,_#134e4a_100%)] p-8 text-white shadow-xl shadow-slate-300/60 lg:block">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-200">PRAAN workspace</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Daily reporting made operational</h1>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Enter activity from today&apos;s plan, see overdue follow-ups immediately, and generate clean monthly
            reports without hunting through spreadsheets.
          </p>
        </div>
        <div className="surface p-8 lg:p-10">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Sign in</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Access your reporting workspace</h2>
            <p className="text-sm text-slate-500">Approved users only. Pending accounts stay locked until admin review.</p>
          </div>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@praan.org" {...register("email")} />
              {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" {...register("password")} />
              {errors.password ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
            </div>
            <button className={cn(buttonVariants(), "w-full bg-slate-950 text-white")} disabled={isSubmitting} type="submit">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="mt-6 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/register" className="font-medium text-sky-700">
              Need an account? Register
            </Link>
            <Link href="/pending-approval" className="font-medium text-slate-500">
              Pending approval help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
