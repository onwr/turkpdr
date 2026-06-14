"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImageIcon, Images, Loader2, Upload, X } from "lucide-react";

import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadFile } from "@/lib/upload-client";
import { IMAGE_ACCEPT } from "@/types/upload";
import { cn } from "@/lib/utils";

type CoverImageUploadProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  uploadUrl?: string;
};

export function CoverImageUpload({
  value,
  onChange,
  uploadUrl = "/api/admin/upload",
}: CoverImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
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
      setMessage({ type: "success", text: "Kapak görseli yüklendi." });
    }

    setUploading(false);
    e.target.value = "";
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="size-4 text-brand-blue" />
          Kapak Görseli
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => void handleFileChange(e)}
          aria-label="Kapak görseli yükle"
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
            role="status"
          >
            {message.text}
          </p>
        )}

        {value ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-200">
            <div className="relative aspect-21/9 w-full">
              <Image
                src={value}
                alt="Kapak görseli önizleme"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                unoptimized
              />
            </div>
            <div className="absolute right-2 top-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="rounded-lg"
                onClick={() => setPickerOpen(true)}
                disabled={uploading}
              >
                <Images className="size-4" />
                Kütüphane
              </Button>
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
                  onChange(null);
                  setMessage(null);
                }}
                disabled={uploading}
                aria-label="Kapak görselini kaldır"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                {uploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Upload className="size-5" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-brand-navy">
                  {uploading ? "Yükleniyor..." : "Yeni yükle"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PNG, JPG veya WEBP · Maks. 5MB
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 transition-colors hover:border-brand-blue/40 hover:bg-brand-blue/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Images className="size-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-brand-navy">
                  Kütüphaneden seç
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Daha önce yüklenen görseller
                </p>
              </div>
            </button>
          </div>
        )}

        <MediaPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          mediaType="image"
          uploadUrl={uploadUrl}
          title="Kapak Görseli Seç"
          onSelect={(media) => {
            onChange(media.url);
            setMessage({ type: "success", text: "Kapak görseli seçildi." });
            setPickerOpen(false);
          }}
        />
      </CardContent>
    </Card>
  );
}
