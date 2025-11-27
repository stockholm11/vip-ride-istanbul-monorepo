export interface TourPublicDTO {
  id: number;
  title: string;
  slug: string;
  imageUrl: string;
  gallery: string[];
  durationMinutes: number | null;
  includes: string[];
  price: number;
  isActive: boolean;
  shortDescription: string;
  longDescription: string;
  capacity: number | null;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  vehicle: {
    id: number;
    name: string;
    slug: string;
  };
  sortOrder: number;
}


