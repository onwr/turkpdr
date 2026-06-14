"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadFile } from "@/lib/upload-client";
import { PDF_ACCEPT, formatFileSize } from "@/types/upload";
import { cn } from "@/lib/utils";

type FileUploadFieldProps = {
  fileUrl: string;
  fileType: string;
  fileSize: string;
  onChange: (data: {
    fileUrl: string;
    fileType: string;
    fileSize: string;
  }) => void;
};

export function FileUploadField({
  fileUrl,
  fileType,
  fileSize,
  onChange,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    const result = await uploadFile(file);

    if (!result.success) {
      setError(result.message);
    } else {
      const ext = result.fileName.split(".").pop()?.toUpperCase() ?? "PDF";
      onChange({
        fileUrl: result.url,
        fileType: ext,
        fileSize: result.size.toString(),
      });
      setSuccess("Dosya başarıyla yüklendi.");
    }

    setUploading(false);
    e.target.value = "";
  };

  const clearFile = () => {
    onChange({ fileUrl: "", fileType: "", fileSize: "" });
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <Label>PDF Dosyası *</Label>
      <input
        ref={inputRef}
        type="file"
        accept={PDF_ACCEPT}
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
        disabled={uploading}
      />

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {success}
        </p>
      )}

      {fileUrl ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-navy">
              {fileUrl.split("/").pop()}
            </p>
            <p className="text-xs text-muted-foreground">
              {fileType || "PDF"}
              {fileSize ? ` · ${formatFileSize(parseInt(fileSize, 10))}` : ""}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              Değiştir
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={clearFile}
              disabled={uploading}
              aria-label="Dosyayı kaldır"
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
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-8 transition-colors",
            "hover:border-brand-blue/40 hover:bg-brand-blue/5 disabled:cursor-not-allowed disabled:opacity-60"
          )}
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin text-brand-blue" />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <Upload className="size-5" />
            </div>
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-brand-navy">
              {uploading ? "Yükleniyor..." : "PDF dosyası yükle"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF · Maks. 20MB
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
