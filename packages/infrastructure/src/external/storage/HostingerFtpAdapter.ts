import { Client as FtpClient } from "basic-ftp";
import { env } from "../../config/env";
import fs from "fs";
import path from "path";

export type UploadType = "vehicle" | "tour";

export class HostingerFtpAdapter {
  private basePath: string;
  private baseUrl: string;

  constructor() {
    // HOSTINGER_FTP_PATH should be the absolute path on the FTP server
    // Example: /home/u733725607/domains/viprideistanbulairport.com/public_html/uploads
    this.basePath = env.hostingerFtpPath || "/public_html/uploads";
    // HOSTINGER_BASE_URL should be the public domain URL
    // Example: https://viprideistanbulairport.com
    this.baseUrl = env.hostingerBaseUrl || "";
    
    console.log("[FTP] HostingerFtpAdapter initialized:", {
      basePath: this.basePath,
      baseUrl: this.baseUrl,
      hasHost: !!env.hostingerFtpHost,
      hasUsername: !!env.hostingerFtpUsername,
      hasPassword: !!env.hostingerFtpPassword,
      port: env.hostingerFtpPort,
    });
  }

  /**
   * Upload a file to Hostinger via FTP
   * @param localFilePath - Path to the local file (temporary file on Render)
   * @param uploadType - Type of upload (vehicle or tour)
   * @returns Public URL of the uploaded file
   */
  async uploadFile(localFilePath: string, uploadType: UploadType): Promise<string> {
    console.log("[FTP] Starting file upload:", { localFilePath, uploadType });
    
    // Validate FTP configuration
    if (!env.hostingerFtpHost || !env.hostingerFtpUsername || !env.hostingerFtpPassword) {
      const error = "FTP configuration is missing. Please set HOSTINGER_FTP_HOST, HOSTINGER_FTP_USERNAME, and HOSTINGER_FTP_PASSWORD environment variables.";
      console.error("[FTP] Configuration error:", error);
      throw new Error(error);
    }

    // Determine target directory based on upload type
    const targetDir = uploadType === "vehicle" ? "vehicles" : "tours";
    const remoteDir = path.join(this.basePath, targetDir).replace(/\\/g, "/");

    // Generate unique filename
    const filename = path.basename(localFilePath);
    const remotePath = path.join(remoteDir, filename).replace(/\\/g, "/");

    console.log("[FTP] Upload details:", {
      targetDir,
      remoteDir,
      filename,
      remotePath,
      basePath: this.basePath,
    });

    const client = new FtpClient();
    client.ftp.verbose = false; // Disable verbose logging

    try {
      console.log("[FTP] Connecting to FTP server:", {
        host: env.hostingerFtpHost,
        port: env.hostingerFtpPort || 21,
        user: env.hostingerFtpUsername,
      });
      
      // Connect to FTP server
      await client.access({
        host: env.hostingerFtpHost,
        port: env.hostingerFtpPort || 21,
        user: env.hostingerFtpUsername,
        password: env.hostingerFtpPassword,
        secure: false, // Use plain FTP (not FTPS)
        secureOptions: undefined,
      });
      
      console.log("[FTP] Connected successfully");

      // Ensure target directory exists
      console.log("[FTP] Ensuring directory exists:", remoteDir);
      try {
        await client.ensureDir(remoteDir);
        console.log("[FTP] Directory ensured:", remoteDir);
      } catch (error) {
        console.error("[FTP] Directory creation failed, trying parent:", error);
        // If directory creation fails, try to create parent directories
        const parentDir = path.dirname(remoteDir);
        if (parentDir !== remoteDir) {
          await client.ensureDir(parentDir);
          await client.ensureDir(remoteDir);
          console.log("[FTP] Parent directory created and directory ensured");
        } else {
          throw error;
        }
      }

      // Upload file
      console.log("[FTP] Uploading file:", { localFilePath, remotePath });
      await client.uploadFrom(localFilePath, remotePath);
      console.log("[FTP] File uploaded successfully");

      // Construct public URL
      // Ensure baseUrl doesn't have trailing slash and path starts with /
      const cleanBaseUrl = this.baseUrl.replace(/\/$/, "");
      const publicUrl = `${cleanBaseUrl}/uploads/${targetDir}/${filename}`;
      console.log("[FTP] Public URL constructed:", publicUrl);

      return publicUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("[FTP] Upload error:", {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        error: error,
      });
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
    const configured = !!(
      env.hostingerFtpHost &&
      env.hostingerFtpUsername &&
      env.hostingerFtpPassword &&
      env.hostingerBaseUrl
    );
    console.log("[FTP] isConfigured check:", {
      configured,
      hasHost: !!env.hostingerFtpHost,
      hasUsername: !!env.hostingerFtpUsername,
      hasPassword: !!env.hostingerFtpPassword,
      hasBaseUrl: !!env.hostingerBaseUrl,
    });
    return configured;
  }
}

