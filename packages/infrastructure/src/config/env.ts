import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

export const env = {
  dbHost: process.env.DB_HOST ?? "",
  dbUser: process.env.DB_USER ?? "",
  dbPassword: process.env.DB_PASSWORD ?? "",
  dbName: process.env.DB_NAME ?? "",
  iyziApiKey: process.env.IYZI_API_KEY ?? "",
  iyziSecretKey: process.env.IYZI_SECRET_KEY ?? "",
  iyziBaseUrl: process.env.IYZI_BASE_URL ?? "",
  frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@vipride.com",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  emailHost: process.env.EMAIL_HOST ?? "",
  emailPort: Number(process.env.EMAIL_PORT ?? 465),
  emailUser: process.env.EMAIL_USER ?? "",
  emailPassword: process.env.EMAIL_PASSWORD ?? "",
  emailFromName: process.env.EMAIL_FROM_NAME ?? "VIP Ride Istanbul",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS ?? "",
  hostingerFtpHost: process.env.HOSTINGER_FTP_HOST ?? "",
  hostingerFtpPort: Number(process.env.HOSTINGER_FTP_PORT ?? 22),
  hostingerFtpUsername: process.env.HOSTINGER_FTP_USERNAME ?? "",
  hostingerFtpPassword: process.env.HOSTINGER_FTP_PASSWORD ?? "",
  hostingerFtpPath: process.env.HOSTINGER_FTP_PATH ?? "",
  hostingerBaseUrl: process.env.HOSTINGER_BASE_URL ?? "",
};

