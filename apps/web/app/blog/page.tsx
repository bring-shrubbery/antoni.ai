import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Blog - Antoni",
  description: "Personal programming blog by Antoni",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="w-full max-w-[540px] mx-auto py-12 px-6">
      {/* Header with back link */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to home</span>
        </Link>
        <h1 className="text-2xl font-medium mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Thoughts on programming, software architecture, and engineering
        </p>
      </div>

      {/* Blog posts list */}
      <div className="flex flex-col gap-8">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No posts yet. Check back soon!
          </p>
        ) : (
          posts.map((post) => (
            <article
              key={post.slug}
              className="group motion-preset-fade motion-duration-300"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="space-y-2">
                  <h2 className="text-xl font-medium group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {post.readingTime}
                    </span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
