import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ClipboardList,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Bilimsel içerikler",
    description: "Uzman yazarların güncel makale ve kaynaklarına erişin.",
  },
  {
    icon: ClipboardList,
    title: "Online testler",
    description: "Güvenilir psikolojik testleri çevrimiçi çözün.",
  },
  {
    icon: Users,
    title: "Uzman topluluğu",
    description: "PDR alanındaki profesyonellerle etkileşime geçin.",
  },
] as const;

export function AuthBrandPanel() {
  return (
    <div className="relative hidden min-h-screen w-full flex-col justify-between overflow-hidden border-r border-slate-200/80 bg-[#f8fbff] px-6 py-10 sm:px-8 lg:flex lg:w-1/2 lg:shrink-0 lg:px-10 lg:py-12 xl:px-12 2xl:px-14 dark:border-border dark:bg-muted/20">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.1), transparent 45%), radial-gradient(circle at 80% 80%, rgba(14,165,233,0.08), transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 w-full max-w-xl">
        <Link href="/" className="inline-flex transition-opacity hover:opacity-80">
          <Image
            src="/logo.png"
            alt="TürkPDR"
            width={180}
            height={40}
            className="h-11 w-auto object-contain"
            priority
            unoptimized
          />
        </Link>

        <div className="mt-10 space-y-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 xl:text-4xl dark:text-foreground">
            TürkPDR Topluluğuna Hoş Geldiniz
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-slate-600 dark:text-muted-foreground">
            Psikoloji, rehberlik ve danışmanlık alanında içeriklere ulaşın,
            testleri çözün ve uzmanlarla etkileşime geçin.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-3 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-border/60 dark:bg-card/80"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <feature.icon className="size-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-foreground">
                  {feature.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-8 flex w-full max-w-xl items-end justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-brand-blue" />
          <span>Verileriniz güvenli şekilde korunur.</span>
        </div>
        <Image
          src="/heroimg.png"
          alt=""
          width={280}
          height={420}
          aria-hidden
          className="h-auto w-36 object-contain opacity-90 xl:w-44"
        />
      </div>
    </div>
  );
}
