import * as React from "react"
import { cn } from "@/lib/utils"

interface BlogTagProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: string[]
  className?: string
}

export function BlogTags({ tags, className, ...props }: BlogTagProps) {
  if (!tags.length) return null
  
  return (
    <div 
      className={cn(
        "flex flex-wrap gap-2",
        className
      )} 
      {...props}
    >
      {tags.map((tag, index) => (
        <span 
          key={index} 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm shadow-black/[.12] dark:bg-accent hover:bg-accent/80 transition-colors"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
