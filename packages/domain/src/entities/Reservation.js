"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reservation = void 0;
const ReservationStatus_1 = require("../enums/ReservationStatus");
class Reservation {
    constructor(props) {
        if (props.passengers <= 0) {
            throw new Error("Passenger count must be positive");
        }
        const pickupDatetime = props.pickupDatetime instanceof Date
            ? props.pickupDatetime
            : props.pickupDatetime
                ? new Date(props.pickupDatetime)
                : null;
        this.props = {
            ...props,
            paymentStatus: props.paymentStatus ?? ReservationStatus_1.ReservationStatus.PENDING,
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
exports.Reservation = Reservation;
