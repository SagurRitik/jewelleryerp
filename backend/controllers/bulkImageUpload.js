import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";

export const bulkUploadImages = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "ZIP file required" });
    }

    const uploadDir = path.join("uploads", "products");

    // Ensure folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Unzip
    const zip = new AdmZip(req.file.buffer);
    zip.extractAllTo(uploadDir, true);

    return res.status(200).json({
      success: true,
      message: "Images uploaded successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
