import "express";
import { AdminUserDTO } from "@vip-ride/application/dtos/AdminUserDTO";

declare module "express-serve-static-core" {
  interface Request {
    user?: AdminUserDTO;
  }
}

export {};



