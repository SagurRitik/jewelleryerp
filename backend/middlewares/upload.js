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

/* ================= STORAGE CONFIG ================= */
// Use memory storage so we can process images before saving to disk
const storage = multer.memoryStorage();

/* ================= FILE FILTER ================= */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, PNG, WEBP images allowed"), false);
  }
};

/* ================= MULTER INSTANCE ================= */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});