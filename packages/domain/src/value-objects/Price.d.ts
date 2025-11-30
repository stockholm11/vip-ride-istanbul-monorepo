export declare class Price {
    readonly amount: number;
    readonly currency: "EUR" | "USD" | "TRY";
    private constructor();
    static create(amount: number, currency?: "EUR" | "USD" | "TRY"): Price;
}
