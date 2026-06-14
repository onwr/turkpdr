import { mkdir, writeFile, access } from "fs/promises";
import path from "path";
import slugify from "slugify";

import {
  MIME_TO_EXTENSION,
  UPLOAD_MIME_TYPES,
  type AllowedMimeType,
  type UploadCategory,
  type UploadSuccess,
} from "@/types/upload";

export type UploadStorageProvider = {
  save(
    buffer: Buffer,
    fileName: string,
    category: UploadCategory
  ): Promise<{ url: string }>;
};

export class LocalUploadStorage implements UploadStorageProvider {
  constructor(
    private readonly baseDir = path.join(process.cwd(), "public", "uploads")
  ) {}

  async save(
    buffer: Buffer,
    fileName: string,
    category: UploadCategory
  ): Promise<{ url: string }> {
    const safeName = path.basename(fileName);
    const targetDir = path.join(this.baseDir, category);
    const filePath = path.join(targetDir, safeName);

    const resolvedPath = path.resolve(filePath);
    const resolvedDir = path.resolve(targetDir);

    if (
      !resolvedPath.startsWith(resolvedDir + path.sep) &&
      resolvedPath !== resolvedDir
    ) {
      throw new Error("Geçersiz dosya yolu.");
    }

    await mkdir(targetDir, { recursive: true });
    await writeFile(filePath, buffer);

    return { url: `/uploads/${category}/${safeName}` };
  }
}

let storageProvider: UploadStorageProvider | null = null;

export function getUploadStorage(): UploadStorageProvider {
  if (!storageProvider) {
    storageProvider = new LocalUploadStorage();
  }
  return storageProvider;
}

export function setUploadStorage(provider: UploadStorageProvider): void {
  storageProvider = provider;
}

export function validateUploadFile(
  file: { type: string; size: number; name: string }
): string | null {
  if (!file.name?.trim()) {
    return "Dosya adı geçersiz.";
  }

  const config = UPLOAD_MIME_TYPES[file.type as AllowedMimeType];
  if (!config) {
    return "Dosya türü desteklenmiyor.";
  }

  if (file.size <= 0) {
    return "Dosya boş olamaz.";
  }

  if (file.size > config.maxSize) {
    const maxMb = config.maxSize / (1024 * 1024);
    return `Dosya boyutu çok büyük. Maksimum ${maxMb}MB olmalıdır.`;
  }

  return null;
}

export function getUploadCategory(mimeType: string): UploadCategory | null {
  const config = UPLOAD_MIME_TYPES[mimeType as AllowedMimeType];
  return config?.category ?? null;
}

export function generateSafeFileName(
  originalName: string,
  mimeType: AllowedMimeType
): string {
  const baseName = path.parse(originalName).name;
  const slug =
    slugify(baseName, { lower: true, strict: true, locale: "tr" }) || "dosya";
  const extension = MIME_TO_EXTENSION[mimeType];
  return `${slug}.${extension}`;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resolveUniqueFileName(
  originalName: string,
  mimeType: AllowedMimeType,
  category: UploadCategory,
  baseDir = path.join(process.cwd(), "public", "uploads")
): Promise<string> {
  const baseFileName = generateSafeFileName(originalName, mimeType);
  const targetDir = path.join(baseDir, category);
  let fileName = baseFileName;

  const parsed = path.parse(baseFileName);
  let counter = 0;

  while (await fileExists(path.join(targetDir, fileName))) {
    counter += 1;
    const suffix = counter === 1 ? Date.now() : `${Date.now()}-${counter}`;
    fileName = `${parsed.name}-${suffix}${parsed.ext}`;
  }

  return path.basename(fileName);
}

export async function saveUploadedFile(
  file: File,
  storage: UploadStorageProvider = getUploadStorage()
): Promise<UploadSuccess> {
  const validationError = validateUploadFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const mimeType = file.type as AllowedMimeType;
  const category = getUploadCategory(mimeType);
  if (!category) {
    throw new Error("Dosya türü desteklenmiyor.");
  }

  const fileName = await resolveUniqueFileName(file.name, mimeType, category);
  const buffer = Buffer.from(await file.arrayBuffer());
  const { url } = await storage.save(buffer, fileName, category);

  return {
    success: true,
    url,
    fileName,
    fileType: mimeType,
    size: file.size,
  };
}
