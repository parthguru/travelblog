import { getBlogPostBySlug } from '@/lib/blogPosts';
import Image from 'next/image';

interface BlogPostPageProps {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  console.log("Slug:", params.slug);
  const post = await getBlogPostBySlug(params.slug);
  console.log("Post:", post);

  if (!post) {
    return <div>Blog post not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {post.featured_image && (
        <Image
          src={post.featured_image}
          alt={post.title}
          width={600}
          height={400}
          className="mb-4"
          priority
        />
      )}
      <p className="text-gray-700 leading-relaxed">{post.content}</p>
    </div>
  );
}
