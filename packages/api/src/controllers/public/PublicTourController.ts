import { Request, Response } from "express";
import { ITourRepository } from "@vip-ride/domain/contracts/ITourRepository";
import { Tour } from "@vip-ride/domain/entities/Tour";
import { TourPublicDTO } from "@vip-ride/application/dtos/public/TourPublicDTO";

export class PublicTourController {
  constructor(private readonly tourRepository: ITourRepository) {}

  list = async (req: Request, res: Response) => {
    const tours = await this.tourRepository.findAll();
    const data = tours.map((tour, index) => this.mapTourToPublicDTO(tour, index, req));
    return res.json(data);
  };

  detail = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const tours = await this.tourRepository.findAll();
    const tour = tours.find((item) => item.data.slug === slug);

    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const dto = this.mapTourToPublicDTO(tour, tours.indexOf(tour), req);
    return res.json(dto);
  };

  private mapTourToPublicDTO(tour: Tour, index: number, req?: Request): TourPublicDTO {
    const data = tour.data;
    const longDescription =
      data.longDescription ?? data.shortDescription ?? "";
    const shortDescription = longDescription.slice(0, 140);
    const sortOrder = index + 1;
    const durationMinutes = data.durationMinutes ?? null;
    const capacity = data.capacity ?? null;

    // Convert imageUrl to full URL if it's relative
    let imageUrl = data.imageUrl ?? "";
    if (imageUrl && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      const apiBaseUrl = process.env.API_BASE_URL || 
                         process.env.RENDER_EXTERNAL_URL || 
                         (req ? `${req.protocol}://${req.get("host")}` : "");
      const relativePath = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
      imageUrl = apiBaseUrl ? `${apiBaseUrl}${relativePath}` : relativePath;
    }

    return {
      id: Number.parseInt(data.id, 10) || sortOrder,
      title: data.title,
      slug: data.slug,
      imageUrl,
      gallery: imageUrl ? [imageUrl] : [],
      durationMinutes: durationMinutes ?? null,
      includes: [],
      price: data.price,
      isActive: data.isActive ?? false,
      shortDescription,
      longDescription,
      capacity: capacity ?? null,
      category: {
        id: Number.parseInt(data.categoryId, 10) || sortOrder,
        name: data.categoryName,
        slug: data.categorySlug,
      },
      vehicle: {
        id: Number.parseInt(data.vehicleId, 10) || sortOrder,
        name: data.vehicleName,
        slug: data.vehicleSlug,
      },
      sortOrder,
    };
  }
}


