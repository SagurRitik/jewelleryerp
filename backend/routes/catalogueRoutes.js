
import express from "express";
import { getCatalogues, uploadCatalogue, deleteCatalogue } from "../controllers/catalogueController.js";
import { catalogueUpload } from "../middlewares/catalogueUpload.js";
import { optimizeCatalogueImages } from "../middlewares/catalogueOptimizer.js";

const router = express.Router();

router.get("/", getCatalogues);
router.post("/", catalogueUpload, optimizeCatalogueImages, uploadCatalogue); // ✨ compress before save
router.delete("/:id", deleteCatalogue);

export default router;
