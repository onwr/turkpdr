"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ContentTitleInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ContentTitleInput({ value, onChange }: ContentTitleInputProps) {
  return (
    <Card>
      <CardContent className="pt-0">
        <label htmlFor="content-title" className="sr-only">
          İçerik başlığı
        </label>
        <Input
          id="content-title"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="İçerik başlığını girin..."
          className="h-12 border-0 bg-transparent px-0 text-xl font-semibold shadow-none placeholder:font-normal focus-visible:ring-0 sm:text-2xl"
        />
      </CardContent>
    </Card>
  );
}
