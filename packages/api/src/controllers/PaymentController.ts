import { Request, Response } from "express";
import Iyzipay from "iyzipay";
import { env } from "@vip-ride/infrastructure/config/env";
import { ReservationRepository } from "@vip-ride/infrastructure/database/ReservationRepository";
import { ReservationStatus } from "@vip-ride/domain/enums/ReservationStatus";
import { SendBookingEmailUseCase } from "@vip-ride/application/use-cases/notification/SendBookingEmail";

const iyzipay = new Iyzipay({
  apiKey: env.iyziApiKey,
  secretKey: env.iyziSecretKey,
  uri: env.iyziBaseUrl,
});

export class PaymentController {
  constructor(
    private reservationRepository: ReservationRepository,
    private sendBookingEmailUseCase?: SendBookingEmailUseCase
  ) {}

  charge = async (req: Request, res: Response) => {
    const reservationRepository = this.reservationRepository;
    
    try {
      console.log("[PaymentController] Direct charge request:", req.body);

      const {
        reservationId,
        price,
        paidPrice,
        currency,
        cardHolderName,
        cardNumber,
        expireMonth,
        expireYear,
        cvc,
        buyer,
        billingAddress,
        shippingAddress,
        basketItems
      } = req.body;

      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: `RES-${reservationId}-${Date.now()}`,
        price: price.toString(),
        paidPrice: paidPrice.toString(),
        currency: currency || Iyzipay.CURRENCY.EUR,
        installment: "1",
        paymentCard: {
          cardHolderName,
          cardNumber,
          expireMonth,
          expireYear,
          cvc,
          registerCard: "0"
        },
        buyer,
        billingAddress,
        shippingAddress,
        basketItems
      };

      iyzipay.payment.create(request, async (err: any, result: any) => {
        if (err) {
          console.error("[Iyzico Payment Error]", err);
          // Update payment status to failed
          try {
            await reservationRepository.updatePaymentStatus(
              reservationId.toString(),
              ReservationStatus.FAILED
            );
            console.log("[PaymentController] Payment status updated to FAILED for reservation:", reservationId);
          } catch (updateError) {
            console.error("[PaymentController] Failed to update payment status to failed:", updateError);
          }
          return res.status(500).json({ success: false, error: err });
        }

        // Check if payment was successful
        // Iyzico returns status: "success" for successful payments
        const isPaymentSuccessful = result.status === "success";
        
        if (isPaymentSuccessful) {
          // Update payment status to paid
          try {
            await reservationRepository.updatePaymentStatus(
              reservationId.toString(),
              ReservationStatus.PAID
            );
            console.log("[PaymentController] Payment status updated to PAID for reservation:", reservationId);

            // Send confirmation email asynchronously (don't block the response)
            const emailUseCase = this.sendBookingEmailUseCase;
            if (emailUseCase) {
              console.log("[PaymentController] Attempting to send confirmation email for reservation:", reservationId);
              // Fire and forget - don't await to avoid blocking the response
              (async () => {
                try {
                  const reservation = await reservationRepository.findById(reservationId.toString());
                  if (reservation) {
                    const reservationData = reservation.data;
                    console.log("[PaymentController] Reservation found, preparing email to:", reservationData.userEmail);
                    // Get reservation type from data (it should be in the data object)
                    const reservationType = (reservationData as any).reservationType || "rezervasyon";
                    const typeLabel = reservationType === "tour" ? "Tur" : reservationType === "transfer" ? "Transfer" : reservationType === "chauffeur" ? "Şoför Hizmeti" : "Rezervasyon";
                    
                    // Build add-ons HTML if they exist
                    let addOnsHtml = '';
                    if (reservationData.addOns && reservationData.addOns.length > 0) {
                      addOnsHtml = `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                          <h4 style="color: #1f2937; margin-top: 0; margin-bottom: 10px;">Ek Hizmetler</h4>
                          <table style="width: 100%; border-collapse: collapse;">
                            ${reservationData.addOns.map(addOn => `
                              <tr>
                                <td style="padding: 5px 0; color: #4b5563;">${addOn.addOnName} x ${addOn.quantity}</td>
                                <td style="text-align: right; padding: 5px 0; color: #1f2937; font-weight: 600;">€${addOn.totalPrice.toFixed(2)}</td>
                              </tr>
                            `).join('')}
                          </table>
                        </div>
                      `;
                    }

                    console.log("[PaymentController] Executing email use case...");
                    await emailUseCase.execute({
                      to: reservationData.userEmail,
                      subject: `${typeLabel} Rezervasyon Onayı - VIP Ride Istanbul`,
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                          <h2 style="color: #1f2937;">Rezervasyon Onayı</h2>
                          <p>Sayın ${reservationData.userFullName},</p>
                          <p>Rezervasyonunuz başarıyla oluşturuldu ve ödemeniz tamamlandı.</p>
                          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1f2937; margin-top: 0;">Rezervasyon Detayları</h3>
                            <p><strong>Rezervasyon ID:</strong> ${reservationData.id}</p>
                            <p><strong>Hizmet:</strong> ${typeLabel}</p>
                            ${reservationData.tourTitle ? `<p><strong>Tur:</strong> ${reservationData.tourTitle}</p>` : ''}
                            ${reservationData.vehicleName ? `<p><strong>Araç:</strong> ${reservationData.vehicleName}</p>` : ''}
                            <p><strong>Yolcu Sayısı:</strong> ${reservationData.passengers}</p>
                            ${reservationData.pickupLocation ? `<p><strong>Alış Noktası:</strong> ${reservationData.pickupLocation}</p>` : ''}
                            ${reservationData.dropoffLocation ? `<p><strong>Bırakış Noktası:</strong> ${reservationData.dropoffLocation}</p>` : ''}
                            ${reservationData.pickupDatetime ? `<p><strong>Tarih/Saat:</strong> ${new Date(reservationData.pickupDatetime).toLocaleString('tr-TR')}</p>` : ''}
                            ${addOnsHtml}
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #1f2937;">
                              <p style="margin: 0;"><strong>Toplam Tutar:</strong> <span style="font-size: 18px; color: #1f2937;">€${reservationData.totalPrice.amount.toFixed(2)}</span></p>
                            </div>
                          </div>
                          <p>Rezervasyonunuz için teşekkür ederiz.</p>
                          <p>İyi yolculuklar dileriz.</p>
                          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">VIP Ride Istanbul</p>
                        </div>
                      `,
                    });
                    console.log("[PaymentController] ✅ Confirmation email sent successfully to:", reservationData.userEmail);
                  } else {
                    console.warn("[PaymentController] ⚠️ Reservation not found for ID:", reservationId);
                  }
                } catch (emailError) {
                  const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
                  const errorStack = emailError instanceof Error ? emailError.stack : undefined;
                  console.error("[PaymentController] ❌ Failed to send confirmation email:", errorMessage);
                  if (errorStack) {
                    console.error("[PaymentController] Email error stack:", errorStack);
                  }
                  // Don't fail the payment if email fails
                }
              })();
            } else {
              console.warn("[PaymentController] ⚠️ Email use case not available - email functionality disabled");
            }
          } catch (updateError) {
            console.error("[PaymentController] Failed to update payment status to paid:", updateError);
          }
        } else {
          // Payment failed or was not successful
          try {
            await reservationRepository.updatePaymentStatus(
              reservationId.toString(),
              ReservationStatus.FAILED
            );
            console.log("[PaymentController] Payment status updated to FAILED for reservation:", reservationId);
          } catch (updateError) {
            console.error("[PaymentController] Failed to update payment status to failed:", updateError);
          }
        }

        console.log("[Iyzico Payment Success]", result);
        return res.json({ success: isPaymentSuccessful, result });
      });

    } catch (err) {
      console.error("[PaymentController] Charge exception:", err);
      // Update payment status to failed on exception
      try {
        await this.reservationRepository.updatePaymentStatus(
          req.body.reservationId?.toString() || "",
          ReservationStatus.FAILED
        );
      } catch (updateError) {
        console.error("[PaymentController] Failed to update payment status to failed in catch block:", updateError);
      }
      res.status(500).json({ success: false, error: err });
    }
  };
}


