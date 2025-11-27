import { Price } from "@vip-ride/domain/value-objects/Price";

interface CalculateChauffeurPriceInput {
  vehicleId: string;
  basePrice: number;
  durationHours: number;
}

export class CalculateChauffeurPriceUseCase {
  execute({
    basePrice,
    durationHours,
  }: CalculateChauffeurPriceInput): Price {
    // For chauffeur service, basePrice is hourly rate
    const total = basePrice * durationHours;
    
    // Round to nearest 10
    const roundedAmount = Math.round(total / 10) * 10;
    
    return Price.create(Math.max(roundedAmount, 0));
  }
}

