import { Router, RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { createReservationController } from "../controllers/ReservationController";
import { PublicVehicleController } from "../controllers/public/PublicVehicleController";
import { PublicTourController } from "../controllers/public/PublicTourController";
import { PublicCategoryController } from "../controllers/public/PublicCategoryController";
import { AddOnController } from "../controllers/AddOnController";
import { FeaturedTransferController } from "../controllers/FeaturedTransferController";
import { ContactController } from "../controllers/ContactController";
import { CreateReservationUseCase } from "@vip-ride/application/use-cases/booking/CreateReservation";
import { GetReservationsUseCase } from "@vip-ride/application/use-cases/booking/GetReservations";
import { SendBookingEmailUseCase } from "@vip-ride/application/use-cases/notification/SendBookingEmail";
import { ProcessPaymentUseCase } from "@vip-ride/application/use-cases/booking/ProcessPayment";
import { createPublicRoutes } from "./publicRoutes";
import { AdminAuthController } from "../controllers/AdminAuthController";

// Rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false, // Disable trust proxy validation (trust proxy is set to 1 in server.ts for Render)
  },
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false, // Disable trust proxy validation (trust proxy is set to 1 in server.ts for Render)
  },
});

interface RoutesDeps {
  createReservationUseCase: CreateReservationUseCase;
  getReservationsUseCase: GetReservationsUseCase;
  publicVehicleController: PublicVehicleController;
  publicTourController: PublicTourController;
  publicCategoryController: PublicCategoryController;
  addOnController: AddOnController;
  featuredTransferController: FeaturedTransferController;
  contactController: ContactController;
  sendBookingEmailUseCase?: SendBookingEmailUseCase;
  processPaymentUseCase?: ProcessPaymentUseCase;
  adminRoutes: Router;
  adminAuthController: AdminAuthController;
  adminAuthMiddleware: RequestHandler;
}

export function createRoutes(deps: RoutesDeps): import("express").Router {
  const router = Router();
  
  // Apply general rate limiting to all routes
  router.use(apiLimiter);
  
  const reservationController = createReservationController({
    createReservationUseCase: deps.createReservationUseCase,
    getReservationsUseCase: deps.getReservationsUseCase,
    sendBookingEmailUseCase: deps.sendBookingEmailUseCase,
    processPaymentUseCase: deps.processPaymentUseCase,
  });

  router.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  router.get("/reservations", reservationController.list);
  router.post("/reservations", reservationController.create);

  const publicRoutes = createPublicRoutes({
    vehicleController: deps.publicVehicleController,
    tourController: deps.publicTourController,
    categoryController: deps.publicCategoryController,
    addOnController: deps.addOnController,
    featuredTransferController: deps.featuredTransferController,
    contactController: deps.contactController,
  });

  router.use("/public", publicRoutes);

  router.post("/admin/auth/login", loginLimiter, deps.adminAuthController.login);
  router.get("/admin/auth/me", deps.adminAuthMiddleware, deps.adminAuthController.me);
  router.use("/admin", deps.adminAuthMiddleware, deps.adminRoutes);

  return router;
}

