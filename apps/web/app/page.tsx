import Profile from "../components/Profile";
import { loadCV } from "@/lib/loadCV";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const cv = await loadCV();
  const sp = await searchParams;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: cv.general.displayName,
    url: "https://antoni.cv",
    jobTitle: "Software Engineer / Designer",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Vilnius",
      addressCountry: "Lithuania",
    },
    image: "https://antoni.cv/content/media/profilePhoto.jpg",
    sameAs: cv.general.websites?.map((w: any) => w.url) ?? [],
  };

  return (
    <div className="px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Profile cv={cv} tab={sp?.tab} />
    </div>
  );
}
