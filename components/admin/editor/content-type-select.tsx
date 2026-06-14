"use client";

import { Layers } from "lucide-react";
import type { ContentType } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contentTypeLabels } from "@/types/content";
import { cn } from "@/lib/utils";

const contentTypes: ContentType[] = [
  "NEWS",
  "ARTICLE",
  "GUIDE",
  "METAPHOR",
  "PSIKO_SANAT",
  "VIDEO",
  "FILE",
];

type ContentTypeSelectProps = {
  value: ContentType;
  onChange: (value: ContentType) => void;
};

export function ContentTypeSelect({ value, onChange }: ContentTypeSelectProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <Layers className="size-4 text-brand-blue" />
          İçerik Türü
        </CardTitle>
      </CardHeader>
      <CardContent>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as ContentType)}
          className={cn(
            "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition-colors",
            "focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20"
          )}
          aria-label="İçerik türü seçin"
        >
          {contentTypes.map((type) => (
            <option key={type} value={type}>
              {contentTypeLabels[type]}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );
}
