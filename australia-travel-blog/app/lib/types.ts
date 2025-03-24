// Directory types
export interface DirectoryListing {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  price_range: string | null;
  hours: string | null; // JSON string
  images: string | null; // JSON string array
  category_id: number;
  category_name: string; // Joined field
  category_slug: string; // Joined field
  slug: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface DirectoryCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    nextOffset: number | null;
    previousOffset: number | null;
  };
}

export interface ListingFilterOptions {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  category?: string | null;
  location?: string | null;
  featured?: boolean | null;
  search?: string | null;
}

// Hours interface for the directory listings
export interface BusinessHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
} 