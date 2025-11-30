export type UploadType = "vehicle" | "tour";
export declare class HostingerFtpAdapter {
    private client;
    private basePath;
    private baseUrl;
    constructor();
    /**
     * Upload a file to Hostinger via SFTP
     * @param localFilePath - Path to the local file (temporary file on Render)
     * @param uploadType - Type of upload (vehicle or tour)
     * @returns Public URL of the uploaded file
     */
    uploadFile(localFilePath: string, uploadType: UploadType): Promise<string>;
    /**
     * Check if FTP is configured
     */
    isConfigured(): boolean;
}
