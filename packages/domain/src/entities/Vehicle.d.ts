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
export declare class Vehicle {
    private readonly props;
    constructor(props: VehicleProps);
    get data(): VehicleProps;
}
