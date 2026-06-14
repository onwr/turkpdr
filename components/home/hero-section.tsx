import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteContainerClass } from "@/lib/site-layout";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-[#f8fbff] dark:bg-background"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 45%, rgba(248,250,252,0.95), transparent 55%), radial-gradient(circle at 82% 50%, rgba(59,130,246,0.1), transparent 58%)",
        }}
      />

      <div className={`relative ${siteContainerClass}`}>
        <div className="grid grid-cols-1 items-start gap-10 pt-6 pb-12 sm:gap-12 sm:pt-8 sm:pb-14 lg:grid-cols-2 lg:gap-16 lg:pt-10 lg:pb-16">
          <div className="max-w-[700px] space-y-6 lg:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-white/80 px-4 py-1.5 text-sm font-medium text-brand-blue shadow-sm dark:border-brand-blue/30 dark:bg-brand-blue/10">
              <ClipboardList className="size-4" />
              Psikolojik Danışmanlık Platformu
            </div>

            <div className="space-y-6">
              <h1
                id="hero-heading"
                className="text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl md:text-6xl xl:text-7xl dark:text-foreground"
              >
                Türkiye&apos;nin En Büyük{" "}
                <span className="bg-linear-to-r from-brand-blue to-sky-500 bg-clip-text text-transparent">
                  Psikolojik Danışmanlık
                </span>{" "}
                Platformu
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg lg:text-xl dark:text-muted-foreground">
                Psikolojik danışmanlar, rehber öğretmenler, öğrenciler ve
                uzmanlar için içerik, test, dosya ve eğitim merkezi.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-2xl bg-brand-blue px-6 text-base shadow-lg shadow-brand-blue/25 hover:bg-brand-blue/90 lg:h-14 lg:px-8 lg:text-lg"
                asChild
              >
                <Link href="/makaleler">
                  Makaleleri Keşfet
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-2xl border-brand-blue/25 bg-white/80 px-6 text-base text-brand-blue hover:bg-brand-blue/5 dark:border-border dark:bg-transparent dark:text-foreground lg:h-14 lg:px-8 lg:text-lg"
                asChild
              >
                <Link href="/test-merkezi">Test Merkezine Git</Link>
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end lg:pt-2">
            <Image
              src="/heroimg.png"
              alt="TürkPDR psikolojik danışmanlık illüstrasyonu"
              width={1024}
              height={1536}
              priority
              className="h-auto scale-200 filter brightness-90 w-full max-h-[340px] max-w-[420px] object-contain drop-shadow-[0_40px_80px_rgba(37,99,235,0.18)] sm:max-h-[400px] sm:max-w-[480px] lg:max-h-[520px] lg:max-w-[600px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
