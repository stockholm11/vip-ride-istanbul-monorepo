import { Router } from "express";
import { MapsController } from "../controllers/MapsController";

export function createMapsRoutes(mapsController: MapsController): Router {
  const router = Router();

  router.get("/route", mapsController.getRoute);

  return router;
}

