import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-white">
      <LoadingSpinner label="Sayfa yükleniyor..." size="lg" />
    </div>
  );
}
