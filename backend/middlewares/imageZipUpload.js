import multer from "multer";

export const uploadImageZip = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/zip") {
      cb(null, true);
    } else {
      cb(new Error("Only ZIP files allowed"), false);
    }
  }
});
