import { ReservationStatus } from "../enums/ReservationStatus";
import { AdditionalPassengerProps, ReservationAddOnProps } from "./Reservation";
export interface AdminReservationProps {
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
    totalPrice: number;
    paymentStatus: ReservationStatus;
    reservationType?: string | null;
    createdAt: Date;
    additionalPassengers?: AdditionalPassengerProps[];
    addOns?: ReservationAddOnProps[];
}
export declare class AdminReservation {
    private readonly props;
    constructor(props: AdminReservationProps);
    get data(): AdminReservationProps;
}
