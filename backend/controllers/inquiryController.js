import Inquiry from "../models/Inquiry.js";
import XLSX from "xlsx";

export const createInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    res.status(201).json({
      success: true,
      data: inquiry,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const bulkCreateInquiries = async (req, res) => {
  try {
    console.log("DEBUG: Bulk Inquiry Upload Request Received");
    if (!req.file) {
      console.log("DEBUG: No file found in request");
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    console.log(`DEBUG: Found ${rows.length} rows in Excel`);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Excel sheet is empty" });
    }

    // Normalize row keys and Map Excel rows to Inquiry model fields
    const inquiries = rows.map(row => {
      // Create a normalized version of the row keys
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toString().replace(/\s+/g, "").replace(/_/g, "").toLowerCase();
        normalizedRow[normalizedKey] = row[key];
      });

      const customerName = normalizedRow.customername || normalizedRow.name || normalizedRow.clientname;
      const mobile = normalizedRow.mobile || normalizedRow.phone || normalizedRow.contact || normalizedRow.mobilenumber;
      
      const status = (normalizedRow.status || "NEW").toString().toUpperCase().replace(/\s+/g, "_");
      const priority = (normalizedRow.priority || "MEDIUM").toString().toUpperCase();
      const source = (normalizedRow.source || "WALK_IN").toString().toUpperCase().replace(/\s+/g, "_");

      return {
        customerName: customerName ? String(customerName).trim() : undefined,
        mobile: mobile ? String(mobile).trim() : undefined,
        email: normalizedRow.email,
        address: normalizedRow.address,
        budget: Number(normalizedRow.budget || 0),
        productType: normalizedRow.producttype,
        customProduct: normalizedRow.customproduct,
        metal: normalizedRow.metal,
        diamondShape: normalizedRow.diamondshape,
        diamondWeight: Number(normalizedRow.diamondweight || 0),
        stone: normalizedRow.stone,
        notes: normalizedRow.notes,
        status,
        priority,
        salesperson: normalizedRow.salesperson,
        source,
      };
    });

    // Filter out rows without required fields
    const validInquiries = inquiries.filter(iq => iq.customerName && iq.mobile);
    const skippedCount = inquiries.length - validInquiries.length;

    console.log(`DEBUG: Valid inquiries: ${validInquiries.length}, Skipped: ${skippedCount}`);
    if (validInquiries.length > 0) {
      console.log("DEBUG: First valid inquiry sample:", JSON.stringify(validInquiries[0], null, 2));
    }

    if (validInquiries.length === 0) {
      console.log("DEBUG: No valid inquiries found (missing customerName or mobile)");
      return res.status(400).json({ success: false, message: "No valid inquiries found in Excel. Ensure columns 'CustomerName' and 'Mobile' are present and filled." });
    }

    const createdInquiries = await Inquiry.insertMany(validInquiries, { ordered: false });

    res.status(201).json({
      success: true,
      count: createdInquiries.length,
      skipped: skippedCount,
      data: createdInquiries,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerName, productType, priority, source, sortBy = "latest", export: exportData } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (source) query.source = source;
    if (customerName) query.customerName = { $regex: customerName, $options: "i" };
    if (productType) query.productType = { $regex: productType, $options: "i" };

    const sortOption = sortBy === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    if (exportData === 'true') {
      const inquiries = await Inquiry.find(query).sort(sortOption);
      return res.json({ success: true, data: inquiries });
    }

    const inquiries = await Inquiry.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalRecords = await Inquiry.countDocuments(query);

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status, priority, salesperson, followUpDate, source } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { status, priority, salesperson, followUpDate, source },
      { new: true }
    );
    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addFollowUp = async (req, res) => {
  try {
    const { note, status, nextFollowUpDate, salesperson } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    
    if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });

    const newFollowUp = {
      note,
      status,
      nextFollowUpDate,
      salesperson,
      date: new Date()
    };

    inquiry.followUps.push(newFollowUp);
    
    // Auto-update status and next follow-up date if provided
    if (status) inquiry.status = status;
    if (nextFollowUpDate) inquiry.followUpDate = nextFollowUpDate;

    await inquiry.save();
    res.json({ success: true, data: inquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Inquiry deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};