export class Price {
  private constructor(
    public readonly amount: number,
    public readonly currency: "EUR" | "USD" | "TRY" = "EUR"
  ) {
    if (amount < 0) {
      throw new Error("Price cannot be negative");
    }
  }

  static create(amount: number, currency?: "EUR" | "USD" | "TRY") {
    return new Price(amount, currency);
  }
}

