"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TagListInputProps = {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
};

export function TagListInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Yazıp Enter'a basın",
  hint,
}: TagListInputProps) {
  function addItem(raw: string) {
    const item = raw.trim();
    if (!item || value.includes(item)) return;
    onChange([...value, item]);
  }

  function removeItem(item: string) {
    onChange(value.filter((entry) => entry !== item));
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        placeholder={placeholder}
        className="rounded-xl"
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          const input = event.currentTarget;
          addItem(input.value);
          input.value = "";
        }}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="gap-1 rounded-full bg-brand-blue/10 px-3 py-1 text-brand-blue"
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="rounded-full p-0.5 hover:bg-brand-blue/10"
                aria-label={`${item} kaldır`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
