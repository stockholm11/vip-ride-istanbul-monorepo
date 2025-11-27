export interface TourProps {
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
  capacity?: number | null;
  isActive?: boolean;
  createdAt?: Date;
}

export class Tour {
  constructor(private readonly props: TourProps) {}

  get data() {
    // Return a new object to ensure all properties including optional ones are included
    return { ...this.props };
  }
}

