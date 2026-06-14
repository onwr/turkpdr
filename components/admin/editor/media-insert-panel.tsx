"use client";

import type { Editor } from "@tiptap/react";
import { useRef, useState } from "react";
import { FileText, ImageIcon, Link2, Loader2, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { executeSlashCommand } from "@/lib/tiptap/slash-commands";
import { uploadFile } from "@/lib/upload-client";
import { IMAGE_ACCEPT, PDF_ACCEPT, VIDEO_ACCEPT } from "@/types/upload";
import { cn } from "@/lib/utils";

type MediaInsertPanelProps = {
  editor: Editor | null;
};

export function MediaInsertPanel({ editor }: MediaInsertPanelProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<
    "image" | "video" | "pdf" | null
  >(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleUpload = async (
    file: File,
    type: "image" | "video" | "pdf"
  ) => {
    if (!editor) return;

    setUploading(type);
    setMessage(null);

    const result = await uploadFile(file);

    if (!result.success) {
      setMessage({ type: "error", text: result.message });
      setUploading(null);
      return;
    }

    const fileName = file.name.replace(/\.[^.]+$/, "");

    if (type === "image") {
      editor.chain().focus().setImage({ src: result.url }).run();
    } else if (type === "video") {
      executeSlashCommand(editor, "video", {
        url: result.url,
        title: fileName || "Video",
      });
    } else {
      executeSlashCommand(editor, "pdf", {
        url: result.url,
        title: fileName || "PDF Doküman",
      });
    }

    setMessage({ type: "success", text: "Dosya başarıyla yüklendi." });
    setUploading(null);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "pdf"
  ) => {
    const file = e.target.files?.[0];
    if (file) void handleUpload(file, type);
    e.target.value = "";
  };

  const insertLink = () => {
    if (!editor) return;
    const url = window.prompt("Bağlantı URL'si girin:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const isUploading = uploading !== null;

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Medya Ekle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={imageInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={(e) => handleFileChange(e, "image")}
          disabled={isUploading}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept={VIDEO_ACCEPT}
          className="hidden"
          onChange={(e) => handleFileChange(e, "video")}
          disabled={isUploading}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept={PDF_ACCEPT}
          className="hidden"
          onChange={(e) => handleFileChange(e, "pdf")}
          disabled={isUploading}
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

        <Button
          variant="outline"
          className="w-full justify-start rounded-xl"
          onClick={() => imageInputRef.current?.click()}
          disabled={!editor || isUploading}
        >
          {uploading === "image" ? (
            <Loader2 className="size-4 animate-spin text-brand-blue" />
          ) : (
            <ImageIcon className="size-4 text-brand-blue" />
          )}
          Görsel Yükle
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start rounded-xl"
          onClick={() => videoInputRef.current?.click()}
          disabled={!editor || isUploading}
        >
          {uploading === "video" ? (
            <Loader2 className="size-4 animate-spin text-brand-blue" />
          ) : (
            <Video className="size-4 text-brand-blue" />
          )}
          Video Yükle
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start rounded-xl"
          onClick={() => pdfInputRef.current?.click()}
          disabled={!editor || isUploading}
        >
          {uploading === "pdf" ? (
            <Loader2 className="size-4 animate-spin text-brand-blue" />
          ) : (
            <FileText className="size-4 text-brand-blue" />
          )}
          PDF Yükle
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start rounded-xl"
          onClick={insertLink}
          disabled={!editor || isUploading}
        >
          <Link2 className="size-4 text-brand-blue" />
          Bağlantı Ekle
        </Button>

        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3">
          <p className="mb-2 text-xs text-muted-foreground">
            Hızlı görsel URL
          </p>
          <Input
            placeholder="https://..."
            className="rounded-lg text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter" && editor) {
                const url = (e.target as HTMLInputElement).value;
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
            disabled={!editor || isUploading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
