import type { Editor } from "@tiptap/react";

import type { SlashCommandItem } from "@/types/editor";

export const slashCommands: SlashCommandItem[] = [
  {
    id: "heading1",
    label: "Başlık 1",
    description: "Büyük bölüm başlığı",
    icon: "H1",
    keywords: ["baslik", "heading", "h1"],
  },
  {
    id: "heading2",
    label: "Başlık 2",
    description: "Orta bölüm başlığı",
    icon: "H2",
    keywords: ["baslik", "heading", "h2"],
  },
  {
    id: "heading3",
    label: "Başlık 3",
    description: "Küçük bölüm başlığı",
    icon: "H3",
    keywords: ["baslik", "heading", "h3"],
  },
  {
    id: "bulletList",
    label: "Madde İşaretli Liste",
    description: "Sırasız liste oluştur",
    icon: "•",
    keywords: ["liste", "bullet", "madde"],
  },
  {
    id: "orderedList",
    label: "Numaralı Liste",
    description: "Sıralı liste oluştur",
    icon: "1.",
    keywords: ["liste", "ordered", "numara"],
  },
  {
    id: "blockquote",
    label: "Alıntı",
    description: "Alıntı bloğu ekle",
    icon: "❝",
    keywords: ["quote", "alinti", "blockquote"],
  },
  {
    id: "image",
    label: "Görsel",
    description: "Görsel ekle",
    icon: "🖼",
    keywords: ["image", "gorsel", "resim"],
  },
  {
    id: "video",
    label: "Video",
    description: "Video embed alanı ekle",
    icon: "▶",
    keywords: ["video", "youtube", "embed"],
  },
  {
    id: "pdf",
    label: "PDF",
    description: "PDF ekleme alanı ekle",
    icon: "📄",
    keywords: ["pdf", "dosya", "document"],
  },
];

export function executeSlashCommand(
  editor: Editor,
  commandId: string,
  payload?: { url?: string; title?: string }
) {
  const chain = editor.chain().focus();

  switch (commandId) {
    case "heading1":
      chain.toggleHeading({ level: 1 }).run();
      break;
    case "heading2":
      chain.toggleHeading({ level: 2 }).run();
      break;
    case "heading3":
      chain.toggleHeading({ level: 3 }).run();
      break;
    case "bulletList":
      chain.toggleBulletList().run();
      break;
    case "orderedList":
      chain.toggleOrderedList().run();
      break;
    case "blockquote":
      chain.toggleBlockquote().run();
      break;
    case "image":
      if (payload?.url) {
        chain.setImage({ src: payload.url }).run();
      }
      break;
    case "video":
      chain
        .insertContent({
          type: "videoEmbed",
          attrs: {
            src: payload?.url ?? "",
            title: payload?.title ?? "Video",
          },
        })
        .run();
      break;
    case "pdf":
      chain
        .insertContent({
          type: "pdfEmbed",
          attrs: {
            url: payload?.url ?? "",
            title: payload?.title ?? "PDF Doküman",
          },
        })
        .run();
      break;
    default:
      break;
  }
}

export function removeSlashTrigger(editor: Editor) {
  const { from } = editor.state.selection;
  const textBefore = editor.state.doc.textBetween(
    Math.max(0, from - 50),
    from,
    "\n",
    "\0"
  );
  const match = textBefore.match(/\/([^/\n]*)$/);

  if (match) {
    const deleteFrom = from - match[0].length;
    editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
  }
}

export function getSlashQuery(editor: Editor): string | null {
  const { from } = editor.state.selection;
  const textBefore = editor.state.doc.textBetween(
    Math.max(0, from - 50),
    from,
    "\n",
    "\0"
  );
  const match = textBefore.match(/\/([^/\n]*)$/);
  return match ? match[1] : null;
}

export function filterSlashCommands(query: string) {
  const normalized = query.toLowerCase().trim();

  if (!normalized) return slashCommands;

  return slashCommands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(normalized) ||
      cmd.keywords.some((kw) => kw.includes(normalized))
  );
}
