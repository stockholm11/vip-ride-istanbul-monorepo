import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AdminUserDTO } from "../dtos/AdminUserDTO";

interface AdminAuthConfig {
  adminEmail: string;
  adminPasswordHash: string;
  jwtSecret: string;
}

export class AdminAuthService {
  private readonly adminUser: AdminUserDTO;

  constructor(private readonly config: AdminAuthConfig) {
    this.adminUser = {
      id: 1,
      email: config.adminEmail,
      passwordHash: config.adminPasswordHash,
      role: "admin",
    };
  }

  static async hashPassword(value: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(value, saltRounds);
  }

  async validateCredentials(email: string, password: string): Promise<AdminUserDTO | null> {
    if (!email || !password) {
      return null;
    }

    if (email !== this.adminUser.email) {
      return null;
    }

    // Support both bcrypt and legacy SHA-256 hashes for migration
    const isBcryptHash = this.adminUser.passwordHash.startsWith("$2");
    let isValid = false;

    if (isBcryptHash) {
      isValid = await bcrypt.compare(password, this.adminUser.passwordHash);
    } else {
      // Legacy SHA-256 support (for migration period)
      const { createHash } = await import("crypto");
      const hashedInput = createHash("sha256").update(password).digest("hex");
      isValid = hashedInput === this.adminUser.passwordHash;
    }

    if (isValid) {
      return this.adminUser;
    }

    return null;
  }

  generateToken(adminUser: AdminUserDTO): string {
    return jwt.sign(
      {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
      this.config.jwtSecret,
      {
        expiresIn: "8h",
      }
    );
  }

  verifyToken(token: string): AdminUserDTO | null {
    try {
      const decoded = jwt.verify(token, this.config.jwtSecret) as jwt.JwtPayload & {
        sub: number;
        email: string;
        role: "admin";
      };

      return {
        id: typeof decoded.sub === "number" ? decoded.sub : this.adminUser.id,
        email: decoded.email ?? this.adminUser.email,
        passwordHash: this.adminUser.passwordHash,
        role: decoded.role ?? "admin",
      };
    } catch {
      return null;
    }
  }
}


