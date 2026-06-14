"use client";

import { Eye, Rocket, Save } from "lucide-react";
import type { ContentStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SchedulePublishField } from "@/components/admin/shared/schedule-publish-field";
import { contentStatusLabels } from "@/types/content";
import { cn } from "@/lib/utils";

const statusOptions: ContentStatus[] = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
  "REVISION_REQUESTED",
];

type PublishPanelProps = {
  status: ContentStatus;
  featured: boolean;
  scheduledAt: string;
  saving?: boolean;
  onStatusChange: (status: ContentStatus) => void;
  onFeaturedChange: (featured: boolean) => void;
  onScheduledAtChange: (value: string) => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onPreview: () => void;
};

export function PublishPanel({
  status,
  featured,
  scheduledAt,
  saving = false,
  onStatusChange,
  onFeaturedChange,
  onScheduledAtChange,
  onPublish,
  onSaveDraft,
  onPreview,
}: PublishPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <Rocket className="size-4 text-brand-blue" />
          Yayınla
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Button
            className="w-full rounded-xl bg-brand-blue shadow-md shadow-brand-blue/20 hover:bg-brand-blue/90"
            onClick={onPublish}
            disabled={saving}
          >
            <Rocket className="size-4" />
            {saving ? "Kaydediliyor..." : "Yayınla"}
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={onSaveDraft}
            disabled={saving}
          >
            <Save className="size-4" />
            {saving ? "Kaydediliyor..." : "Taslak Kaydet"}
          </Button>
          <Button
            variant="secondary"
            className="w-full rounded-xl"
            onClick={onPreview}
            disabled={saving}
          >
            <Eye className="size-4" />
            Önizle
          </Button>
        </div>

        <Separator />

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => onFeaturedChange(e.target.checked)}
            className="size-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20"
          />
          <span className="font-medium text-brand-navy">Öne çıkan içerik</span>
        </label>

        <div className="space-y-2">
          <label
            htmlFor="content-status"
            className="text-xs font-medium text-muted-foreground"
          >
            Durum
          </label>
          <select
            id="content-status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as ContentStatus)}
            className={cn(
              "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none",
              "focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20"
            )}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {contentStatusLabels[option]}
              </option>
            ))}
          </select>
        </div>

        <SchedulePublishField
          value={scheduledAt}
          onChange={onScheduledAtChange}
        />
      </CardContent>
    </Card>
  );
}
