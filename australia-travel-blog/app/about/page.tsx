import { Metadata } from "next";
import { config } from "@/config";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about our blog and our story",
  openGraph: {
    title: "About",
    description: "Learn more about our blog and our story",
    url: `${config.baseUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-5 mb-10">
      <div className="max-w-3xl mx-auto my-8">
        <h1 className="text-4xl font-bold mb-6">About</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            Welcome to {config.blog.name}, a blog dedicated to sharing travel
            experiences and adventures in Australia. Our mission is to inspire
            others to explore the beautiful landscapes, vibrant cities, and
            unique culture that Australia has to offer.
          </p>
          <p>
            Whether you're planning your first trip to Australia or you're a
            seasoned traveler looking for new destinations to explore, we hope
            our blog provides valuable insights and inspiration for your journey.
          </p>
          <h2>Our Story</h2>
          <p>
            This blog was created out of a passion for travel and a desire to
            share the beauty of Australia with the world. Through our articles,
            we aim to showcase both popular tourist destinations and hidden gems
            that are off the beaten path.
          </p>
          <h2>Contact Us</h2>
          <p>
            Have questions, suggestions, or just want to say hello? Feel free to
            reach out to us at <a href="mailto:contact@example.com">contact@example.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
