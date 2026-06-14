"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Slash,
} from "lucide-react";

import { MediaInsertMenu, MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PdfEmbed, VideoEmbed } from "@/lib/tiptap/extensions";
import {
  executeSlashCommand,
  filterSlashCommands,
  getSlashQuery,
  removeSlashTrigger,
  slashCommands,
} from "@/lib/tiptap/slash-commands";
import type { SlashCommandItem } from "@/types/editor";
import { IMAGE_ACCEPT, PDF_ACCEPT, VIDEO_ACCEPT } from "@/types/upload";
import { uploadFile } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

type TiptapEditorProps = {
  onEditorReady: (editor: Editor) => void;
  initialContent?: string;
  uploadUrl?: string;
};

function ToolbarButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "rounded-lg",
        active && "bg-brand-blue/10 text-brand-blue"
      )}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
    >
      {children}
    </Button>
  );
}

function SlashCommandMenu({
  items,
  selectedIndex,
  onSelect,
  position,
}: {
  items: SlashCommandItem[];
  selectedIndex: number;
  onSelect: (item: SlashCommandItem) => void;
  position: { top: number; left: number };
}) {
  if (items.length === 0) return null;

  return (
    <div
      className="absolute z-50 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/80"
      style={{ top: position.top, left: position.left }}
      role="listbox"
      aria-label="Slash komutları"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
        <Slash className="size-3.5 text-brand-blue" />
        <span className="text-xs font-medium text-muted-foreground">
          Komutlar
        </span>
      </div>
      <ul className="max-h-64 overflow-y-auto py-1">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                index === selectedIndex
                  ? "bg-brand-blue/10 text-brand-navy"
                  : "hover:bg-slate-50"
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(item);
              }}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-brand-blue">
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {item.description}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TiptapEditor({
  onEditorReady,
  initialContent,
  uploadUrl = "/api/admin/upload",
}: TiptapEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [uploading, setUploading] = useState(false);
  const [mediaMenuType, setMediaMenuType] = useState<
    "image" | "video" | "pdf" | null
  >(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const filteredCommands = filterSlashCommands(slashQuery);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-blue underline underline-offset-2",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "my-4 max-w-full rounded-xl",
        },
      }),
      VideoEmbed,
      PdfEmbed,
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[320px] px-4 py-4 focus:outline-none sm:px-6 sm:py-5 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-brand-navy [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-brand-navy [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-brand-navy [&_blockquote]:border-l-4 [&_blockquote]:border-brand-blue [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5",
      },
    },
    content:
      initialContent ??
      "<p>İçeriğinizi yazmaya başlayın veya <strong>/</strong> ile komut menüsünü açın...</p>",
    onCreate: ({ editor: ed }) => {
      onEditorReady(ed);
    },
    onUpdate: ({ editor: ed }) => {
      const query = getSlashQuery(ed);
      if (query !== null) {
        setSlashQuery(query);
        setSlashOpen(true);
        setSelectedIndex(0);
        updateMenuPosition(ed);
      } else {
        setSlashOpen(false);
        setSlashQuery("");
      }
    },
  });

  const updateMenuPosition = useCallback((ed: Editor) => {
    const { from } = ed.state.selection;
    const coords = ed.view.coordsAtPos(from);
    const container = editorRef.current?.getBoundingClientRect();

    if (container) {
      setMenuPosition({
        top: coords.bottom - container.top + 8,
        left: Math.min(coords.left - container.left, container.width - 300),
      });
    }
  }, []);

  const handleSlashSelect = useCallback(
    (item: SlashCommandItem) => {
      if (!editor) return;

      removeSlashTrigger(editor);

      if (item.id === "image") {
        setMediaMenuType("image");
        setSlashOpen(false);
        setSlashQuery("");
        return;
      }

      if (item.id === "video") {
        setMediaMenuType("video");
        setSlashOpen(false);
        setSlashQuery("");
        return;
      }

      if (item.id === "pdf") {
        setMediaMenuType("pdf");
        setSlashOpen(false);
        setSlashQuery("");
        return;
      }

      executeSlashCommand(editor, item.id);
      setSlashOpen(false);
      setSlashQuery("");
    },
    [editor]
  );

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!slashOpen) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) handleSlashSelect(command);
      } else if (event.key === "Escape") {
        setSlashOpen(false);
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("keydown", handleKeyDown);
    return () => dom.removeEventListener("keydown", handleKeyDown);
  }, [editor, slashOpen, filteredCommands, selectedIndex, handleSlashSelect]);

  const insertUploadedMedia = useCallback(
    (
      ed: Editor,
      type: "image" | "video" | "pdf",
      url: string,
      fileName: string
    ) => {
      if (type === "image") {
        ed.chain().focus().setImage({ src: url }).run();
      } else if (type === "video") {
        executeSlashCommand(ed, "video", {
          url,
          title: fileName || "Video",
        });
      } else {
        executeSlashCommand(ed, "pdf", {
          url,
          title: fileName || "PDF Doküman",
        });
      }
    },
    []
  );

  const handleMediaUpload = useCallback(
    async (file: File, type: "image" | "video" | "pdf") => {
      if (!editor) return;

      setUploading(true);
      setMessage(null);

      const result = await uploadFile(file, uploadUrl);

      if (!result.success) {
        setMessage({ type: "error", text: result.message });
        setUploading(false);
        return;
      }

      const fileName = file.name.replace(/\.[^.]+$/, "");
      insertUploadedMedia(editor, type, result.url, fileName);
      setMessage({ type: "success", text: "Dosya başarıyla yüklendi." });
      setUploading(false);
    },
    [editor, insertUploadedMedia, uploadUrl]
  );

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video" | "pdf"
  ) => {
    const file = e.target.files?.[0];
    if (file) void handleMediaUpload(file, type);
    e.target.value = "";
  };

  const addLink = () => {
    if (!editor) return;
    const url = window.prompt("Bağlantı URL'si:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const openUploadForType = (type: "image" | "video" | "pdf") => {
    if (type === "image") imageInputRef.current?.click();
    if (type === "video") videoInputRef.current?.click();
    if (type === "pdf") pdfInputRef.current?.click();
  };

  const insertFromLibrary = useCallback(
    (url: string, fileName: string) => {
      if (!editor || !mediaMenuType) return;
      insertUploadedMedia(editor, mediaMenuType, url, fileName);
      setMessage({ type: "success", text: "Medya eklendi." });
      setMediaMenuType(null);
      setPickerOpen(false);
    },
    [editor, mediaMenuType, insertUploadedMedia]
  );

  const addImage = () => {
    setMediaMenuType("image");
  };

  if (!editor) return null;

  return (
    <Card className="overflow-hidden">
      <input
        ref={imageInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => handleFileInputChange(e, "image")}
        disabled={uploading}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept={VIDEO_ACCEPT}
        className="hidden"
        onChange={(e) => handleFileInputChange(e, "video")}
        disabled={uploading}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept={PDF_ACCEPT}
        className="hidden"
        onChange={(e) => handleFileInputChange(e, "pdf")}
        disabled={uploading}
      />

      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50/80 px-2 py-2 sm:px-3">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="Kalın"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="İtalik"
        >
          <Italic className="size-4" />
        </ToolbarButton>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          label="Başlık 1"
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          label="Başlık 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          label="Başlık 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="Madde işaretli liste"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="Numaralı liste"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          label="Alıntı"
        >
          <Quote className="size-4" />
        </ToolbarButton>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

        <ToolbarButton onClick={addLink} active={editor.isActive("link")} label="Bağlantı">
          <Link2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} label="Görsel">
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ImageIcon className="size-4" />
          )}
        </ToolbarButton>

        <div className="ml-auto hidden items-center gap-1.5 rounded-lg bg-white px-2 py-1 text-xs text-muted-foreground sm:flex">
          <Slash className="size-3 text-brand-blue" />
          slash komutları
        </div>
      </div>

      <div className="relative p-0" ref={editorRef}>
        <EditorContent editor={editor} />

        {slashOpen && (
          <SlashCommandMenu
            items={filteredCommands}
            selectedIndex={selectedIndex}
            onSelect={handleSlashSelect}
            position={menuPosition}
          />
        )}
      </div>

      <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-xs text-muted-foreground sm:px-6">
        {message ? (
          <span
            className={cn(
              message.type === "success" ? "text-emerald-600" : "text-red-600"
            )}
            role="status"
          >
            {message.text}
          </span>
        ) : (
          <>
            {slashCommands.length} slash komutu · Video, PDF ve görsel desteği
            {uploading && " · Yükleniyor..."}
          </>
        )}
      </div>

      <MediaInsertMenu
        open={mediaMenuType !== null && !pickerOpen}
        onOpenChange={(open) => {
          if (!open) setMediaMenuType(null);
        }}
        label={
          mediaMenuType === "image"
            ? "Görsel Ekle"
            : mediaMenuType === "video"
              ? "Video Ekle"
              : "PDF Ekle"
        }
        onUpload={() => {
          if (mediaMenuType) openUploadForType(mediaMenuType);
        }}
        onLibrary={() => setPickerOpen(true)}
      />

      <MediaPickerDialog
        open={pickerOpen && mediaMenuType !== null}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) setMediaMenuType(null);
        }}
        mediaType={
          mediaMenuType === "image"
            ? "image"
            : mediaMenuType === "video"
              ? "video"
              : mediaMenuType === "pdf"
                ? "pdf"
                : undefined
        }
        uploadUrl={uploadUrl}
        title={
          mediaMenuType === "image"
            ? "Görsel Seç"
            : mediaMenuType === "video"
              ? "Video Seç"
              : "PDF Seç"
        }
        onSelect={(media) => {
          insertFromLibrary(media.url, media.fileName);
        }}
      />
    </Card>
  );
}
