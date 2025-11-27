import { IEmailSender } from "../../ports/IEmailSender";

interface SendBookingEmailInput {
  to: string;
  subject: string;
  html: string;
}

export class SendBookingEmailUseCase {
  constructor(private readonly emailSender: IEmailSender) {}

  async execute(input: SendBookingEmailInput) {
    await this.emailSender.send(input.to, input.subject, input.html);
  }
}

