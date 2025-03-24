import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostsPreview } from "@/components/BlogPostPreview";
import { BlogPostsPagination } from "@/components/BlogPostsPagination";
import { wisp } from "@/lib/wisp";
import { config } from "@/config";

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await paramsPromise;
  return {
    title: `${params.slug} - Posts`,
    description: `Browse all posts tagged with ${params.slug}`,
    openGraph: {
      title: `${params.slug} - Posts`,
      description: `Browse all posts tagged with ${params.slug}`,
      url: `${config.baseUrl}/tag/${params.slug}`,
    },
  };
}

export async function generateStaticParams() {
  // We'll get all posts and extract unique tags
  const { posts } = await wisp.getPosts({ limit: 100 });
  const tagSlugs = new Set<string>();
  
  posts.forEach(post => {
    post.tags.forEach(tag => {
      // Use the tag id as the slug since it's unique
      tagSlugs.add(tag.id);
    });
  });
  
  return Array.from(tagSlugs).map(slug => ({ slug }));
}

export default async function TagPage({ params: paramsPromise, searchParams: searchParamsPromise }: TagPageProps) {
  try {
    const params = await paramsPromise;
    const searchParams = await searchParamsPromise;
    const pageParam = searchParams.page;
    const page = pageParam ? parseInt(pageParam as string) : 1;
    
    // Get posts with the specified tag
    const { posts, pagination } = await wisp.getPosts({ 
      tags: [params.slug],
      page,
      limit: 6 
    });
    
    if (posts.length === 0) {
      notFound();
    }
    
    // Find the tag name from the first post that has this tag
    const tagName = posts[0]?.tags.find(tag => tag.id === params.slug)?.name || params.slug;
    
    return (
      <div className="container mx-auto px-5 mb-10">
        <div className="my-8">
          <h1 className="text-3xl font-bold mb-2">
            Posts tagged with &quot;{tagName}&quot;
          </h1>
          <p className="text-muted-foreground">
            Browse all posts related to this topic
          </p>
        </div>
        <BlogPostsPreview posts={posts} />
        <BlogPostsPagination pagination={pagination} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
