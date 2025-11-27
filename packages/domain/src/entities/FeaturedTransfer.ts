export interface FeaturedTransferProps {
  id?: string;
  vehicleId: string;
  vehicleName?: string | null;
  vehicleSlug?: string | null;
  vehicleImage?: string | null;
  passengerCapacity?: number | null;
  luggageCapacity?: number | null;
  fromLocation: string;
  toLocation: string;
  estimatedTime: string;
  basePrice: number;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class FeaturedTransfer {
  private readonly props: Required<
    Omit<FeaturedTransferProps, "vehicleName" | "vehicleSlug" | "vehicleImage" | "passengerCapacity" | "luggageCapacity">
  > & {
    vehicleName: string | null;
    vehicleSlug: string | null;
    vehicleImage: string | null;
    passengerCapacity: number | null;
    luggageCapacity: number | null;
  };

  constructor(props: FeaturedTransferProps) {
    if (!props.vehicleId) {
      throw new Error("vehicleId is required");
    }

    if (!props.fromLocation?.trim() || !props.toLocation?.trim()) {
      throw new Error("fromLocation and toLocation are required");
    }

    if (!props.estimatedTime?.trim()) {
      throw new Error("estimatedTime is required");
    }

    if (!Number.isFinite(props.basePrice) || props.basePrice < 0) {
      throw new Error("basePrice must be a positive number");
    }

    this.props = {
      id: props.id ?? "",
      vehicleId: props.vehicleId,
      vehicleName: props.vehicleName ?? null,
      vehicleSlug: props.vehicleSlug ?? null,
      vehicleImage: props.vehicleImage ?? null,
      passengerCapacity: props.passengerCapacity ?? null,
      luggageCapacity: props.luggageCapacity ?? null,
      fromLocation: props.fromLocation,
      toLocation: props.toLocation,
      estimatedTime: props.estimatedTime,
      basePrice: props.basePrice,
      displayOrder: props.displayOrder ?? 0,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  get data(): FeaturedTransferProps {
    return this.props;
  }
}


