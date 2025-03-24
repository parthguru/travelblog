import RSS from "rss";
import { wisp } from "@/lib/wisp";
import { config } from "@/config";

export async function GET() {
  const feed = new RSS({
    title: config.blog.name,
    description: config.blog.metadata.description,
    site_url: config.baseUrl,
    feed_url: `${config.baseUrl}/rss`,
    language: "en",
    pubDate: new Date(),
    copyright: `${new Date().getFullYear()} ${config.blog.copyright}`,
  });

  const { posts } = await wisp.getPosts({ limit: 20 });

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      description: post.excerpt,
      url: `${config.baseUrl}/blog/${post.slug}`,
      guid: post.id,
      date: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      categories: post.tags.map((tag) => tag.name),
      author: post.author?.name || config.blog.copyright,
    });
  });

  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
