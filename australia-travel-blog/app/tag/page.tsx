import { Metadata } from "next";
import Link from "next/link";
import { wisp } from "@/lib/wisp";
import { Badge } from "@/components/ui/badge";
import { config } from "@/config";

export const metadata: Metadata = {
  title: "All Tags",
  description: "Browse all tags and topics on our blog",
  openGraph: {
    title: "All Tags",
    description: "Browse all tags and topics on our blog",
    url: `${config.baseUrl}/tag`,
  },
};

export default async function TagsPage() {
  // Get all posts and extract unique tags
  const { posts } = await wisp.getPosts({ limit: 100 });
  
  // Create a map to store tag information
  const tagsMap = new Map<string, { id: string; name: string; count: number }>();
  
  // Process all posts to extract tags
  posts.forEach(post => {
    post.tags.forEach(tag => {
      if (tagsMap.has(tag.id)) {
        // Increment count if tag already exists
        const existingTag = tagsMap.get(tag.id)!;
        existingTag.count += 1;
      } else {
        // Add new tag
        tagsMap.set(tag.id, {
          id: tag.id,
          name: tag.name,
          count: 1
        });
      }
    });
  });
  
  // Convert map to array
  const tags = Array.from(tagsMap.values());

  return (
    <div className="container mx-auto px-5 mb-10">
      <div className="my-8">
        <h1 className="text-3xl font-bold mb-2">All Tags</h1>
        <p className="text-muted-foreground">
          Browse all topics covered on our blog
        </p>
      </div>

      <div className="flex flex-wrap gap-3 my-8">
        {tags.map((tag) => (
          <Link key={tag.id} href={`/tag/${tag.id}`}>
            <Badge
              variant="secondary"
              className="text-base py-2 px-4 hover:bg-secondary/80"
            >
              {tag.name}
              <span className="ml-2 text-xs text-muted-foreground">
                ({tag.count})
              </span>
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
