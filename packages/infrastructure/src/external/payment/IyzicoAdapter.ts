import Iyzipay from "iyzipay";
import { env } from "../../config/env";
import { IPaymentProvider } from "@vip-ride/application/ports/IPaymentProvider";

const iyzipay = new Iyzipay({
  apiKey: env.iyziApiKey,
  secretKey: env.iyziSecretKey,
  uri: env.iyziBaseUrl,
});

export class IyzicoAdapter implements IPaymentProvider {
  charge(request: any) {
    return new Promise((resolve, reject) => {
      iyzipay.payment.create(request, (err: any, result: any) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

