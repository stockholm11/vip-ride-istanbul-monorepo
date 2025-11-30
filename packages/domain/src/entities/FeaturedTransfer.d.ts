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
export declare class FeaturedTransfer {
    private readonly props;
    constructor(props: FeaturedTransferProps);
    get data(): FeaturedTransferProps;
}
