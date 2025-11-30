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
    
    // Calculate remote directory based on basePath
    // Default FTP account (u733725607) home directory is /home/u733725607/domains/viprideistanbulairport.com
    // Files should be uploaded to: /home/u733725607/domains/viprideistanbulairport.com/public_html/uploads/vehicles
    // This is accessible via web as: https://viprideistanbulairport.com/uploads/vehicles/...
    
    let remoteDir: string;
    
    // If basePath is empty or "/", assume we're starting from FTP home directory
    if (!this.basePath || this.basePath === "/") {
      // FTP home is /home/u733725607/domains/viprideistanbulairport.com
      // Need to go to public_html/uploads/targetDir
      remoteDir = `/home/u733725607/domains/viprideistanbulairport.com/public_html/uploads/${targetDir}`;
    } else if (this.basePath.endsWith("/uploads")) {
      // basePath already includes /uploads, just add targetDir
      remoteDir = path.join(this.basePath, targetDir).replace(/\\/g, "/");
    } else if (this.basePath.endsWith("/public_html") || this.basePath.includes("/public_html")) {
      // basePath ends with /public_html, need to add uploads/targetDir
      remoteDir = path.join(this.basePath, "uploads", targetDir).replace(/\\/g, "/");
    } else {
      // Use basePath as-is and add targetDir (fallback)
      remoteDir = path.join(this.basePath, targetDir).replace(/\\/g, "/");
    }

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
      
      // Get current working directory after connection
      const initialDir = await client.pwd();
      console.log("[FTP] Initial FTP directory (pwd):", initialDir);

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

      // Change to target directory before uploading
      console.log("[FTP] Changing to directory:", remoteDir);
      await client.cd(remoteDir);
      const currentDir = await client.pwd();
      console.log("[FTP] Current directory after cd:", currentDir);
      
      // Verify we're in the correct directory
      if (!currentDir.includes("public_html") && !currentDir.includes("uploads")) {
        console.warn("[FTP] WARNING: Current directory doesn't seem to be in public_html/uploads!");
      }
      
      // Upload file using relative path (just filename)
      console.log("[FTP] Uploading file:", { 
        localFilePath, 
        remotePath,
        filename,
        uploadingTo: filename 
      });
      await client.uploadFrom(localFilePath, filename);
      console.log("[FTP] File upload command completed");

      // Set file permissions to 644 (readable by web server)
      try {
        console.log("[FTP] Setting file permissions to 644 (rw-r--r--)");
        await client.send("SITE CHMOD 644 " + filename);
        console.log("[FTP] File permissions set to 644");
      } catch (chmodError) {
        console.warn("[FTP] Warning: Could not set file permissions (this is usually OK):", chmodError);
        // Continue even if chmod fails - some FTP servers handle this automatically
      }

      // Verify file was uploaded by listing directory
      try {
        const fileList = await client.list(".");
        const uploadedFile = fileList.find((file) => file.name === filename);
        if (uploadedFile) {
          console.log("[FTP] File verified in directory:", {
            filename: uploadedFile.name,
            size: uploadedFile.size,
            modified: uploadedFile.modifiedAt,
          });
        } else {
          console.warn("[FTP] WARNING: File not found in directory listing after upload!");
          console.log("[FTP] Directory contents:", fileList.map((f) => f.name));
        }
      } catch (listError) {
        console.error("[FTP] Error listing directory to verify upload:", listError);
      }

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

