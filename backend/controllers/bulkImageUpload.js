import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"]);

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

    // Unzip → compress each image → save as webp
    const zip = new AdmZip(req.file.buffer);
    const zipEntries = zip.getEntries().filter((e) => !e.isDirectory);

    let processed = 0;
    let skipped = 0;

    await Promise.all(
      zipEntries.map(async (entry) => {
        const originalName = path.basename(entry.entryName);
        const ext = path.extname(originalName).toLowerCase();

        if (IMAGE_EXTENSIONS.has(ext)) {
          // Compress to webp (same base name so product mappings still work)
          const nameWithoutExt = path.basename(originalName, ext);
          const outputFilename = `${nameWithoutExt}.webp`;
          const outputPath = path.join(uploadDir, outputFilename);

          await sharp(entry.getData())
            .resize(800, 800, { fit: "inside", withoutEnlargement: true })
            .toFormat("webp")
            .webp({ quality: 80 })
            .toFile(outputPath);

          console.log(`  ✅ Compressed: ${originalName} → ${outputFilename}`);
          processed++;
        } else {
          console.log(`  ⏭️ Skipped (not an image): ${originalName}`);
          skipped++;
        }
      })
    );

    return res.status(200).json({
      success: true,
      message: `Images uploaded and compressed successfully`,
      processed,
      skipped,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

