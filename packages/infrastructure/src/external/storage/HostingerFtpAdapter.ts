import Client from "ssh2-sftp-client";
import { env } from "../../config/env";
import fs from "fs";
import path from "path";

export type UploadType = "vehicle" | "tour";

export class HostingerFtpAdapter {
  private client: Client;
  private basePath: string;
  private baseUrl: string;

  constructor() {
    this.client = new Client();
    this.basePath = env.hostingerFtpPath || "/public_html/uploads";
    this.baseUrl = env.hostingerBaseUrl || "";
  }

  /**
   * Upload a file to Hostinger via SFTP
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

    try {
      // Connect to SFTP server
      await this.client.connect({
        host: env.hostingerFtpHost,
        port: env.hostingerFtpPort,
        username: env.hostingerFtpUsername,
        password: env.hostingerFtpPassword,
        timeout: 30000, // 30 seconds
      });

      // Ensure target directory exists
      const dirExists = await this.client.exists(remoteDir);
      if (!dirExists) {
        await this.client.mkdir(remoteDir, true); // true = recursive
      }

      // Upload file
      await this.client.put(localFilePath, remotePath);

      // Construct public URL
      const publicUrl = `${this.baseUrl}/uploads/${targetDir}/${filename}`;

      return publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to upload file to Hostinger: ${errorMessage}`);
    } finally {
      // Always close connection
      if (this.client) {
        try {
          await this.client.end();
        } catch (error) {
          // Ignore errors when closing connection
        }
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

