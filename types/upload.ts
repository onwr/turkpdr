export type UploadSuccess = {
  success: true;
  url: string;
  fileName: string;
  fileType: string;
  size: number;
};

export type UploadError = {
  success: false;
  message: string;
};

export type UploadResponse = UploadSuccess | UploadError;

export type UploadCategory = "images" | "files" | "videos";

export const UPLOAD_MIME_TYPES = {
  "image/jpeg": { category: "images" as const, maxSize: 5 * 1024 * 1024 },
  "image/png": { category: "images" as const, maxSize: 5 * 1024 * 1024 },
  "image/webp": { category: "images" as const, maxSize: 5 * 1024 * 1024 },
  "application/pdf": { category: "files" as const, maxSize: 20 * 1024 * 1024 },
  "video/mp4": { category: "videos" as const, maxSize: 100 * 1024 * 1024 },
  "video/webm": { category: "videos" as const, maxSize: 100 * 1024 * 1024 },
} as const;

export type AllowedMimeType = keyof typeof UPLOAD_MIME_TYPES;

export const MIME_TO_EXTENSION: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";
export const PDF_ACCEPT = "application/pdf";
export const VIDEO_ACCEPT = "video/mp4,video/webm";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
