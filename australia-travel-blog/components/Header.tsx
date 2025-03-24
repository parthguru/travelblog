import Link from "next/link";
import { config } from "@/config";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export const Header = () => {
  return (
    <header className="py-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          {config.blog.name}
        </Link>
        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/tag"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Tags
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <DarkModeToggle />
        </nav>
      </div>
    </header>
  );
};
