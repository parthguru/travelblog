import Link from "next/link";
import { GetPostsResult } from "@/lib/wisp";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BlogPostsPaginationProps {
  pagination: GetPostsResult["pagination"];
}

export const BlogPostsPagination = ({
  pagination,
}: BlogPostsPaginationProps) => {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;

  // Create an array of page numbers to display
  const pageNumbers = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow) {
    // If total pages is less than or equal to maxPagesToShow, show all pages
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always include first page
    pageNumbers.push(1);

    // Calculate start and end of the middle section
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if we're near the beginning
    if (currentPage <= 3) {
      endPage = 4;
    }

    // Adjust if we're near the end
    if (currentPage >= totalPages - 2) {
      startPage = totalPages - 3;
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push("ellipsis-start");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("ellipsis-end");
    }

    // Always include last page
    pageNumbers.push(totalPages);
  }

  return (
    <Pagination className="my-8">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious
              href={`/?page=${currentPage - 1}`}
              aria-label="Go to previous page"
            />
          </PaginationItem>
        )}

        {pageNumbers.map((pageNumber, index) => {
          if (pageNumber === "ellipsis-start" || pageNumber === "ellipsis-end") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href={`/?page=${pageNumber}`}
                isActive={pageNumber === currentPage}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext
              href={`/?page=${currentPage + 1}`}
              aria-label="Go to next page"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
