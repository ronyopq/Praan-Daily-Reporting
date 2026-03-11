"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
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
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f0fdfa_0%,_#f8fafc_45%,_#fefce8_100%)] px-4 py-10">
      <div className="mx-auto max-w-4xl surface p-8 lg:p-10">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Registration</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Request PRAAN Daily Reporting access</h1>
          <p className="text-sm text-slate-500">
            Your account stays pending until an admin approves it. Fill in the profile details used in work plans and reports.
          </p>
        </div>

        <form className="mt-8 grid gap-5 lg:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...register("profile.fullName")} />
            {errors.profile?.fullName ? <p className="text-xs text-rose-600">{errors.profile.fullName.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" {...register("profile.designation")} />
            {errors.profile?.designation ? <p className="text-xs text-rose-600">{errors.profile.designation.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("profile.phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword ? <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>Preferred language</Label>
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
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="noteToAdmin">Note to admin</Label>
            <Textarea id="noteToAdmin" rows={4} {...register("noteToAdmin")} />
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
            <button className={cn(buttonVariants(), "bg-slate-950 text-white")} disabled={isSubmitting} type="submit">
              {isSubmitting ? "Submitting..." : "Submit registration"}
            </button>
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
