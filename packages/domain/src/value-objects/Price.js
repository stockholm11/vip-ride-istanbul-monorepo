"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Price = void 0;
class Price {
    constructor(amount, currency = "EUR") {
        this.amount = amount;
        this.currency = currency;
        if (amount < 0) {
            throw new Error("Price cannot be negative");
        }
    }
    static create(amount, currency) {
        return new Price(amount, currency);
    }
}
exports.Price = Price;
