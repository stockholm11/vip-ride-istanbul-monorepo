import { PublicTour } from "../../types/public";
import { TourType } from "../../components/TourCard";

export const mapPublicTourToTourType = (tour: PublicTour): TourType => {
  const durationMinutes = tour.durationMinutes ?? null;
  const durationHours =
    durationMinutes !== null && durationMinutes !== undefined
      ? Math.max(1, Math.min(12, Math.round(durationMinutes / 60)))
      : undefined;

  return {
    id: tour.slug,
    tourId: tour.id,
    slug: tour.slug,
    title: tour.title,
    description: tour.shortDescription || tour.longDescription,
    image: tour.imageUrl,
    price: tour.price,
    duration: durationHours,
    durationMinutes: durationMinutes ?? undefined,
    capacity: tour.capacity ?? undefined,
    includes: tour.includes || [],
    category: {
      id: tour.category?.id,
      name: tour.category?.name || "",
      slug: tour.category?.slug || "",
    },
    vehicle: {
      id: tour.vehicle?.id,
      name: tour.vehicle?.name || "",
      slug: tour.vehicle?.slug || "",
    },
    gallery: tour.gallery,
    shortDescription: tour.shortDescription,
    longDescription: tour.longDescription,
  };
};


