"use client";

import { useEffect, useState } from "react";
import { FolderOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
};

import type { ContentType } from "@prisma/client";

type CategorySelectProps = {
  value: string;
  onChange: (value: string) => void;
  categoryType?: ContentType;
  categories?: Category[];
};

export function CategorySelect({
  value,
  onChange,
  categoryType,
  categories: presetCategories,
}: CategorySelectProps) {
  const [fetchedCategories, setFetchedCategories] = useState<Category[]>([]);
  const [fetchLoading, setFetchLoading] = useState(!presetCategories);

  const categories = presetCategories ?? fetchedCategories;
  const loading = presetCategories ? false : fetchLoading;

  useEffect(() => {
    if (presetCategories) return;

    void (async () => {
      setFetchLoading(true);
      try {
        const params = new URLSearchParams();
        if (categoryType) params.set("type", categoryType);
        const res = await fetch(`/api/admin/categories?${params.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setFetchedCategories(data.categories);
        }
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [categoryType, presetCategories]);

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="size-4 text-brand-blue" />
          Kategori
        </CardTitle>
      </CardHeader>
      <CardContent>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className={cn(
            "flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition-colors",
            "focus:border-brand-blue focus:bg-white focus:ring-2 focus:ring-brand-blue/20",
            "disabled:cursor-not-allowed disabled:opacity-60",
            !value && "text-muted-foreground"
          )}
          aria-label="Kategori seçin"
        >
          <option value="">
            {loading ? "Kategoriler yükleniyor..." : "Kategori seçin..."}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );
}
