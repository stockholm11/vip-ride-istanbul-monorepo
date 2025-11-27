import { Router } from "express";
import { PaymentController } from "../controllers/PaymentController";

export function createPaymentRoutes(paymentController: PaymentController): Router {
  const router = Router();

  router.post("/charge", paymentController.charge);

  return router;
}


