import { Router } from "express";
import { AdminVehicleController } from "../controllers/AdminVehicleController";
import { AdminTourController } from "../controllers/AdminTourController";
import { AdminCategoryController } from "../controllers/AdminCategoryController";
import { AdminReservationController } from "../controllers/AdminReservationController";
import { AdminDashboardController } from "../controllers/AdminDashboardController";
import { AddOnController } from "../controllers/AddOnController";
import { FeaturedTransferController } from "../controllers/FeaturedTransferController";

interface AdminRoutesDeps {
  vehicleController: AdminVehicleController;
  tourController: AdminTourController;
  categoryController: AdminCategoryController;
  reservationController: AdminReservationController;
  dashboardController: AdminDashboardController;
  addOnController: AddOnController;
  featuredTransferController: FeaturedTransferController;
}

export function createAdminRoutes({
  vehicleController,
  tourController,
  categoryController,
  reservationController,
  dashboardController,
  addOnController,
  featuredTransferController,
}: AdminRoutesDeps): Router {
  const router = Router();

  router.get("/vehicles", vehicleController.list);
  router.post("/vehicles", vehicleController.create);
  router.put("/vehicles/:id", vehicleController.update);
  router.delete("/vehicles/:id", vehicleController.delete);

  router.get("/tours", tourController.list);
  router.post("/tours", tourController.create);
  router.put("/tours/:id", tourController.update);
  router.delete("/tours/:id", tourController.delete);

  router.get("/tour-categories", categoryController.list);
  router.post("/tour-categories", categoryController.create);
  router.put("/tour-categories/:id", categoryController.update);
  router.delete("/tour-categories/:id", categoryController.delete);

  router.get("/add-ons", addOnController.list);
  router.post("/add-ons", addOnController.create);
  router.put("/add-ons/:id", addOnController.update);
  router.delete("/add-ons/:id", addOnController.delete);

  router.get("/featured-transfers", featuredTransferController.listAdmin);
  router.post("/featured-transfers", featuredTransferController.create);
  router.put("/featured-transfers/:id", featuredTransferController.update);
  router.delete("/featured-transfers/:id", featuredTransferController.delete);

  router.get("/reservations", reservationController.list);
  router.get("/stats/overview", dashboardController.overview);
  router.get("/stats/recent-bookings", dashboardController.recentBookings);
  router.get("/stats/popular-tours", dashboardController.popularTours);

  return router;
}

