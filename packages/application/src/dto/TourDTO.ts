export interface TourDTO {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  vehicleId: string;
  vehicleName: string;
  vehicleSlug: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  longDescription?: string | null;
  price: number;
  imageUrl?: string | null;
  durationMinutes?: number | null;
  durationHours?: number | null;
  capacity?: number | null;
  isActive?: boolean;
  createdAt?: string;
}

