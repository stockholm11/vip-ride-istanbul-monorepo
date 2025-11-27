export interface IEmailSender {
  send(to: string, subject: string, html: string): Promise<void>;
}

