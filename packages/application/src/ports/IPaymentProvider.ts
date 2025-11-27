export interface IPaymentProvider {
  charge(request: any): Promise<any>;
}

