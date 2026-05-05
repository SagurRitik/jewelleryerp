// import multer from "multer";

// export const uploadExcelZip = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     if (
//       file.fieldname === "excel" &&
//       file.mimetype ===
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ) {
//       cb(null, true);
//     } else if (
//       file.fieldname === "images" &&
//       file.mimetype === "application/zip"
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type"), false);
//     }
//   }
// });


// import multer from "multer";

// export const uploadExcelZip = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: (req, file, cb) => {
//     if (
//       file.fieldname === "excel" &&
//       file.mimetype ===
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ) {
//       cb(null, true);
//     } else if (
//       file.fieldname === "images" &&
//       file.mimetype === "application/zip"
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type"), false);
//     }
//   },
// });


import multer from "multer";
import path from "path";

export const uploadExcelZip = multer({
  storage: multer.memoryStorage(),

  fileFilter: (req, file, cb) => {
    // ✅ EXCEL
    if (file.fieldname === "excel") {
      const isExcel =
        file.mimetype.includes("spreadsheet") ||
        file.originalname.endsWith(".xlsx");

      if (isExcel) return cb(null, true);
      return cb(new Error("Invalid Excel file"), false);
    }

    // ✅ ZIP (browser safe)
    if (file.fieldname === "images") {
      const isZip =
        file.mimetype.includes("zip") ||
        file.originalname.endsWith(".zip");

      if (isZip) return cb(null, true);
      return cb(new Error("Invalid ZIP file"), false);
    }

    cb(new Error("Invalid file field"), false);
  },
});
