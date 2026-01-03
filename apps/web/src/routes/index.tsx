import { createFileRoute } from "@tanstack/react-router";
import Profile from "../components/Profile";
import { loadCV } from "../lib/loadCV";

export const Route = createFileRoute("/")({
  loader: async () => {
    const cv = await loadCV();
    return { cv };
  },
  component: IndexComponent,
});

function IndexComponent() {
  const { cv } = Route.useLoaderData();
  const search = Route.useSearch() as { tab?: string };

  return (
    <div className="px-6">
      <Profile cv={cv} tab={search.tab} />
    </div>
  );
}
