import { Price } from "@vip-ride/domain/value-objects/Price";

interface CalculateTransferPriceInput {
  vehicleId: string;
  kmPrice: number;
  distanceKm?: number;
  roundTrip?: boolean;
}

export class CalculateTransferPriceUseCase {
  execute({
    kmPrice,
    distanceKm,
    roundTrip,
  }: CalculateTransferPriceInput): Price {
    // Transfer pricing: Only distance × kmPrice (basePrice is NOT used)
    const kmComponent = distanceKm ? distanceKm * kmPrice : 0;
    
    // Apply round trip multiplier if needed
    const finalAmount = roundTrip ? kmComponent * 2 : kmComponent;
    
    // Round to nearest integer (decimal rounding)
    const roundedAmount = Math.round(finalAmount);
    
    return Price.create(Math.max(roundedAmount, 0));
  }
}

