// import multer from "multer";

// // Use memory storage so we can process images before saving to disk
// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Not an image! Please upload only images."), false);
//   }
// };

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB
//   },
// });





import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";

/* ================= PATH SETUP ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// uploads folder inside backend
const uploadDir = path.join(__dirname, "..", "uploads");

/* Ensure upload folder exists */
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ================= STORAGE CONFIG ================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + crypto.randomBytes(6).toString("hex");

    const ext = path.extname(file.originalname).toLowerCase();

    cb(null, `${uniqueSuffix}${ext}`);
  },
});

/* ================= FILE FILTER ================= */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, PNG images allowed"));
  }
};

/* ================= MULTER INSTANCE ================= */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});