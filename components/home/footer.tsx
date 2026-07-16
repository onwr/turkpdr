import Image from "next/image";
import Link from "next/link";
import { Brain } from "lucide-react";

import {
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from "@/components/home/social-icons";
import { footerLinks } from "@/lib/mock-data/home";
import { siteContainerClass } from "@/lib/site-layout";

export type FooterBranding = {
  siteName: string;
  logoUrl: string | null;
  footerText: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  youtubeUrl: string | null;
};

function SiteBrandFooter({
  siteName,
  logoUrl,
}: {
  siteName: string;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      <>
        <Image
          src={logoUrl}
          alt={siteName}
          width={36}
          height={36}
          className="size-9 rounded-xl object-contain"
          unoptimized
        />
        <span className="text-lg font-bold">{siteName}</span>
      </>
    );
  }

  const match = siteName.match(/^(.+?)(PDR)$/i);

  return (
    <>
      <div className="flex size-9 items-center justify-center rounded-xl bg-brand-blue">
        <Brain className="size-5 text-white" />
      </div>
      <span className="text-lg font-bold">
        {match ? (
          <>
            {match[1]}
            <span className="text-sky-400">{match[2]}</span>
          </>
        ) : (
          siteName
        )}
      </span>
    </>
  );
}

type FooterProps = {
  branding?: FooterBranding;
};

export function Footer({ branding }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const siteName = branding?.siteName ?? "TürkPDR";
  const logoUrl = branding?.logoUrl ?? null;
  const footerText =
    branding?.footerText ??
    "Türkiye'nin en kapsamlı psikolojik danışmanlık ve rehberlik platformu.";

  const socialLinks = [
    { label: "Twitter", href: branding?.twitterUrl, icon: TwitterIcon },
    { label: "Instagram", href: branding?.instagramUrl, icon: InstagramIcon },
    { label: "LinkedIn", href: branding?.linkedinUrl, icon: LinkedinIcon },
    { label: "YouTube", href: branding?.youtubeUrl, icon: YoutubeIcon },
  ].filter((link) => link.href);

  return (
    <footer className="border-t border-border/60 bg-brand-navy text-white print:hidden dark:bg-card dark:text-foreground">
      <div className={`${siteContainerClass} py-12 lg:py-16`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-80"
            >
              <SiteBrandFooter siteName={siteName} logoUrl={logoUrl} />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/70 dark:text-muted-foreground">
              {footerText}
            </p>
            {(branding?.contactEmail || branding?.contactPhone) && (
              <div className="space-y-1 text-sm text-white/70 dark:text-muted-foreground">
                {branding.contactEmail && (
                  <p>
                    <a
                      href={`mailto:${branding.contactEmail}`}
                      className="transition-colors hover:text-white"
                    >
                      {branding.contactEmail}
                    </a>
                  </p>
                )}
                {branding.contactPhone && <p>{branding.contactPhone}</p>}
              </div>
            )}
          </div>

          <nav aria-label="Footer navigasyon">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white dark:text-muted-foreground dark:hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {socialLinks.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/90 dark:text-foreground">
                Sosyal Medya
              </p>
              <div className="flex gap-3">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-brand-blue dark:bg-muted dark:hover:bg-brand-blue dark:hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 text-center text-sm text-white/50 dark:border-border dark:text-muted-foreground">
          <p>
            &copy; {currentYear} {siteName}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
