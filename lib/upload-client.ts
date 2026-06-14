import type { UploadResponse } from "@/types/upload";

export async function uploadFile(
  file: File,
  uploadUrl = "/api/admin/upload"
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const data = (await response.json()) as UploadResponse;

    if (!response.ok && data.success === false) {
      return data;
    }

    if (!data.success) {
      return {
        success: false,
        message: "Dosya yüklenemedi.",
      };
    }

    return data;
  } catch {
    return {
      success: false,
      message: "Yükleme sırasında bir hata oluştu.",
    };
  }
}

export function uploadAccountMedia(file: File): Promise<UploadResponse> {
  return uploadFile(file, "/api/account/upload");
}

export function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";

    input.addEventListener("change", () => {
      const file = input.files?.[0] ?? null;
      input.remove();
      resolve(file);
    });

    input.addEventListener("cancel", () => {
      input.remove();
      resolve(null);
    });

    document.body.appendChild(input);
    input.click();
  });
}
