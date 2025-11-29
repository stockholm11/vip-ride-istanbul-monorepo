import { Client as FtpClient } from "basic-ftp";
import { env } from "../../config/env";
import fs from "fs";
import path from "path";

export type UploadType = "vehicle" | "tour";

export class HostingerFtpAdapter {
  private basePath: string;
  private baseUrl: string;

  constructor() {
    this.basePath = env.hostingerFtpPath || "/public_html/uploads";
    this.baseUrl = env.hostingerBaseUrl || "";
  }

  /**
   * Upload a file to Hostinger via FTP
   * @param localFilePath - Path to the local file (temporary file on Render)
   * @param uploadType - Type of upload (vehicle or tour)
   * @returns Public URL of the uploaded file
   */
  async uploadFile(localFilePath: string, uploadType: UploadType): Promise<string> {
    // Validate FTP configuration
    if (!env.hostingerFtpHost || !env.hostingerFtpUsername || !env.hostingerFtpPassword) {
      throw new Error(
        "FTP configuration is missing. Please set HOSTINGER_FTP_HOST, HOSTINGER_FTP_USERNAME, and HOSTINGER_FTP_PASSWORD environment variables."
      );
    }

    // Determine target directory based on upload type
    const targetDir = uploadType === "vehicle" ? "vehicles" : "tours";
    const remoteDir = path.join(this.basePath, targetDir).replace(/\\/g, "/");

    // Generate unique filename
    const filename = path.basename(localFilePath);
    const remotePath = path.join(remoteDir, filename).replace(/\\/g, "/");

    const client = new FtpClient();
    client.ftp.verbose = false; // Disable verbose logging

    try {
      // Connect to FTP server
      await client.access({
        host: env.hostingerFtpHost,
        port: env.hostingerFtpPort || 21,
        user: env.hostingerFtpUsername,
        password: env.hostingerFtpPassword,
        secure: false, // Use plain FTP (not FTPS)
        secureOptions: undefined,
      });

      // Ensure target directory exists
      try {
        await client.ensureDir(remoteDir);
      } catch (error) {
        // If directory creation fails, try to create parent directories
        const parentDir = path.dirname(remoteDir);
        if (parentDir !== remoteDir) {
          await client.ensureDir(parentDir);
          await client.ensureDir(remoteDir);
        } else {
          throw error;
        }
      }

      // Upload file
      await client.uploadFrom(localFilePath, remotePath);

      // Construct public URL
      const publicUrl = `${this.baseUrl}/uploads/${targetDir}/${filename}`;

      return publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to upload file to Hostinger: ${errorMessage}`);
    } finally {
      // Always close connection
      try {
        client.close();
      } catch (error) {
        // Ignore errors when closing connection
      }
    }
  }

  /**
   * Check if FTP is configured
   */
  isConfigured(): boolean {
    return !!(
      env.hostingerFtpHost &&
      env.hostingerFtpUsername &&
      env.hostingerFtpPassword &&
      env.hostingerBaseUrl
    );
  }
}

