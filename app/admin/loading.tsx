import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <LoadingSpinner label="Admin paneli yükleniyor..." size="lg" />
    </div>
  );
}
