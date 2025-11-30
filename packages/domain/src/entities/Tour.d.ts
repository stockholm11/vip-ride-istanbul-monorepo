export interface TourProps {
    id: string;
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    vehicleId: string;
    vehicleName: string;
    vehicleSlug: string;
    title: string;
    slug: string;
    shortDescription?: string | null;
    longDescription?: string | null;
    price: number;
    imageUrl?: string | null;
    durationMinutes?: number | null;
    capacity?: number | null;
    isActive?: boolean;
    createdAt?: Date;
}
export declare class Tour {
    private readonly props;
    constructor(props: TourProps);
    get data(): {
        id: string;
        categoryId: string;
        categoryName: string;
        categorySlug: string;
        vehicleId: string;
        vehicleName: string;
        vehicleSlug: string;
        title: string;
        slug: string;
        shortDescription?: string | null;
        longDescription?: string | null;
        price: number;
        imageUrl?: string | null;
        durationMinutes?: number | null;
        capacity?: number | null;
        isActive?: boolean;
        createdAt?: Date;
    };
}
