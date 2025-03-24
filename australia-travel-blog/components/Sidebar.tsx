import Link from 'next/link';
import { getAllCategories } from '@/lib/blogPosts';

async function Sidebar() {
  const categories = await getAllCategories();

  return (
    <aside className="p-4">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <ul className="list-none p-0">
        {categories.map((category: {id: number; slug: string; name: string}) => (
          <li key={category.id} className="mb-2">
            <Link href={`/category/${category.slug}`} className="text-blue-500 hover:underline">
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
