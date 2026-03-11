"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";

export function FollowUpsPage() {
  const [form, setForm] = useState({
    sourceType: "manual",
    title: "",
    note: "",
    dueDate: "",
    priority: "medium",
    status: "pending",
  });

  const { data, refetch } = useQuery({
    queryKey: ["follow-ups"],
    queryFn: () => api.followUps(),
  });

  async function saveFollowUp() {
    try {
      await api.saveFollowUp(form);
      toast.success("Follow-up created");
      setForm({
        sourceType: "manual",
        title: "",
        note: "",
        dueDate: "",
        priority: "medium",
        status: "pending",
      });
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save follow-up");
    }
  }

  async function completeFollowUp(id: string) {
    try {
      await api.completeFollowUp(id);
      toast.success("Follow-up completed");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to complete follow-up");
    }
  }

  async function snoozeFollowUp(id: string) {
    try {
      await api.snoozeFollowUp(id, { snoozedUntil: form.dueDate || undefined });
      toast.success("Follow-up snoozed");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to snooze follow-up");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Follow-up system"
        title="Keep reminders visible until resolved"
        description="Due and overdue follow-ups stay prominent across the dashboard, calendar, and activity flow."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="Quick add reminder" description="Create follow-up tasks manually or from activity and work plan records.">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Source type</Label>
              <Select
                value={form.sourceType}
                onValueChange={(value) => {
                  if (value) {
                    setForm({ ...form, sourceType: value });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="work_plan">Work plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" rows={4} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due date</Label>
                <Input id="dueDate" type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => {
                    if (value) {
                      setForm({ ...form, priority: value });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={saveFollowUp}>Create follow-up</Button>
          </div>
        </SectionCard>

        <SectionCard title="Reminder queue" description="Snooze, complete, or reschedule reminders without letting them disappear from sight.">
          {data?.items?.length ? (
            <div className="space-y-3">
              {(data.items as Array<Record<string, unknown>>).map((item, index) => (
                <div key={`${item.id ?? index}`} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-950">{String(item.title ?? "Follow-up")}</p>
                        <StatusPill status={String(item.status ?? "pending")} />
                      </div>
                      <p className="text-sm text-slate-500">{String(item.note ?? "No note added")}</p>
                      <p className="text-xs text-slate-400">Due on {String(item.dueDate ?? "-")}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => snoozeFollowUp(String(item.id))}>
                        Snooze
                      </Button>
                      <Button onClick={() => completeFollowUp(String(item.id))}>Complete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No active follow-ups" description="Create reminders from daily activity or quick add to keep pending actions visible." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
