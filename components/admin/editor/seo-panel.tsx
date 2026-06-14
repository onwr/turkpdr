"use client";

import Image from "next/image";
import { Globe, Search, Share2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSiteBaseUrl } from "@/lib/seo/metadata";
import type { SeoFieldsForm } from "@/types/seo";
import { cn } from "@/lib/utils";

type SeoPanelProps = {
  summary?: string;
  onSummaryChange?: (value: string) => void;
  showSummary?: boolean;
  seo: SeoFieldsForm;
  onSeoChange: <K extends keyof SeoFieldsForm>(
    key: K,
    value: SeoFieldsForm[K]
  ) => void;
  preview: {
    title: string;
    slug?: string;
    pathPrefix: string;
    fallbackDescription?: string;
    defaultImage?: string | null;
  };
  onUseDefaultImage?: () => void;
  defaultImageLabel?: string;
};

function SeoPreview({
  seo,
  preview,
}: {
  seo: SeoFieldsForm;
  preview: SeoPanelProps["preview"];
}) {
  const baseUrl = getSiteBaseUrl().replace(/^https?:\/\//, "");
  const path = preview.slug
    ? `${preview.pathPrefix}/${preview.slug}`
    : preview.pathPrefix;
  const displayUrl = seo.canonicalUrl.trim() || `${baseUrl}${path}`;
  const displayTitle =
    seo.seoTitle.trim() || `${preview.title.trim()} | TürkPDR`;
  const displayDescription =
    seo.seoDescription.trim() ||
    preview.fallbackDescription?.trim() ||
    preview.title.trim();
  const displayImage = seo.ogImage.trim() || preview.defaultImage || null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Search className="size-3.5" />
          Google Önizleme
        </div>
        <p className="truncate text-sm text-[#202124]">{displayUrl}</p>
        <p className="mt-1 line-clamp-1 text-lg text-[#1a0dab]">
          {displayTitle}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#4d5156]">
          {displayDescription}
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-2 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <Share2 className="size-3.5" />
            Sosyal Paylaşım Önizleme
          </div>
        </div>
        {displayImage ? (
          <div className="relative aspect-[1.91/1] bg-slate-100">
            <Image
              src={displayImage}
              alt={displayTitle}
              fill
              className="object-cover"
              sizes="320px"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex aspect-[1.91/1] items-center justify-center bg-slate-100 text-xs text-muted-foreground">
            Görsel seçilmedi
          </div>
        )}
        <div className="space-y-1 p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {baseUrl}
          </p>
          <p className="line-clamp-2 font-semibold text-brand-navy">
            {displayTitle}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {displayDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SeoPanel({
  summary,
  onSummaryChange,
  showSummary = false,
  seo,
  onSeoChange,
  preview,
  onUseDefaultImage,
  defaultImageLabel = "Kapak görselini kullan",
}: SeoPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2">
          <Globe className="size-4 text-brand-blue" />
          SEO Ayarları
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSummary && onSummaryChange !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="content-summary">İçerik Özeti</Label>
            <textarea
              id="content-summary"
              value={summary ?? ""}
              onChange={(e) => onSummaryChange(e.target.value)}
              placeholder="İçeriğin kısa özeti"
              rows={3}
              maxLength={300}
              className="flex w-full resize-none rounded-xl border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="text-right text-xs text-muted-foreground">
              {(summary ?? "").length}/300
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="seo-title">SEO Başlığı</Label>
          <Input
            id="seo-title"
            value={seo.seoTitle}
            onChange={(e) => onSeoChange("seoTitle", e.target.value)}
            placeholder="Arama sonuçlarında görünecek başlık"
            className="rounded-xl"
            maxLength={70}
          />
          <p className="text-right text-xs text-muted-foreground">
            {seo.seoTitle.length}/70
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-description">SEO Açıklaması</Label>
          <textarea
            id="seo-description"
            value={seo.seoDescription}
            onChange={(e) => onSeoChange("seoDescription", e.target.value)}
            placeholder="Arama sonuçlarında görünecek açıklama"
            rows={3}
            maxLength={160}
            className="flex w-full resize-none rounded-xl border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="text-right text-xs text-muted-foreground">
            {seo.seoDescription.length}/160
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="og-image">OG Görsel URL</Label>
          <Input
            id="og-image"
            value={seo.ogImage}
            onChange={(e) => onSeoChange("ogImage", e.target.value)}
            placeholder="https://..."
            className="rounded-xl"
          />
          {onUseDefaultImage && (
            <button
              type="button"
              onClick={onUseDefaultImage}
              className="text-xs font-medium text-brand-blue hover:underline"
            >
              {defaultImageLabel}
            </button>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="canonical-url">Canonical URL</Label>
          <Input
            id="canonical-url"
            value={seo.canonicalUrl}
            onChange={(e) => onSeoChange("canonicalUrl", e.target.value)}
            placeholder="Boş bırakılırsa otomatik oluşturulur"
            className="rounded-xl"
          />
        </div>

        <label
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3",
            seo.noIndex && "border-amber-200 bg-amber-50/50"
          )}
        >
          <Checkbox
            checked={seo.noIndex}
            onCheckedChange={(checked) =>
              onSeoChange("noIndex", checked === true)
            }
          />
          <div>
            <p className="text-sm font-medium text-brand-navy">
              Arama motorlarında gizle (noindex)
            </p>
            <p className="text-xs text-muted-foreground">
              Etkinleştirildiğinde sayfa indekslenmez.
            </p>
          </div>
        </label>

        <SeoPreview seo={seo} preview={preview} />
      </CardContent>
    </Card>
  );
}
