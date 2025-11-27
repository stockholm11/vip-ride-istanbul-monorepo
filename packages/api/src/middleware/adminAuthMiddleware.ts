import { NextFunction, Request, Response } from "express";
import { AdminAuthService } from "@vip-ride/application/services/AdminAuthService";
import { AdminUserDTO } from "@vip-ride/application/dtos/AdminUserDTO";

type AdminRequest = Request & { user?: AdminUserDTO };

export function createAdminAuthMiddleware(adminAuthService: AdminAuthService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    const decoded = adminAuthService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as AdminRequest).user = decoded;
    next();
  };
}


