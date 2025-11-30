import { Request, Response } from "express";
import { SendContactEmailUseCase } from "@vip-ride/application/use-cases/notification/SendContactEmail";

export class ContactController {
  constructor(private readonly sendContactEmailUseCase: SendContactEmailUseCase | undefined) {}

  sendMessage = async (req: Request, res: Response) => {
    try {
      const { name, email, phone, message } = req.body;

      // Validation
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Name is required" });
      }

      if (!email || !email.trim()) {
        return res.status(400).json({ error: "Email is required" });
      }

      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!phone || !phone.trim()) {
        return res.status(400).json({ error: "Phone is required" });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      // Send email
      if (!this.sendContactEmailUseCase) {
        console.warn("[ContactController] Email functionality is disabled - email adapter not initialized");
        return res.status(503).json({ 
          error: "Email service is currently unavailable. Please try again later or contact us directly." 
        });
      }

      await this.sendContactEmailUseCase.execute({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });

      console.log("[ContactController] ✅ Contact email sent successfully from:", email.trim());
      return res.json({ 
        success: true, 
        message: "Your message has been sent successfully. We will get back to you soon." 
      });
    } catch (error) {
      console.error("[ContactController][sendMessage] error:", error);
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: "Failed to send message" });
    }
  };
}

