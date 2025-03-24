import Link from "next/link";
import Image from "next/image";
import { GetPostsResult } from "@/lib/wisp";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Calendar, ArrowRight } from "lucide-react";

interface BlogPostsPreviewProps {
  posts: GetPostsResult["posts"];
}

export const BlogPostsPreview = ({ posts }: BlogPostsPreviewProps) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-2">No posts found</h2>
        <p className="text-muted-foreground">
          There are no blog posts available at the moment.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-8">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden flex flex-col h-full card-hover border-0 shadow-lg rounded-xl">
          <CardHeader className="p-0">
            <Link href={`/blog/${post.slug}`} className="block">
              <div className="relative aspect-video" style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
                <Image
                  src={post.image || "/placeholder.jpg"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
              </div>
            </Link>
          </CardHeader>
          <CardContent className="flex-grow p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.slice(0, 3).map((tag) => (
                <Link key={tag.id} href={`/tag/${tag.id}`}>
                  <Badge variant="secondary" className="hover:bg-secondary/80 font-medium">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-muted-foreground">
                  +{post.tags.length - 3} more
                </Badge>
              )}
            </div>
            <Link href={`/blog/${post.slug}`} className="block group">
              <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h2>
            </Link>
            <p className="text-muted-foreground line-clamp-3 mb-4">
              {post.description || "Read more about this post..."}
            </p>
            <div className="flex justify-between items-center">
              {post.createdAt && (
                <time 
                  dateTime={typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString()}
                  className="text-sm text-muted-foreground flex items-center"
                >
                  <Calendar size={14} className="mr-1" />
                  {formatDate(typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString())}
                </time>
              )}
              <Link href={`/blog/${post.slug}`} className="text-primary font-medium text-sm flex items-center hover:underline">
                Read more <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
