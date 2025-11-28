import { Request, Response } from "express";
import { IVehicleRepository } from "@vip-ride/domain/contracts/IVehicleRepository";
import { Vehicle } from "@vip-ride/domain/entities/Vehicle";
import { VehiclePublicDTO } from "@vip-ride/application/dtos/public/VehiclePublicDTO";

export class PublicVehicleController {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  list = async (req: Request, res: Response) => {
    const vehicles = await this.vehicleRepository.findAll();
    const data = vehicles.map((vehicle, index) => this.mapVehicleToPublicDTO(vehicle, index, req));
    return res.json(data);
  };

  private mapVehicleToPublicDTO(vehicle: Vehicle, index: number, req?: Request): VehiclePublicDTO {
    const data = vehicle.data;
    const descriptionLong = data.description ?? "";
    const descriptionShort = descriptionLong ? descriptionLong.slice(0, 140) : "";
    const sortOrder = index + 1;
    const hasChauffeur = data.types.includes("chauffeur");

    let mainImage = null;
    if (data.imageUrl) {
      // If it's already a full URL (starts with http:// or https://), use as is
      if (data.imageUrl.startsWith("http://") || data.imageUrl.startsWith("https://")) {
        mainImage = data.imageUrl;
      } else {
        // Relative path - convert to full URL
        const apiBaseUrl = process.env.API_BASE_URL || 
                         process.env.RENDER_EXTERNAL_URL || 
                         (req ? `${req.protocol}://${req.get("host")}` : "");
        const relativePath = data.imageUrl.startsWith("/") ? data.imageUrl : `/${data.imageUrl}`;
        mainImage = apiBaseUrl ? `${apiBaseUrl}${relativePath}` : relativePath;
      }
    }

    return {
      id: Number.parseInt(data.id, 10) || sortOrder,
      name: data.name,
      slug: data.slug,
      types: data.types,
      mainImage,
      gallery: mainImage ? [mainImage] : [],
      passengerCapacity: data.capacity,
      luggageCapacity: Math.max(1, Math.floor(data.capacity / 2)),
      basePrice: data.basePrice,
      kmPrice: data.kmPrice,
      baseMultiplier: hasChauffeur ? 1.2 : 1,
      features: [],
      popular: sortOrder < 3,
      descriptionShort,
      descriptionLong,
      sortOrder,
    };
  }
}


