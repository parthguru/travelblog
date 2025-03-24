import Link from "next/link";
import { config } from "@/config";
import { Facebook, Twitter, Instagram, Youtube, Mail, Rss, MapPin, Phone } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted mt-16">
      <div className="container mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center mb-4">
              <img src="/images/logo.svg" alt="Logo" className="w-8 h-8 mr-2" />
              <h3 className="font-bold text-lg">Australia Travel Blog</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Discover breathtaking landscapes, vibrant cities, and authentic local experiences across Australia.
            </p>
            <div className="flex space-x-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-muted-foreground hover:text-primary transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/directory" className="text-muted-foreground hover:text-primary transition-colors">
                  Travel Directory
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Popular Destinations */}
          <div>
            <h3 className="font-bold text-lg mb-4">Popular Destinations</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/destinations/sydney" className="text-muted-foreground hover:text-primary transition-colors">
                  Sydney
                </Link>
              </li>
              <li>
                <Link href="/destinations/melbourne" className="text-muted-foreground hover:text-primary transition-colors">
                  Melbourne
                </Link>
              </li>
              <li>
                <Link href="/destinations/gold-coast" className="text-muted-foreground hover:text-primary transition-colors">
                  Gold Coast
                </Link>
              </li>
              <li>
                <Link href="/destinations/great-barrier-reef" className="text-muted-foreground hover:text-primary transition-colors">
                  Great Barrier Reef
                </Link>
              </li>
              <li>
                <Link href="/destinations/uluru" className="text-muted-foreground hover:text-primary transition-colors">
                  Uluru
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 text-primary" />
                <span className="text-muted-foreground">123 Travel Street, Sydney, NSW 2000, Australia</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-primary" />
                <span className="text-muted-foreground">+61 2 1234 5678</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-primary" />
                <a href="mailto:info@australiatravelblog.com" className="text-muted-foreground hover:text-primary transition-colors">
                  info@australiatravelblog.com
                </a>
              </li>
              <li className="flex items-center">
                <Rss size={18} className="mr-2 text-primary" />
                <Link href="/rss" className="text-muted-foreground hover:text-primary transition-colors">
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            © {currentYear} {config.blog.copyright}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/sitemap.xml" className="text-muted-foreground hover:text-primary transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
