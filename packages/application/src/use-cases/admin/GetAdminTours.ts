import { ITourRepository } from "@vip-ride/domain/contracts/ITourRepository";
import { Tour, TourProps } from "@vip-ride/domain/entities/Tour";
import { TourDTO } from "../../dto/TourDTO";

export const mapTourToDTO = (tour: Tour): TourDTO => {
  // Access isActive from tour.data - ensure it's always a boolean
  const tourData = tour.data;
  const isActive = (tourData as any).isActive === true;
  return {
    id: tour.data.id,
    categoryId: tour.data.categoryId,
    categoryName: tour.data.categoryName,
    categorySlug: tour.data.categorySlug,
    vehicleId: tour.data.vehicleId,
    vehicleName: tour.data.vehicleName,
    vehicleSlug: tour.data.vehicleSlug,
    title: tour.data.title,
    slug: tour.data.slug,
    shortDescription: tour.data.shortDescription ?? null,
    longDescription: tour.data.longDescription ?? null,
    price: tour.data.price,
    imageUrl: tour.data.imageUrl ?? null,
    durationMinutes: tour.data.durationMinutes ?? null,
    durationHours: tour.data.durationMinutes
      ? Math.max(1, Math.round(tour.data.durationMinutes / 60))
      : null,
    capacity: tour.data.capacity ?? null,
    isActive,
    createdAt: tour.data.createdAt?.toISOString(),
  };
};

export class GetAdminToursUseCase {
  constructor(private readonly tourRepository: ITourRepository) {}

  async execute(): Promise<TourDTO[]> {
    const tours = await this.tourRepository.findAllAdmin();
    return tours.map(mapTourToDTO);
  }
}

