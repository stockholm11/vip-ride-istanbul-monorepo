declare module "iyzipay" {
  export default class Iyzipay {
    constructor(options: any);
    payment: {
      create(request: any, callback: (err: any, result: any) => void): void;
    };
  }
}

