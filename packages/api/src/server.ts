import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(__dirname, "../../infrastructure/.env"),
});

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createRoutes } from "./routes";
import { createAdminRoutes } from "./routes/adminRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { ReservationRepository } from "@vip-ride/infrastructure/database/ReservationRepository";
import { VehicleRepository } from "@vip-ride/infrastructure/database/VehicleRepository";
import { TourRepository } from "@vip-ride/infrastructure/database/TourRepository";
import { TourCategoryRepository } from "@vip-ride/infrastructure/database/TourCategoryRepository";
import { AddOnRepository } from "@vip-ride/infrastructure/database/AddOnRepository";
import { FeaturedTransferRepository } from "@vip-ride/infrastructure/database/FeaturedTransferRepository";
import { NodemailerAdapter } from "@vip-ride/infrastructure/external/email/NodemailerAdapter";
import { IyzicoAdapter } from "@vip-ride/infrastructure/external/payment/IyzicoAdapter";
import { CreateReservationUseCase } from "@vip-ride/application/use-cases/booking/CreateReservation";
import { GetReservationsUseCase } from "@vip-ride/application/use-cases/booking/GetReservations";
import { SendBookingEmailUseCase } from "@vip-ride/application/use-cases/notification/SendBookingEmail";
import { SendContactEmailUseCase } from "@vip-ride/application/use-cases/notification/SendContactEmail";
import { ProcessPaymentUseCase } from "@vip-ride/application/use-cases/booking/ProcessPayment";
import { GetAdminVehiclesUseCase } from "@vip-ride/application/use-cases/admin/GetAdminVehicles";
import { GetAdminToursUseCase } from "@vip-ride/application/use-cases/admin/GetAdminTours";
import { GetAdminTourCategoriesUseCase } from "@vip-ride/application/use-cases/admin/GetAdminTourCategories";
import { GetAdminReservationsUseCase } from "@vip-ride/application/use-cases/admin/GetAdminReservations";
import { CreateAdminVehicleUseCase } from "@vip-ride/application/use-cases/admin/CreateAdminVehicle";
import { UpdateAdminVehicleUseCase } from "@vip-ride/application/use-cases/admin/UpdateAdminVehicle";
import { DeleteAdminVehicleUseCase } from "@vip-ride/application/use-cases/admin/DeleteAdminVehicle";
import { CreateAdminTourUseCase } from "@vip-ride/application/use-cases/admin/CreateAdminTour";
import { UpdateAdminTourUseCase } from "@vip-ride/application/use-cases/admin/UpdateAdminTour";
import { DeleteAdminTourUseCase } from "@vip-ride/application/use-cases/admin/DeleteAdminTour";
import { CreateAdminCategoryUseCase } from "@vip-ride/application/use-cases/admin/CreateAdminCategory";
import { UpdateAdminCategoryUseCase } from "@vip-ride/application/use-cases/admin/UpdateAdminCategory";
import { DeleteAdminCategoryUseCase } from "@vip-ride/application/use-cases/admin/DeleteAdminCategory";
import { GetAdminOverviewStatsUseCase } from "@vip-ride/application/use-cases/admin/GetAdminOverviewStats";
import { GetAdminRecentBookingsUseCase } from "@vip-ride/application/use-cases/admin/GetAdminRecentBookings";
import { GetAdminPopularToursUseCase } from "@vip-ride/application/use-cases/admin/GetAdminPopularTours";
import { GetAddOnsUseCase } from "@vip-ride/application/use-cases/add-on/GetAddOns";
import { CreateAddOnUseCase } from "@vip-ride/application/use-cases/add-on/CreateAddOn";
import { UpdateAddOnUseCase } from "@vip-ride/application/use-cases/add-on/UpdateAddOn";
import { DeleteAddOnUseCase } from "@vip-ride/application/use-cases/add-on/DeleteAddOn";
import { GetFeaturedTransfersUseCase } from "@vip-ride/application/use-cases/featured-transfer/GetFeaturedTransfers";
import { CreateFeaturedTransferUseCase } from "@vip-ride/application/use-cases/featured-transfer/CreateFeaturedTransfer";
import { UpdateFeaturedTransferUseCase } from "@vip-ride/application/use-cases/featured-transfer/UpdateFeaturedTransfer";
import { DeleteFeaturedTransferUseCase } from "@vip-ride/application/use-cases/featured-transfer/DeleteFeaturedTransfer";
import { AdminVehicleController } from "./controllers/AdminVehicleController";
import { AdminTourController } from "./controllers/AdminTourController";
import { AdminCategoryController } from "./controllers/AdminCategoryController";
import { AdminReservationController } from "./controllers/AdminReservationController";
import { AdminDashboardController } from "./controllers/AdminDashboardController";
import { AddOnController } from "./controllers/AddOnController";
import { FeaturedTransferController } from "./controllers/FeaturedTransferController";
import { ContactController } from "./controllers/ContactController";
import { PublicVehicleController } from "./controllers/public/PublicVehicleController";
import { PublicTourController } from "./controllers/public/PublicTourController";
import { PublicCategoryController } from "./controllers/public/PublicCategoryController";
import { PaymentController } from "./controllers/PaymentController";
import { createPaymentRoutes } from "./routes/paymentRoutes";
import { AdminAuthService } from "@vip-ride/application/services/AdminAuthService";
import { AdminAuthController } from "./controllers/AdminAuthController";
import { createAdminAuthMiddleware } from "./middleware/adminAuthMiddleware";
import uploadRoutes, { setUploadAuthMiddleware } from "./routes/uploadRoutes";
import { PricingController } from "./controllers/PricingController";
import { CalculateTransferPriceUseCase } from "@vip-ride/application/use-cases/pricing/CalculateTransferPrice";
import { CalculateChauffeurPriceUseCase } from "@vip-ride/application/use-cases/pricing/CalculateChauffeurPrice";
import { CalculateTourPriceUseCase } from "@vip-ride/application/use-cases/pricing/CalculateTourPrice";
import { createPricingRoutes } from "./routes/pricingRoutes";
import { MapsController } from "./controllers/MapsController";
import { createMapsRoutes } from "./routes/mapsRoutes";

const reservationRepository = new ReservationRepository();
const vehicleRepository = new VehicleRepository();
const tourRepository = new TourRepository();
const tourCategoryRepository = new TourCategoryRepository();
const addOnRepository = new AddOnRepository();
const featuredTransferRepository = new FeaturedTransferRepository();
const emailAdapter = new NodemailerAdapter();
const paymentAdapter = new IyzicoAdapter();

const createReservationUseCase = new CreateReservationUseCase(reservationRepository, addOnRepository);
const getReservationsUseCase = new GetReservationsUseCase(reservationRepository);
const sendBookingEmailUseCase = new SendBookingEmailUseCase(emailAdapter);
const sendContactEmailUseCase = new SendContactEmailUseCase(emailAdapter);
const processPaymentUseCase = new ProcessPaymentUseCase(paymentAdapter);

const contactController = new ContactController(sendContactEmailUseCase);

const getAdminVehiclesUseCase = new GetAdminVehiclesUseCase(vehicleRepository);
const getAdminToursUseCase = new GetAdminToursUseCase(tourRepository);
const getAdminTourCategoriesUseCase = new GetAdminTourCategoriesUseCase(tourCategoryRepository);
const getAdminReservationsUseCase = new GetAdminReservationsUseCase(reservationRepository);

const createAdminVehicleUseCase = new CreateAdminVehicleUseCase(vehicleRepository);
const updateAdminVehicleUseCase = new UpdateAdminVehicleUseCase(vehicleRepository);
const deleteAdminVehicleUseCase = new DeleteAdminVehicleUseCase(vehicleRepository);
const adminVehicleController = new AdminVehicleController(
  getAdminVehiclesUseCase,
  createAdminVehicleUseCase,
  updateAdminVehicleUseCase,
  deleteAdminVehicleUseCase
);

const createAdminTourUseCase = new CreateAdminTourUseCase(
  tourRepository,
  vehicleRepository
);
const updateAdminTourUseCase = new UpdateAdminTourUseCase(
  tourRepository,
  vehicleRepository
);
const deleteAdminTourUseCase = new DeleteAdminTourUseCase(tourRepository);
const adminTourController = new AdminTourController(
  getAdminToursUseCase,
  createAdminTourUseCase,
  updateAdminTourUseCase,
  deleteAdminTourUseCase
);

const createAdminCategoryUseCase = new CreateAdminCategoryUseCase(tourCategoryRepository);
const updateAdminCategoryUseCase = new UpdateAdminCategoryUseCase(tourCategoryRepository);
const deleteAdminCategoryUseCase = new DeleteAdminCategoryUseCase(tourCategoryRepository);
const adminCategoryController = new AdminCategoryController(
  getAdminTourCategoriesUseCase,
  createAdminCategoryUseCase,
  updateAdminCategoryUseCase,
  deleteAdminCategoryUseCase
);
const adminReservationController = new AdminReservationController(getAdminReservationsUseCase);
const getAdminOverviewStatsUseCase = new GetAdminOverviewStatsUseCase({
  vehicleRepository,
  tourRepository,
  tourCategoryRepository,
  reservationRepository,
});
const getAdminRecentBookingsUseCase = new GetAdminRecentBookingsUseCase(reservationRepository);
const getAdminPopularToursUseCase = new GetAdminPopularToursUseCase(reservationRepository);
const adminDashboardController = new AdminDashboardController(
  getAdminOverviewStatsUseCase,
  getAdminRecentBookingsUseCase,
  getAdminPopularToursUseCase
);
const publicVehicleController = new PublicVehicleController(vehicleRepository);
const publicTourController = new PublicTourController(tourRepository);
const publicCategoryController = new PublicCategoryController(tourCategoryRepository);

const getAddOnsUseCase = new GetAddOnsUseCase(addOnRepository);
const createAddOnUseCase = new CreateAddOnUseCase(addOnRepository);
const updateAddOnUseCase = new UpdateAddOnUseCase(addOnRepository);
const deleteAddOnUseCase = new DeleteAddOnUseCase(addOnRepository);
const addOnController = new AddOnController(
  getAddOnsUseCase,
  createAddOnUseCase,
  updateAddOnUseCase,
  deleteAddOnUseCase
);

const getFeaturedTransfersUseCase = new GetFeaturedTransfersUseCase(featuredTransferRepository);
const createFeaturedTransferUseCase = new CreateFeaturedTransferUseCase(featuredTransferRepository);
const updateFeaturedTransferUseCase = new UpdateFeaturedTransferUseCase(featuredTransferRepository);
const deleteFeaturedTransferUseCase = new DeleteFeaturedTransferUseCase(featuredTransferRepository);
const featuredTransferController = new FeaturedTransferController(
  getFeaturedTransfersUseCase,
  createFeaturedTransferUseCase,
  updateFeaturedTransferUseCase,
  deleteFeaturedTransferUseCase
);
const adminEmail = process.env.ADMIN_EMAIL;
const jwtSecret = process.env.JWT_SECRET;

// Validate JWT secret
if (!jwtSecret || jwtSecret === "change-me" || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters long");
}

// Get admin password hash (support both bcrypt and legacy SHA-256)
let adminPasswordHash: string | undefined;
if (process.env.ADMIN_PASSWORD_HASH) {
  adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
} else if (process.env.ADMIN_PASSWORD) {
  // For new installations, hash with bcrypt
  // Note: This is async, so we'll handle it in the service
  // For now, we'll require ADMIN_PASSWORD_HASH to be set
  throw new Error("ADMIN_PASSWORD_HASH must be set. Use: node -e \"require('bcrypt').hash('your_password', 12).then(h => console.log(h))\"");
}

if (!adminEmail || !adminPasswordHash) {
  throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD_HASH environment variables");
}

const adminAuthService = new AdminAuthService({
  adminEmail,
  adminPasswordHash,
  jwtSecret,
});
const adminAuthController = new AdminAuthController(adminAuthService);
const adminAuthMiddleware = createAdminAuthMiddleware(adminAuthService);
const paymentController = new PaymentController(reservationRepository, sendBookingEmailUseCase);

const calculateTransferPriceUseCase = new CalculateTransferPriceUseCase();
const calculateChauffeurPriceUseCase = new CalculateChauffeurPriceUseCase();
const calculateTourPriceUseCase = new CalculateTourPriceUseCase();
const pricingController = new PricingController(
  vehicleRepository,
  tourRepository,
  calculateTransferPriceUseCase,
  calculateChauffeurPriceUseCase,
  calculateTourPriceUseCase
);

const app = express();

// Trust proxy - Required for Render and other cloud platforms
// This allows express-rate-limit to correctly identify client IPs
// Set to 1 for Render (1 proxy layer) - more secure than 'true'
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.iyzipay.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.iyzipay.com", "https://maps.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow Iyzico iframe
}));

// CORS configuration
const frontendUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
app.use(cors({
  origin: frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Resolve uploads directory: works in both dev (src/) and build (dist/) modes
const uploadsPath = path.resolve(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

const adminRoutes = createAdminRoutes({
  vehicleController: adminVehicleController,
  tourController: adminTourController,
  categoryController: adminCategoryController,
  reservationController: adminReservationController,
  dashboardController: adminDashboardController,
  addOnController: addOnController,
  featuredTransferController,
});

const routes = createRoutes({
  createReservationUseCase,
  getReservationsUseCase,
  publicVehicleController,
  publicTourController,
  publicCategoryController,
  addOnController: addOnController,
  featuredTransferController,
  contactController,
  sendBookingEmailUseCase,
  processPaymentUseCase,
  adminRoutes,
  adminAuthController,
  adminAuthMiddleware,
});

const paymentRoutes = createPaymentRoutes(paymentController);
const pricingRoutes = createPricingRoutes(pricingController);
const mapsController = new MapsController();
const mapsRoutes = createMapsRoutes(mapsController);

app.use("/api", routes);
app.use("/api/payments", paymentRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/public/maps", mapsRoutes);
// Set authentication middleware for upload routes
setUploadAuthMiddleware(adminAuthMiddleware);
app.use("/api/admin/upload", uploadRoutes);
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
