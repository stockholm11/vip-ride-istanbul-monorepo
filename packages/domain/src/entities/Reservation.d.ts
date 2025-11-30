import { ReservationStatus } from "../enums/ReservationStatus";
import { Price } from "../value-objects/Price";
export interface AdditionalPassengerProps {
    firstName: string;
    lastName: string;
}
export interface ReservationAddOnProps {
    addOnId: string;
    addOnName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}
export interface ReservationProps {
    id?: string;
    userFullName: string;
    userEmail: string;
    userPhone?: string | null;
    vehicleId?: string | null;
    vehicleName?: string | null;
    vehicleSlug?: string | null;
    tourId?: number | null;
    tourTitle?: string | null;
    tourSlug?: string | null;
    pickupLocation?: string | null;
    dropoffLocation?: string | null;
    pickupDatetime?: Date | string | null;
    passengers: number;
    totalPrice: Price;
    paymentStatus?: ReservationStatus;
    reservationType?: string | null;
    createdAt?: Date;
    additionalPassengers?: AdditionalPassengerProps[];
    addOns?: ReservationAddOnProps[];
}
export declare class Reservation {
    private readonly props;
    constructor(props: ReservationProps);
    get id(): string;
    get status(): ReservationStatus;
    get data(): {
        id: string;
        userFullName: string;
        userEmail: string;
        userPhone?: string | null;
        vehicleId?: string | null;
        vehicleName?: string | null;
        vehicleSlug?: string | null;
        tourId?: number | null;
        tourTitle?: string | null;
        tourSlug?: string | null;
        pickupLocation?: string | null;
        dropoffLocation?: string | null;
        pickupDatetime: Date | null;
        passengers: number;
        paymentStatus: ReservationStatus;
        totalPrice: Price;
        reservationType?: string | null;
        createdAt: Date;
        additionalPassengers: AdditionalPassengerProps[];
        addOns: ReservationAddOnProps[];
    };
}
