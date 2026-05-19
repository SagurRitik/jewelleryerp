
import Catalogue from "../models/Catalogue.js";

export const getCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, catalogues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadCatalogue = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: "Catalogue file is required" });
    }

    const fileUrl = `/uploads/catalogues/${req.files.file[0].filename}`;
    let thumbnailUrl = null;
    
    if (req.files.thumbnail) {
      thumbnailUrl = `/uploads/catalogues/${req.files.thumbnail[0].filename}`;
    } else if (req.files.file[0].mimetype.startsWith("image")) {
      thumbnailUrl = fileUrl;
    }
    
    const catalogue = new Catalogue({
      title,
      description,
      category,
      fileUrl,
      thumbnailUrl,
    });

    await catalogue.save();
    res.status(201).json({ success: true, catalogue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) {
      return res.status(404).json({ success: false, message: "Catalogue not found" });
    }
    
    catalogue.isActive = false; // Soft delete
    await catalogue.save();
    
    res.json({ success: true, message: "Catalogue deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
