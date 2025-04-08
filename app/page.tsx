import Profile from "../components/Profile";
import { loadCV } from "@/lib/loadCV";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const cv = await loadCV();
  const sp = await searchParams;

  return (
    <div className="px-6">
      <Profile cv={cv} tab={sp?.tab} />
    </div>
  );
}
