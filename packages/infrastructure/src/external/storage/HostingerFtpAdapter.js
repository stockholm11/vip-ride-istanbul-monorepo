"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HostingerFtpAdapter = void 0;
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
const env_1 = require("../../config/env");
const path_1 = __importDefault(require("path"));
class HostingerFtpAdapter {
    constructor() {
        this.client = new ssh2_sftp_client_1.default();
        this.basePath = env_1.env.hostingerFtpPath || "/public_html/uploads";
        this.baseUrl = env_1.env.hostingerBaseUrl || "";
    }
    /**
     * Upload a file to Hostinger via SFTP
     * @param localFilePath - Path to the local file (temporary file on Render)
     * @param uploadType - Type of upload (vehicle or tour)
     * @returns Public URL of the uploaded file
     */
    async uploadFile(localFilePath, uploadType) {
        // Validate FTP configuration
        if (!env_1.env.hostingerFtpHost || !env_1.env.hostingerFtpUsername || !env_1.env.hostingerFtpPassword) {
            throw new Error("FTP configuration is missing. Please set HOSTINGER_FTP_HOST, HOSTINGER_FTP_USERNAME, and HOSTINGER_FTP_PASSWORD environment variables.");
        }
        // Determine target directory based on upload type
        const targetDir = uploadType === "vehicle" ? "vehicles" : "tours";
        const remoteDir = path_1.default.join(this.basePath, targetDir).replace(/\\/g, "/");
        // Generate unique filename
        const filename = path_1.default.basename(localFilePath);
        const remotePath = path_1.default.join(remoteDir, filename).replace(/\\/g, "/");
        try {
            // Connect to SFTP server
            await this.client.connect({
                host: env_1.env.hostingerFtpHost,
                port: env_1.env.hostingerFtpPort,
                username: env_1.env.hostingerFtpUsername,
                password: env_1.env.hostingerFtpPassword,
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw new Error(`Failed to upload file to Hostinger: ${errorMessage}`);
        }
        finally {
            // Always close connection
            if (this.client) {
                try {
                    await this.client.end();
                }
                catch (error) {
                    // Ignore errors when closing connection
                }
            }
        }
    }
    /**
     * Check if FTP is configured
     */
    isConfigured() {
        return !!(env_1.env.hostingerFtpHost &&
            env_1.env.hostingerFtpUsername &&
            env_1.env.hostingerFtpPassword &&
            env_1.env.hostingerBaseUrl);
    }
}
exports.HostingerFtpAdapter = HostingerFtpAdapter;
