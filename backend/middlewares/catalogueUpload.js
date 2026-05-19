
import multer from "multer";
import path from "path";

/* ─────────────────────────────────────────────────────────────────
   Memory storage: buffers stay in RAM so catalogueOptimizer.js
   can compress them with sharp before writing to disk.
───────────────────────────────────────────────────────────────── */

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only PDF and images are allowed for catalogues"));
  }
};

export const catalogueUpload = multer({
  storage: multer.memoryStorage(), // ← memory so optimizer can compress
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
}).fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);
