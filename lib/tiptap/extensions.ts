import { Node, mergeAttributes } from "@tiptap/core";

function isEmbeddableVideoUrl(src: string): boolean {
  return /youtube|youtu\.be|vimeo|dailymotion/i.test(src);
}

function isUploadedVideoFile(src: string): boolean {
  return (
    src.startsWith("/uploads/videos/") || /\.(mp4|webm)(\?|$)/i.test(src)
  );
}

export const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      title: { default: "Video" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="video-embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src as string;
    const title = HTMLAttributes.title as string;

    if (src && isUploadedVideoFile(src) && !isEmbeddableVideoUrl(src)) {
      return [
        "div",
        mergeAttributes(HTMLAttributes, {
          "data-type": "video-embed",
          class:
            "my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
        }),
        [
          "div",
          {
            class:
              "border-b border-slate-200 bg-white px-4 py-2 text-sm font-medium text-brand-navy",
          },
          title,
        ],
        [
          "video",
          {
            src,
            controls: "true",
            class: "aspect-video w-full bg-slate-900",
          },
        ],
      ];
    }

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "video-embed",
        class:
          "my-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
      }),
      [
        "div",
        {
          class:
            "border-b border-slate-200 bg-white px-4 py-2 text-sm font-medium text-brand-navy",
        },
        title,
      ],
      [
        "div",
        { class: "aspect-video bg-slate-900" },
        src
          ? [
              "iframe",
              {
                src,
                class: "size-full",
                frameborder: "0",
                allowfullscreen: "true",
                allow:
                  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
              },
            ]
          : [
              "div",
              {
                class:
                  "flex size-full items-center justify-center text-sm text-slate-400",
              },
              "Video URL ekleyin",
            ],
      ],
    ];
  },
});

export const PdfEmbed = Node.create({
  name: "pdfEmbed",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      url: { default: "" },
      title: { default: "PDF Doküman" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="pdf-embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const url = HTMLAttributes.url as string;
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "pdf-embed",
        class:
          "my-4 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4",
      }),
      [
        "div",
        {
          class:
            "flex size-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600",
        },
        "PDF",
      ],
      [
        "div",
        { class: "min-w-0 flex-1" },
        [
          "p",
          { class: "font-medium text-brand-navy" },
          HTMLAttributes.title as string,
        ],
        [
          "a",
          {
            href: url || "#",
            class: "text-sm text-brand-blue hover:underline",
            target: "_blank",
            rel: "noopener noreferrer",
          },
          url ? "PDF dosyasını aç" : "PDF URL ekleyin",
        ],
      ],
    ];
  },
});
