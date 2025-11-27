import { Request, Response } from "express";
import { IVehicleRepository } from "@vip-ride/domain/contracts/IVehicleRepository";
import { ITourRepository } from "@vip-ride/domain/contracts/ITourRepository";
import { CalculateTransferPriceUseCase } from "@vip-ride/application/use-cases/pricing/CalculateTransferPrice";
import { CalculateChauffeurPriceUseCase } from "@vip-ride/application/use-cases/pricing/CalculateChauffeurPrice";
import { CalculateTourPriceUseCase } from "@vip-ride/application/use-cases/pricing/CalculateTourPrice";

export class PricingController {
  constructor(
    private readonly vehicleRepository: IVehicleRepository,
    private readonly tourRepository: ITourRepository,
    private readonly calculateTransferPriceUseCase: CalculateTransferPriceUseCase,
    private readonly calculateChauffeurPriceUseCase: CalculateChauffeurPriceUseCase,
    private readonly calculateTourPriceUseCase: CalculateTourPriceUseCase
  ) {}

  calculateTransferPrice = async (req: Request, res: Response) => {
    try {
      const { vehicleId, distanceKm, roundTrip } = req.body;

      if (!vehicleId) {
        return res.status(400).json({ message: "vehicleId is required" });
      }

      if (distanceKm === undefined || distanceKm === null) {
        return res.status(400).json({ message: "distanceKm is required" });
      }

      // Get vehicle from repository
      const vehicles = await this.vehicleRepository.findAll();
      const vehicle = vehicles.find((v) => v.data.id === vehicleId);

      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const vehicleData = vehicle.data;

      // Calculate price: Only distance × kmPrice (basePrice is NOT used for transfer)
      const price = this.calculateTransferPriceUseCase.execute({
        vehicleId,
        kmPrice: vehicleData.kmPrice,
        distanceKm: Number(distanceKm),
        roundTrip: roundTrip === true,
      });

      return res.json({
        vehicleId,
        price: price.amount,
        currency: price.currency,
        distanceKm: Number(distanceKm),
        roundTrip: roundTrip === true,
      });
    } catch (error) {
      console.error("Error calculating transfer price:", error);
      return res.status(500).json({
        message: "Failed to calculate transfer price",
        error: (error as Error).message,
      });
    }
  };

  calculateChauffeurPrice = async (req: Request, res: Response) => {
    try {
      const { vehicleId, durationHours } = req.body;

      if (!vehicleId) {
        return res.status(400).json({ message: "vehicleId is required" });
      }

      if (durationHours === undefined || durationHours === null) {
        return res.status(400).json({ message: "durationHours is required" });
      }

      // Get vehicle from repository
      const vehicles = await this.vehicleRepository.findAll();
      const vehicle = vehicles.find((v) => v.data.id === vehicleId);

      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const vehicleData = vehicle.data;

      // Calculate price
      const price = this.calculateChauffeurPriceUseCase.execute({
        vehicleId,
        basePrice: vehicleData.basePrice,
        durationHours: Number(durationHours),
      });

      return res.json({
        vehicleId,
        price: price.amount,
        currency: price.currency,
        durationHours: Number(durationHours),
        hourlyRate: vehicleData.basePrice,
      });
    } catch (error) {
      console.error("Error calculating chauffeur price:", error);
      return res.status(500).json({
        message: "Failed to calculate chauffeur price",
        error: (error as Error).message,
      });
    }
  };

  calculateTourPrice = async (req: Request, res: Response) => {
    try {
      const { tourId, numberOfPersons } = req.body;

      if (!tourId) {
        return res.status(400).json({ message: "tourId is required" });
      }

      if (numberOfPersons === undefined || numberOfPersons === null || numberOfPersons < 1) {
        return res.status(400).json({ message: "numberOfPersons is required and must be at least 1" });
      }

      // Get tour from repository
      const tours = await this.tourRepository.findAll();
      const tour = tours.find((t) => t.data.id === tourId || t.data.slug === tourId);

      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }

      const tourData = tour.data;

      // Calculate price: tourPrice is per person, multiply by number of persons
      const price = this.calculateTourPriceUseCase.execute({
        tourId,
        tourPrice: tourData.price,
        numberOfPersons: Number(numberOfPersons),
      });

      return res.json({
        tourId,
        price: price.amount,
        currency: price.currency,
        numberOfPersons: Number(numberOfPersons),
        pricePerPerson: tourData.price,
      });
    } catch (error) {
      console.error("Error calculating tour price:", error);
      return res.status(500).json({
        message: "Failed to calculate tour price",
        error: (error as Error).message,
      });
    }
  };
}

