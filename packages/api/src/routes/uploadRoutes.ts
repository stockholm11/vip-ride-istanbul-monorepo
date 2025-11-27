import { Router, type Request, type Response, RequestHandler } from "express";
import multer from "multer";
import path from "path";

const router: Router = Router();

// This will be set from server.ts
let adminAuthMiddleware: RequestHandler | null = null;

export function setUploadAuthMiddleware(middleware: RequestHandler) {
  adminAuthMiddleware = middleware;
}

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
  const url = `/uploads/${req.file.filename}`;
  return res.json({ url });
};

if (adminAuthMiddleware) {
  router.post("/", adminAuthMiddleware, uploadHandler, routeHandler);
} else {
  router.post("/", uploadHandler, routeHandler);
}

export default router;

