import type { ContentStatus } from "@prisma/client";

export type FileListItem = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  fileSize: number | null;
  downloads: number;
  status: ContentStatus;
  uploadedById: string;
  uploadedBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export type FileFormState = {
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
  status: ContentStatus;
};

export const defaultFileFormState: FileFormState = {
  title: "",
  description: "",
  fileUrl: "",
  fileType: "",
  fileSize: "",
  status: "DRAFT",
};

export type PublicFileItem = {
  id: string;
  title: string;
  description: string | null;
  fileType: string | null;
  fileSize: number | null;
  downloads: number;
  uploadedBy: string;
};

export type FileCategoryGroup = {
  type: string;
  label: string;
  count: number;
};
