import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { normalizeMediaUrl } from "@/lib/media-url";
import { prisma } from "@/lib/prisma";
import {
  sanitizeStringList,
  validateStringList,
} from "@/lib/profile-utils";
import { getAccountProfileData } from "@/lib/queries/account";

type ProfileUpdateBody = {
  name?: string;
  title?: string | null;
  bio?: string | null;
  avatar?: string | null;
  coverImage?: string | null;
  phone?: string | null;
  city?: string | null;
  website?: string | null;
  workAreas?: string[];
  expertiseAreas?: string[];
};

function validateProfileUpdate(body: ProfileUpdateBody): string | null {
  if (body.name !== undefined && !body.name.trim()) {
    return "Ad soyad boş olamaz.";
  }
  if (body.name !== undefined && body.name.trim().length < 2) {
    return "Ad soyad en az 2 karakter olmalıdır.";
  }
  if (body.title !== undefined && body.title && body.title.length > 120) {
    return "Ünvan en fazla 120 karakter olabilir.";
  }
  if (body.bio !== undefined && body.bio && body.bio.length > 2000) {
    return "Biyografi en fazla 2000 karakter olabilir.";
  }
  if (body.phone !== undefined && body.phone && body.phone.length > 30) {
    return "Telefon en fazla 30 karakter olabilir.";
  }
  if (body.city !== undefined && body.city && body.city.length > 80) {
    return "Şehir en fazla 80 karakter olabilir.";
  }
  if (body.website !== undefined && body.website && body.website.length > 200) {
    return "Web sitesi en fazla 200 karakter olabilir.";
  }
  if (body.workAreas !== undefined) {
    const error = validateStringList(body.workAreas, "Çalışma alanları");
    if (error) return error;
  }
  if (body.expertiseAreas !== undefined) {
    const error = validateStringList(body.expertiseAreas, "Uzmanlık alanları");
    if (error) return error;
  }
  return null;
}

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const profile = await getAccountProfileData(auth.user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profil bulunamadı." }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  let body: ProfileUpdateBody;
  try {
    body = (await request.json()) as ProfileUpdateBody;
  } catch {
    return NextResponse.json(
      { error: "Geçersiz istek gövdesi." },
      { status: 400 }
    );
  }

  const validationError = validateProfileUpdate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const updateData: {
    name?: string;
    title?: string | null;
    bio?: string | null;
    avatar?: string | null;
    coverImage?: string | null;
    phone?: string | null;
    city?: string | null;
    website?: string | null;
    workAreas?: string[];
    expertiseAreas?: string[];
  } = {};

  if (body.name !== undefined) updateData.name = body.name.trim();
  if (body.title !== undefined) updateData.title = body.title?.trim() || null;
  if (body.bio !== undefined) updateData.bio = body.bio?.trim() || null;
  if (body.avatar !== undefined) {
    updateData.avatar = normalizeMediaUrl(body.avatar?.trim()) ?? null;
  }
  if (body.coverImage !== undefined) {
    updateData.coverImage = normalizeMediaUrl(body.coverImage?.trim()) ?? null;
  }
  if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null;
  if (body.city !== undefined) updateData.city = body.city?.trim() || null;
  if (body.website !== undefined) {
    updateData.website = body.website?.trim() || null;
  }

  const workAreas = sanitizeStringList(body.workAreas);
  if (workAreas !== null) updateData.workAreas = workAreas;

  const expertiseAreas = sanitizeStringList(body.expertiseAreas);
  if (expertiseAreas !== null) updateData.expertiseAreas = expertiseAreas;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "Güncellenecek alan bulunamadı." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: auth.user.id },
    data: updateData,
  });

  const profile = await getAccountProfileData(auth.user.id);

  return NextResponse.json({
    message: "Profil güncellendi.",
    profile,
  });
}
