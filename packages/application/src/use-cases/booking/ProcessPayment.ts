import { IPaymentProvider } from "../../ports/IPaymentProvider";

export class ProcessPaymentUseCase {
  constructor(private readonly paymentProvider: IPaymentProvider) {}

  async execute(request: any) {
    return this.paymentProvider.charge(request);
  }
}

