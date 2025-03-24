"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  className?: string;
  minimal?: boolean;
  placeholder?: string;
  initialQuery?: string;
}

export default function SearchBar({
  className,
  minimal = false,
  placeholder = 'Search blog posts and directory listings...',
  initialQuery = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus the input when active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    
    // If minimal mode, deactivate after search
    if (minimal) {
      setIsActive(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsActive(true);
      }
      
      // Close on escape
      if (e.key === 'Escape' && minimal) {
        setIsActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [minimal]);

  // Minimal search button that expands on click
  if (minimal && !isActive) {
    return (
      <Button
        variant="ghost"
        className={cn("h-9 w-9 p-0", className)}
        onClick={() => setIsActive(true)}
        title="Search (Cmd+K)"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    );
  }

  return (
    <form 
      onSubmit={handleSearch}
      className={cn(
        "relative flex items-center",
        minimal && "transition-all duration-300",
        className
      )}
    >
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "pl-10 pr-10 h-10",
            query.length > 0 ? "pr-16" : "pr-10"
          )}
        />
        
        {query.length > 0 && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-10 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>

      <Button 
        type="submit" 
        variant="default" 
        size="sm" 
        className="ml-2"
      >
        Search
      </Button>

      {minimal && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-1 p-0 h-9 w-9"
          onClick={() => setIsActive(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </form>
  );
} 