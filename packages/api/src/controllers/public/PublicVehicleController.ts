import { Request, Response } from "express";
import { IVehicleRepository } from "@vip-ride/domain/contracts/IVehicleRepository";
import { Vehicle } from "@vip-ride/domain/entities/Vehicle";
import { VehiclePublicDTO } from "@vip-ride/application/dtos/public/VehiclePublicDTO";

export class PublicVehicleController {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  list = async (_req: Request, res: Response) => {
    const vehicles = await this.vehicleRepository.findAll();
    const data = vehicles.map((vehicle, index) => this.mapVehicleToPublicDTO(vehicle, index));
    return res.json(data);
  };

  private mapVehicleToPublicDTO(vehicle: Vehicle, index: number): VehiclePublicDTO {
    const data = vehicle.data;
    const descriptionLong = data.description ?? "";
    const descriptionShort = descriptionLong ? descriptionLong.slice(0, 140) : "";
    const sortOrder = index + 1;
    const hasChauffeur = data.types.includes("chauffeur");

    let mainImage = null;
    if (data.imageUrl) {
      mainImage = data.imageUrl.startsWith("/") ? data.imageUrl : `/${data.imageUrl}`;
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


