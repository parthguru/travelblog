import { Metadata } from "next";
import { BlogPostsPreview } from "@/components/BlogPostPreview";
import { BlogPostsPagination } from "@/components/BlogPostsPagination";
import { wisp } from "@/lib/wisp";
import { config } from "@/config";

export const metadata: Metadata = {
  title: "Blog",
  description: "Read our latest blog posts about travel in Australia",
  openGraph: {
    title: "Blog",
    description: "Read our latest blog posts about travel in Australia",
    url: `${config.baseUrl}/blog`,
  },
};

export default async function BlogPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await searchParamsPromise;
  const pageParam = searchParams.page;
  const page = pageParam ? parseInt(pageParam as string) : 1;
  const result = await wisp.getPosts({ limit: 6, page });
  
  return (
    <div className="container mx-auto px-5 mb-10">
      <div className="my-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-muted-foreground">
          Read our latest blog posts about travel in Australia
        </p>
      </div>
      <BlogPostsPreview posts={result.posts} />
      <BlogPostsPagination pagination={result.pagination} />
    </div>
  );
}
