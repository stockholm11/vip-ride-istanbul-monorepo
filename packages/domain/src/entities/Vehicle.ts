export type VehicleType = "transfer" | "chauffeur";

export interface VehicleProps {
  id: string;
  name: string;
  slug: string;
  types: VehicleType[];
  capacity: number;
  basePrice: number;
  kmPrice: number;
  imageUrl?: string | null;
  description?: string | null;
  createdAt?: Date;
}

export class Vehicle {
  constructor(private readonly props: VehicleProps) {}

  get data() {
    return this.props;
  }
}

