import { HomePage } from "@/components/home/home-page";
import { getHomePageData } from "@/lib/queries/home";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getHomePageData();
  return <HomePage data={data} />;
}
