"use client";

import { CalendarClock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatScheduledAtForInput } from "@/lib/scheduling/utils";

type SchedulePublishFieldProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  helperText?: string;
};

export function SchedulePublishField({
  value,
  onChange,
  id = "scheduled-at",
  helperText = "Boş bırakılırsa hemen yayınlanır. Gelecek tarih seçilirse içerik o zamana kadar gizli kalır.",
}: SchedulePublishFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        <CalendarClock className="size-4 text-brand-blue" />
        Yayın Zamanı
      </Label>
      <Input
        id={id}
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl"
      />
      <p className="text-xs text-muted-foreground">{helperText}</p>
      {value && (
        <p className="text-xs font-medium text-brand-navy">
          Planlanan: {formatScheduledAtForInput(value).replace("T", " ")}
        </p>
      )}
    </div>
  );
}
