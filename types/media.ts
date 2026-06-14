export type MediaAssetItem = {
  id: string;
  title: string | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  uploadedBy: { id: string; name: string } | null;
  createdAt: string;
};

export type MediaAssetDetail = MediaAssetItem & {
  usages: MediaUsageItem[];
};

export type MediaUsageItem = {
  type: "content" | "file" | "test" | "user";
  id: string;
  title: string;
  adminUrl: string;
  context: string;
};

export type MediaTypeFilter = "all" | "image" | "pdf" | "video";

export const MEDIA_TYPE_FILTER_OPTIONS: {
  value: MediaTypeFilter;
  label: string;
}[] = [
  { value: "all", label: "Tümü" },
  { value: "image", label: "Görseller" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Videolar" },
];

export function getMediaTypeLabel(category: string, fileType: string): string {
  if (category === "images") return "Görsel";
  if (category === "videos") return "Video";
  if (fileType === "application/pdf") return "PDF";
  return "Dosya";
}
