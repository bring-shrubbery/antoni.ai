import { promises as fs } from "fs";
import Profile from "../components/Profile";
import { loadCV } from "@/lib/loadCV";

export default async function Home() {
  const cv = await loadCV();

  return (
    <div className="px-6">
      <Profile cv={cv} />
    </div>
  );
}
