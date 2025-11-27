import { IEmailSender } from "../../ports/IEmailSender";

interface SendContactEmailInput {
  name: string;
  email: string;
  phone: string;
  message: string;
}

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export class SendContactEmailUseCase {
  constructor(private readonly emailSender: IEmailSender) {}

  async execute(input: SendContactEmailInput) {
    const { name, email, phone, message } = input;
    
    // Escape user input to prevent HTML injection
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMessage = escapeHtml(message);

    // Kullanıcıya gönderilecek onay e-postası
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937;">Mesajınız Alındı</h2>
        <p>Sayın ${safeName},</p>
        <p>İletişim formunuzdan gönderdiğiniz mesaj başarıyla alındı. En kısa sürede size geri dönüş yapacağız.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Mesajınız</h3>
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>
        <p>Teşekkür ederiz.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">VIP Ride Istanbul</p>
      </div>
    `;

    // Önce kullanıcıya onay e-postası gönder
    await this.emailSender.send(
      email,
      "Mesajınız Alındı - VIP Ride Istanbul",
      userEmailHtml
    );

    // Kullanıcıya e-posta başarıyla gönderildiyse admin'e e-posta gönder
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1f2937;">Yeni İletişim Formu Mesajı</h2>
        <p>Web sitesinden yeni bir iletişim formu mesajı alındı.</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Gönderen Bilgileri</h3>
          <p><strong>İsim:</strong> ${safeName}</p>
          <p><strong>E-posta:</strong> ${safeEmail}</p>
          <p><strong>Telefon:</strong> ${safePhone}</p>
        </div>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Mesaj</h3>
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">VIP Ride Istanbul - İletişim Formu</p>
      </div>
    `;

    // Admin'e e-posta gönder
    await this.emailSender.send(
      "info@viprideistanbulairport.com",
      `Yeni İletişim Formu Mesajı - ${safeName}`,
      adminEmailHtml
    );
  }
}

