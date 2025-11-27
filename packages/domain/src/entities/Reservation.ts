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

export class Reservation {
  private readonly props: {
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

  constructor(props: ReservationProps) {
    if (props.passengers <= 0) {
      throw new Error("Passenger count must be positive");
    }

    const pickupDatetime =
      props.pickupDatetime instanceof Date
        ? props.pickupDatetime
        : props.pickupDatetime
        ? new Date(props.pickupDatetime)
        : null;

    this.props = {
      ...props,
      paymentStatus: props.paymentStatus ?? ReservationStatus.PENDING,
      pickupDatetime,
      createdAt: props.createdAt ?? new Date(),
      id: props.id ?? "",
      reservationType: props.reservationType ?? null,
      additionalPassengers: props.additionalPassengers ?? [],
      addOns: props.addOns ?? [],
    };
  }

  get id() {
    return this.props.id;
  }

  get status() {
    return this.props.paymentStatus;
  }

  get data() {
    return this.props;
  }
}

