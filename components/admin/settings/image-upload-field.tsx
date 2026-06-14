"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/upload-client";
import { IMAGE_ACCEPT } from "@/types/upload";
import { cn } from "@/lib/utils";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  previewClassName?: string;
  previewAspect?: "square" | "wide";
  uploadUrl?: string;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  hint = "PNG, JPG veya WEBP · Maks. 5MB",
  previewClassName,
  previewAspect = "wide",
  uploadUrl,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const result = await uploadFile(file, uploadUrl);

    if (!result.success) {
      setMessage({ type: "error", text: result.message });
    } else {
      onChange(result.url);
      setMessage({ type: "success", text: `${label} yüklendi.` });
    }

    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-brand-navy">{label}</p>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
        disabled={uploading}
      />

      {message && (
        <p
          className={cn(
            "rounded-lg px-3 py-2 text-xs",
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          )}
        >
          {message.text}
        </p>
      )}

      {value ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-slate-200",
            previewClassName
          )}
        >
          <div
            className={cn(
              "relative w-full",
              previewAspect === "square" ? "aspect-square max-w-[120px]" : "aspect-[21/9]"
            )}
          >
            <Image
              src={value}
              alt={`${label} önizleme`}
              fill
              className="object-contain p-2"
              sizes="200px"
              unoptimized
            />
          </div>
          <div className="absolute right-2 top-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="rounded-lg"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Değiştir"
              )}
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="destructive"
              className="rounded-lg bg-white/90"
              onClick={() => {
                onChange("");
                setMessage(null);
              }}
              disabled={uploading}
              aria-label={`${label} kaldır`}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
            {uploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Upload className="size-5" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-brand-navy">
              {uploading ? "Yükleniyor..." : `${label} yükle`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        </button>
      )}
    </div>
  );
}
