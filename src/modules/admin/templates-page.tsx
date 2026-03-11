/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api/client";

export function AdminTemplatesPage() {
  const [selected, setSelected] = useState("daily_activity_register");
  const [form, setForm] = useState({
    type: "daily_activity_register",
    name: "Daily Activity Register",
    organizationName: "PRAAN",
    printHeaderText: "",
    printFooterText: "",
    submittedByLabel: "Submitted by",
    approvedByLabel: "Approved by",
    footerText: "",
    showNotesArea: true,
    settings: {
      visibleFields: [],
      sectionOrder: [],
      labelMap: {},
      printSettings: {},
      signatureBlocks: [],
    },
  });

  const { data, refetch } = useQuery({
    queryKey: ["admin-templates"],
    queryFn: api.adminTemplates,
  });

  useEffect(() => {
    const template = (data?.items as Array<Record<string, unknown>> | undefined)?.find(
      (item) => item.type === selected,
    );

    if (!template) {
      return;
    }

    setForm({
      type: String(template.type),
      name: String(template.name ?? ""),
      organizationName: String(template.organizationName ?? ""),
      printHeaderText: String(template.printHeaderText ?? ""),
      printFooterText: String(template.printFooterText ?? ""),
      submittedByLabel: String(template.submittedByLabel ?? "Submitted by"),
      approvedByLabel: String(template.approvedByLabel ?? "Approved by"),
      footerText: String(template.footerText ?? ""),
      showNotesArea: Boolean(template.showNotesArea),
      settings: (template.settings as typeof form.settings) ?? form.settings,
    });
  }, [data?.items, selected]);

  async function saveTemplate() {
    try {
      await api.adminSaveTemplate(form);
      toast.success("Template saved");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save template");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Template management"
        title="Control print and export formats safely"
        description="Show or hide fields, rename labels, and manage signature blocks without exposing a risky freeform builder."
      />
      <SectionCard title="Template editor" description="Controlled configuration layer for organizational print formats.">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="space-y-2">
            <Label>Template type</Label>
            <Select
              value={selected}
              onValueChange={(value) => {
                if (value) {
                  setSelected(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily_activity_register">Daily activity register</SelectItem>
                <SelectItem value="monthly_work_plan">Monthly work plan</SelectItem>
                <SelectItem value="monthly_report">Monthly report</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Template name</Label>
            <Input id="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, type: selected })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="organizationName">Organization name</Label>
            <Input id="organizationName" value={form.organizationName} onChange={(event) => setForm({ ...form, organizationName: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="submittedByLabel">Submitted by label</Label>
            <Input id="submittedByLabel" value={form.submittedByLabel} onChange={(event) => setForm({ ...form, submittedByLabel: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="approvedByLabel">Approved by label</Label>
            <Input id="approvedByLabel" value={form.approvedByLabel} onChange={(event) => setForm({ ...form, approvedByLabel: event.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="printHeaderText">Header text</Label>
            <Input id="printHeaderText" value={form.printHeaderText} onChange={(event) => setForm({ ...form, printHeaderText: event.target.value })} />
          </div>
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="printFooterText">Footer text</Label>
            <Textarea id="printFooterText" rows={3} value={form.printFooterText} onChange={(event) => setForm({ ...form, printFooterText: event.target.value })} />
          </div>
          <div className="space-y-2 xl:col-span-2">
            <Label htmlFor="footerText">Organization footer</Label>
            <Textarea id="footerText" rows={3} value={form.footerText} onChange={(event) => setForm({ ...form, footerText: event.target.value })} />
          </div>
          <div className="xl:col-span-2">
            <Button onClick={saveTemplate}>Save template version</Button>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
