import multer from "multer";

const storage = multer.memoryStorage();

export const uploadExcel = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log(`DEBUG: Uploading file: ${file.originalname}, Mime: ${file.mimetype}`);
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream", // Fallback for some browsers/OS
    ];

    if (
      allowedMimes.includes(file.mimetype) ||
      file.originalname.endsWith(".xlsx") ||
      file.originalname.endsWith(".xls")
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Only Excel files are allowed! Received: ${file.mimetype}`), false);
    }
  },
});
