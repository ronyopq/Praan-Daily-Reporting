"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ClipboardList, Globe2, UserPlus2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGE_OPTIONS } from "@/lib/constants";
import { api } from "@/lib/api/client";
import { registrationSchema, type RegistrationInput } from "@/lib/validation";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      noteToAdmin: "",
      profile: {
        fullName: "",
        designation: "",
        phone: "",
        preferredLanguage: "bn",
      },
    },
  });

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: RegistrationInput) {
    try {
      await api.register(values);
      toast.success("Registration submitted");
      router.push("/pending-approval");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to register");
    }
  }

  return (
    <div className="auth-shell px-3 py-4 py-lg-5">
      <div className="container-xl">
        <div className="row g-4">
          <div className="col-12 col-xl-4">
            <div className="shell-card-strong h-100 p-4 p-lg-5">
              <div className="brand-chip mb-4">
                <span className="brand-dot" />
                <span className="small fw-semibold text-uppercase text-secondary">Registration</span>
              </div>
              <h1 className="mb-3 fw-bold text-dark" style={{ fontSize: "clamp(2.1rem, 5vw, 3.4rem)", letterSpacing: "-0.05em" }}>
                Request PRAAN access.
              </h1>
              <p className="section-copy mb-4">
                Accounts stay pending until admin approval. The profile details you enter here flow into plans, activities, and reports.
              </p>
              <div className="d-flex flex-column gap-3">
                {[
                  { icon: UserPlus2, text: "Create your reporting identity" },
                  { icon: ClipboardList, text: "Use the same profile in monthly plans" },
                  { icon: Globe2, text: "Choose Bangla or English preference" },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.text} className="shell-card p-3 d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "2.5rem", height: "2.5rem", background: "var(--app-primary-soft)", color: "var(--app-primary)" }}>
                        <Icon className="size-4" />
                      </div>
                      <span className="fw-semibold text-dark">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-8">
            <div className="shell-card-strong p-4 p-lg-5">
              <div className="d-flex flex-column gap-2">
                <p className="section-kicker mb-0">Registration</p>
                <h2 className="mb-0 section-title" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>Request PRAAN Daily Reporting access</h2>
                <p className="section-copy mb-0">
                  Your account stays pending until an admin approves it. Fill in the profile details used in work plans and reports.
                </p>
              </div>

              <form className="row g-4 mt-1" onSubmit={handleSubmit(onSubmit)}>
                <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                  <Label htmlFor="fullName" className="fw-semibold text-dark">Full name</Label>
                  <Input id="fullName" {...register("profile.fullName")} />
                  {errors.profile?.fullName ? <p className="mb-0 small text-danger">{errors.profile.fullName.message}</p> : null}
                </div>

                <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                  <Label htmlFor="designation" className="fw-semibold text-dark">Designation</Label>
                  <Input id="designation" {...register("profile.designation")} />
                  {errors.profile?.designation ? <p className="mb-0 small text-danger">{errors.profile.designation.message}</p> : null}
                </div>

                <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                  <Label htmlFor="email" className="fw-semibold text-dark">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email ? <p className="mb-0 small text-danger">{errors.email.message}</p> : null}
                </div>

                <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                  <Label htmlFor="phone" className="fw-semibold text-dark">Phone</Label>
                  <Input id="phone" {...register("profile.phone")} />
                </div>

                <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                  <Label htmlFor="password" className="fw-semibold text-dark">Password</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password ? <p className="mb-0 small text-danger">{errors.password.message}</p> : null}
                </div>

                <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                  <Label htmlFor="confirmPassword" className="fw-semibold text-dark">Confirm password</Label>
                  <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                  {errors.confirmPassword ? <p className="mb-0 small text-danger">{errors.confirmPassword.message}</p> : null}
                </div>

                <div className="col-12 col-lg-6 d-flex flex-column gap-2">
                  <Label className="fw-semibold text-dark">Preferred language</Label>
                  <Select defaultValue="bn" onValueChange={(value) => setValue("profile.preferredLanguage", value as "bn" | "en")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option === "bn" ? "বাংলা" : "English"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-12 d-flex flex-column gap-2">
                  <Label htmlFor="noteToAdmin" className="fw-semibold text-dark">Note to admin</Label>
                  <Textarea id="noteToAdmin" rows={4} {...register("noteToAdmin")} />
                </div>

                <div className="col-12 d-flex flex-wrap align-items-center gap-3">
                  <button className={cn(buttonVariants({ size: "lg" }))} disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Submitting..." : "Submit registration"}
                    <ArrowRight className="size-4" />
                  </button>
                  <Link href="/login" className={buttonVariants({ variant: "outline" })}>
                    Back to sign in
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
