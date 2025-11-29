import { Router, type Request, type Response, RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { HostingerFtpAdapter, UploadType } from "../../../infrastructure/src/external/storage/HostingerFtpAdapter";

const router: Router = Router();

// This will be set from server.ts
let adminAuthMiddleware: RequestHandler | null = null;

export function setUploadAuthMiddleware(middleware: RequestHandler) {
  adminAuthMiddleware = middleware;
}

// Initialize FTP adapter
const ftpAdapter = new HostingerFtpAdapter();

// Resolve uploads directory: works in both dev (src/routes/) and build (dist/routes/) modes
const uploadsPath = path.resolve(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and WebP images allowed"));
    }
    cb(null, true);
  },
});

// Apply authentication middleware if available
const uploadHandler = upload.single("file");
const routeHandler = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Get upload type from query parameter (vehicle or tour)
    const uploadType = (req.query.type as string)?.toLowerCase();
    
    if (!uploadType || (uploadType !== "vehicle" && uploadType !== "tour")) {
      // Clean up temporary file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        message: "Invalid upload type. Use ?type=vehicle or ?type=tour" 
      });
    }

    let url: string;

    // Check if FTP is configured
    if (ftpAdapter.isConfigured()) {
      try {
        // Upload to Hostinger via FTP
        url = await ftpAdapter.uploadFile(req.file.path, uploadType as UploadType);
        
        // Clean up temporary file after successful upload
        fs.unlinkSync(req.file.path);
      } catch (ftpError) {
        // If FTP upload fails, fall back to Render storage
        console.error("FTP upload failed, falling back to Render storage:", ftpError);
        
        // Get API base URL from environment or construct from request
        const apiBaseUrl = process.env.API_BASE_URL || 
                           process.env.RENDER_EXTERNAL_URL || 
                           (req.get("host") ? (req.protocol + "://" + req.get("host")) : "");
        
        url = `${apiBaseUrl}/uploads/${req.file.filename}`;
      }
    } else {
      // FTP not configured, use Render storage
      const apiBaseUrl = process.env.API_BASE_URL || 
                         process.env.RENDER_EXTERNAL_URL || 
                         (req.get("host") ? (req.protocol + "://" + req.get("host")) : "");
      
      url = `${apiBaseUrl}/uploads/${req.file.filename}`;
    }

    return res.json({ url });
  } catch (error) {
    // Clean up temporary file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        // Ignore cleanup errors
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Upload error:", errorMessage);
    return res.status(500).json({ message: "Failed to upload file", error: errorMessage });
  }
};

if (adminAuthMiddleware) {
  router.post("/", adminAuthMiddleware, uploadHandler, routeHandler);
} else {
  router.post("/", uploadHandler, routeHandler);
}

export default router;

