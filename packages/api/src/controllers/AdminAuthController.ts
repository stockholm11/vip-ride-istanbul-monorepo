import { Request, Response } from "express";
import { AdminAuthService } from "@vip-ride/application/services/AdminAuthService";
import { AdminUserDTO } from "@vip-ride/application/dtos/AdminUserDTO";

type AdminRequest = Request & { user?: AdminUserDTO };

export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await this.adminAuthService.validateCredentials(email, password);

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = this.adminAuthService.generateToken(admin);

    return res.json({ token });
  };

  me = (req: Request, res: Response) => {
    const admin = (req as AdminRequest).user;

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    return res.json({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });
  };
}


