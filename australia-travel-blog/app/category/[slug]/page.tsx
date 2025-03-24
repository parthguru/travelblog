import { getBlogPostsByCategoryId, getAllCategories } from '@/lib/blogPosts';
import Link from 'next/link';

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
    const categories = await getAllCategories();
    return categories.map((category: {slug: string}) => ({
        slug: category.slug
    }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const categories = await getAllCategories();
    const category = categories.find((cat: {slug: string}) => cat.slug === params.slug);

    if (!category) {
        return <div>Category not found.</div>;
    }

  const posts = await getBlogPostsByCategoryId(category.id);

  return (
    <div>
      <h1>Category: {category.name}</h1>
      <ul>
        {posts.map((post: { id: number; slug: string; title: string }) => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
