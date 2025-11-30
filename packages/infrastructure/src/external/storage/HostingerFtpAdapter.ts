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
    // If FTP account's home directory is already /public_html/uploads, set this to empty or "/"
    // If FTP account's home directory is /public_html, set this to /home/u733725607/domains/viprideistanbulairport.com/public_html
    this.basePath = env.hostingerFtpPath || "/public_html/uploads";
    // HOSTINGER_BASE_URL should be the public domain URL
    // Example: https://viprideistanbulairport.com
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
      const error = "FTP configuration is missing. Please set HOSTINGER_FTP_HOST, HOSTINGER_FTP_USERNAME, and HOSTINGER_FTP_PASSWORD environment variables.";
      console.error("[FTP] Configuration error:", error);
      throw new Error(error);
    }

    // Determine target directory based on upload type
    const targetDir = uploadType === "vehicle" ? "vehicles" : "tours";
    
    // Calculate remote directory based on basePath
    // If basePath ends with /uploads, we're already in uploads directory, just add targetDir
    // If basePath ends with /public_html, we need to add /uploads/targetDir
    // If basePath is empty or "/", FTP account home is already in uploads, just add targetDir
    let remoteDir: string;
    if (!this.basePath || this.basePath === "/" || this.basePath.endsWith("/uploads")) {
      // FTP account home is already in uploads directory
      remoteDir = path.join(this.basePath || "/", targetDir).replace(/\\/g, "/");
    } else if (this.basePath.endsWith("/public_html") || this.basePath.includes("/public_html")) {
      // FTP account home is in public_html (or path contains public_html), need to add uploads
      remoteDir = path.join(this.basePath, "uploads", targetDir).replace(/\\/g, "/");
    } else {
      // Use basePath as-is and add targetDir
      remoteDir = path.join(this.basePath, targetDir).replace(/\\/g, "/");
    }

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
        console.error("[FTP] Directory creation failed, trying parent:", error);
        // If directory creation fails, try to create parent directories
        const parentDir = path.dirname(remoteDir);
        if (parentDir !== remoteDir) {
          await client.ensureDir(parentDir);
          await client.ensureDir(remoteDir);
        } else {
          throw error;
        }
      }

      // Change to target directory before uploading
      await client.cd(remoteDir);
      
      // Upload file using relative path (just filename)
      await client.uploadFrom(localFilePath, filename);

      // Verify file was uploaded by listing directory
      try {
        const fileList = await client.list(".");
        const uploadedFile = fileList.find((file) => file.name === filename);
        if (!uploadedFile) {
          console.warn("[FTP] WARNING: File not found in directory listing after upload!");
        }
      } catch (listError) {
        console.error("[FTP] Error listing directory to verify upload:", listError);
      }

      // Construct public URL
      // Ensure baseUrl doesn't have trailing slash and path starts with /
      const cleanBaseUrl = this.baseUrl.replace(/\/$/, "");
      const publicUrl = `${cleanBaseUrl}/uploads/${targetDir}/${filename}`;

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
    return configured;
  }
}

