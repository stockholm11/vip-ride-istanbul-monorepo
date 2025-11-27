import { Price } from "@vip-ride/domain/value-objects/Price";

interface CalculateTourPriceInput {
  tourId: string;
  tourPrice: number;
  numberOfPersons: number;
}

export class CalculateTourPriceUseCase {
  execute({
    tourPrice,
    numberOfPersons,
  }: CalculateTourPriceInput): Price {
    // Tour pricing: tourPrice is per person, multiply by number of persons
    const total = tourPrice * numberOfPersons;
    
    // Round to nearest 10
    const roundedAmount = Math.round(total / 10) * 10;
    
    return Price.create(Math.max(roundedAmount, 0));
  }
}

