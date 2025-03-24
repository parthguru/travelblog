import Image from "next/image";
import Link from "next/link";
import { GetPostResult } from "@/lib/wisp";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface BlogPostContentProps {
  post: GetPostResult["post"] | null;
}

export const BlogPostContent = ({ post }: BlogPostContentProps) => {
  if (!post) {
    return (
      <div className="mx-auto max-w-3xl text-center py-10">
        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground">
          The blog post you're looking for could not be found.
        </p>
      </div>
    );
  }
  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <Link key={tag.id} href={`/tag/${tag.id}`}>
              <Badge variant="secondary" className="hover:bg-secondary/80">
                {tag.name}
              </Badge>
            </Link>
          ))}
        </div>
        {post.createdAt && (
          <p className="text-muted-foreground">
            Published on{" "}
            <time dateTime={typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString()}>
              {formatDate(typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString())}
            </time>
          </p>
        )}
      </div>

      {post.image && (
        <div className="relative aspect-video mb-8 overflow-hidden rounded-lg">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </article>
  );
};
