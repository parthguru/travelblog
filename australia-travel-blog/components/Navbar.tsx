'use client';

import { Book, Menu, Search, Sunset, Trees, Zap, Map, Compass, Globe, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { ReactNode } from 'react';
import SearchBar from "./SearchBar";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  mobileExtraLinks?: {
    name: string;
    url: string;
  }[];
  auth?: {
    login: {
      text: string;
      url: string;
    };
    signup: {
      text: string;
      url: string;
    };
  };
}

export function Navbar({
  logo = {
    url: "/",
    src: "/images/logo.svg",
    alt: "Australia Travel Blog",
    title: "Australia Travel Blog",
  },
  menu = [
    { title: "Home", url: "/" },
    {
      title: "Blog",
      url: "/blog",
      items: [
        {
          title: "Latest Articles",
          url: "/blog",
          description: "Read our most recent travel stories and tips",
          icon: <Book className="h-5 w-5 text-primary" />
        },
        {
          title: "Travel Guides",
          url: "/tag/travel-guides",
          description: "Comprehensive guides to help plan your trip",
          icon: <Compass className="h-5 w-5 text-primary" />
        },
        {
          title: "Adventure Stories",
          url: "/tag/adventure",
          description: "Exciting tales from across Australia",
          icon: <Sunset className="h-5 w-5 text-primary" />
        },
        {
          title: "Travel Tips",
          url: "/tag/tips",
          description: "Expert advice for your Australian journey",
          icon: <Zap className="h-5 w-5 text-primary" />
        }
      ]
    },
    {
      title: "Destinations",
      url: "/destinations",
      items: [
        {
          title: "Sydney",
          url: "/destinations/sydney",
          description: "Explore the iconic harbor city",
          icon: <Globe className="h-5 w-5 text-primary" />
        },
        {
          title: "Melbourne",
          url: "/destinations/melbourne",
          description: "Discover the cultural capital of Australia",
          icon: <Globe className="h-5 w-5 text-primary" />
        },
        {
          title: "Gold Coast",
          url: "/destinations/gold-coast",
          description: "Sun, surf, and theme parks",
          icon: <Globe className="h-5 w-5 text-primary" />
        },
        {
          title: "Great Barrier Reef",
          url: "/destinations/great-barrier-reef",
          description: "Explore the world's largest coral reef system",
          icon: <Globe className="h-5 w-5 text-primary" />
        },
        {
          title: "All Destinations",
          url: "/destinations",
          description: "Browse all Australian destinations",
          icon: <Map className="h-5 w-5 text-primary" />
        }
      ]
    },
    {
      title: "Directory",
      url: "/directory",
      items: [
        {
          title: "Hotels & Accommodation",
          url: "/directory/hotels",
          description: "Find the perfect place to stay",
          icon: <MapPin className="h-5 w-5 text-primary" />
        },
        {
          title: "Restaurants & Cafes",
          url: "/directory/restaurants",
          description: "Discover delicious dining options",
          icon: <MapPin className="h-5 w-5 text-primary" />
        },
        {
          title: "Tours & Activities",
          url: "/directory/tours",
          description: "Exciting experiences and guided tours",
          icon: <MapPin className="h-5 w-5 text-primary" />
        },
        {
          title: "All Listings",
          url: "/directory",
          description: "Browse the complete travel directory",
          icon: <Map className="h-5 w-5 text-primary" />
        }
      ]
    },
    {
      title: "About",
      url: "/about"
    }
  ],
  mobileExtraLinks = [
    { name: "Contact", url: "/contact" },
    { name: "Privacy Policy", url: "/privacy-policy" },
  ],
  auth = {
    login: { text: "Log in", url: "#" },
    signup: { text: "Sign up", url: "#" },
  },
}: Navbar1Props) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if menu item path matches current path
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };
  
  // Handle scroll event to change navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isScrolled 
        ? "bg-background/95 backdrop-blur-md shadow-md" 
        : "bg-background"
    )}>
      <div className="container py-3">
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-8">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="w-10 h-10" alt={logo.alt} />
              <span className="text-lg font-heading font-bold">{logo.title}</span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList className="gap-1">
                  {menu.map((item) => renderMenuItem(item, isActive))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <SearchBar minimal={true} className="w-64" />
            <ThemeToggle />
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm" className="font-medium">
                <a href={auth.login.url}>{auth.login.text}</a>
              </Button>
              <Button asChild size="sm" className="font-medium">
                <a href={auth.signup.url}>{auth.signup.text}</a>
              </Button>
            </div>
          </div>
        </nav>
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            <a href={logo.url} className="flex items-center gap-2">
              <img src={logo.src} className="w-8 h-8" alt={logo.alt} />
              <span className="text-lg font-heading font-bold">{logo.title}</span>
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>
                      <a href={logo.url} className="flex items-center gap-2">
                        <img src={logo.src} className="w-8 h-8" alt={logo.alt} />
                        <span className="text-lg font-heading font-bold">
                          {logo.title}
                        </span>
                      </a>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="my-6 flex flex-col gap-6">
                    <SearchBar className="mb-2" />
                    <Accordion
                      type="single"
                      collapsible
                      className="flex w-full flex-col gap-4"
                    >
                      {menu.map((item) => renderMobileMenuItem(item, isActive))}
                    </Accordion>
                    <div className="border-t py-4">
                      <div className="grid grid-cols-2 justify-start">
                        {mobileExtraLinks.map((link, idx) => (
                          <a
                            key={idx}
                            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-accent-foreground"
                            href={link.url}
                          >
                            {link.name}
                          </a>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button asChild variant="outline" className="font-medium">
                        <a href={auth.login.url}>{auth.login.text}</a>
                      </Button>
                      <Button asChild className="font-medium">
                        <a href={auth.signup.url}>{auth.signup.text}</a>
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const renderMenuItem = (item: MenuItem, isActive: (path: string) => boolean) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title} className="text-foreground">
        <NavigationMenuTrigger 
          className={cn(
            "font-medium",
            isActive(item.url) && "text-primary"
          )}
        >
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
            {item.items.map((subItem) => (
              <li key={subItem.title}>
                <NavigationMenuLink asChild>
                  <a
                    className={cn(
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground",
                      isActive(subItem.url) && "bg-muted/80 text-foreground font-medium"
                    )}
                    href={subItem.url}
                  >
                    <div className="flex items-center gap-2">
                      {subItem.icon}
                      <div className="text-sm font-medium">
                        {subItem.title}
                      </div>
                    </div>
                    {subItem.description && (
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                        {subItem.description}
                      </p>
                    )}
                  </a>
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild>
        <a
          className={cn(
            "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-accent-foreground",
            isActive(item.url) 
              ? "text-primary font-medium" 
              : "text-foreground"
          )}
          href={item.url}
        >
          {item.title}
        </a>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem, isActive: (path: string) => boolean) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger 
          className={cn(
            "py-0 font-semibold hover:no-underline",
            isActive(item.url) && "text-primary"
          )}
        >
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2 space-y-1">
          {item.items.map((subItem) => (
            <a
              key={subItem.title}
              className={cn(
                "flex items-center gap-3 rounded-md p-3 text-sm leading-none outline-none transition-colors hover:bg-muted hover:text-accent-foreground",
                isActive(subItem.url) && "bg-muted text-foreground font-medium"
              )}
              href={subItem.url}
            >
              {subItem.icon}
              <div>
                <div className="font-medium">{subItem.title}</div>
              </div>
            </a>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a 
      key={item.title} 
      href={item.url} 
      className={cn(
        "font-semibold py-2 px-3 block rounded-md transition-colors",
        isActive(item.url) 
          ? "text-primary bg-muted/50" 
          : "hover:bg-muted/50"
      )}
    >
      {item.title}
    </a>
  );
};
