import Customer from "../models/Customer.js";
import { sendInvoiceViaWhatsApp } from "../utils/whatsappService.js";

/**
 * @desc    Get all customers with optional search & pagination
 * @route   GET /api/customers
 */
export const getCustomers = async (req, res) => {
  try {
    const { search = "", customerType = "", page = 1, limit = 100 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    if (customerType) {
      query.customerType = customerType;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 100;
    const skip = (pageNum - 1) * limitNum;

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      success: true,
      customers,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get single customer by ID
 * @route   GET /api/customers/:id
 */
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create new customer
 * @route   POST /api/customers
 */
export const createCustomer = async (req, res) => {
  try {
    const { name, mobile, email, address, city, gstin, dob, anniversaryDate, customerType, notes, feedback, rating } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ success: false, message: "Name and Mobile number are required" });
    }

    let existingCustomer = await Customer.findOne({ mobile: mobile.trim() });
    if (existingCustomer) {
      if (name) existingCustomer.name = name.trim();
      if (email) existingCustomer.email = email.trim();
      if (address) existingCustomer.address = address;
      if (city) existingCustomer.city = city;
      if (gstin) existingCustomer.gstin = gstin.trim().toUpperCase();
      if (dob) existingCustomer.dob = new Date(dob);
      if (anniversaryDate) existingCustomer.anniversaryDate = new Date(anniversaryDate);
      if (customerType) existingCustomer.customerType = customerType;
      if (notes) existingCustomer.notes = notes;
      if (feedback !== undefined) existingCustomer.feedback = feedback;
      if (rating !== undefined) existingCustomer.rating = Number(rating);

      await existingCustomer.save();
      return res.status(200).json({
        success: true,
        message: "Customer profile & celebration dates updated successfully",
        customer: existingCustomer,
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email ? email.trim() : "",
      address: address || "",
      city: city || "",
      gstin: gstin ? gstin.trim().toUpperCase() : "",
      dob: dob ? new Date(dob) : null,
      anniversaryDate: anniversaryDate ? new Date(anniversaryDate) : null,
      customerType: customerType || "Regular",
      notes: notes || "",
      feedback: feedback || notes || "",
      rating: rating ? Number(rating) : 5,
    });

    res.status(201).json({ success: true, message: "Customer created successfully", customer });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update customer
 * @route   PUT /api/customers/:id
 */
export const updateCustomer = async (req, res) => {
  try {
    const { name, mobile, email, address, city, gstin, dob, anniversaryDate, customerType, notes, feedback, rating, totalPurchases, loyaltyPoints } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    if (mobile && mobile.trim() !== customer.mobile) {
      const duplicate = await Customer.findOne({ mobile: mobile.trim(), _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: "Mobile number is already used by another customer" });
      }
      customer.mobile = mobile.trim();
    }

    if (name) customer.name = name.trim();
    if (email !== undefined) customer.email = email.trim();
    if (address !== undefined) customer.address = address;
    if (city !== undefined) customer.city = city;
    if (gstin !== undefined) customer.gstin = gstin.trim().toUpperCase();
    if (dob !== undefined) customer.dob = dob ? new Date(dob) : null;
    if (anniversaryDate !== undefined) customer.anniversaryDate = anniversaryDate ? new Date(anniversaryDate) : null;
    if (customerType) customer.customerType = customerType;
    if (notes !== undefined) customer.notes = notes;
    if (feedback !== undefined) customer.feedback = feedback;
    if (rating !== undefined) customer.rating = Number(rating);
    if (totalPurchases !== undefined) customer.totalPurchases = Number(totalPurchases);
    if (loyaltyPoints !== undefined) customer.loyaltyPoints = Number(loyaltyPoints);
    if (totalPurchases !== undefined) customer.totalPurchases = Number(totalPurchases);
    if (loyaltyPoints !== undefined) customer.loyaltyPoints = Number(loyaltyPoints);

    await customer.save();

    res.status(200).json({ success: true, message: "Customer updated successfully", customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 */
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to calculate if date (DOB/Anniversary) falls within specified days range
 */
const checkEventWithinDays = (eventDateStr, daysAhead = 7) => {
  if (!eventDateStr) return false;
  const today = new Date();
  const eventDate = new Date(eventDateStr);

  const currentYear = today.getFullYear();
  // Create candidate event date in current year
  let thisYearEvent = new Date(currentYear, eventDate.getMonth(), eventDate.getDate());

  // Difference in days from today (resetting hours to midnight for accurate calculation)
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  let diffTime = thisYearEvent.getTime() - todayMidnight.getTime();
  let diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

  // Handle year wrap-around (e.g. late December checking early January)
  if (diffDays < 0) {
    const nextYearEvent = new Date(currentYear + 1, eventDate.getMonth(), eventDate.getDate());
    diffTime = nextYearEvent.getTime() - todayMidnight.getTime();
    diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
  }

  return {
    isMatch: diffDays >= 0 && diffDays <= daysAhead,
    daysRemaining: diffDays,
  };
};

/**
 * @desc    Get upcoming celebrations (Birthdays & Anniversaries)
 * @route   GET /api/customers/celebrations
 */
export const getUpcomingCelebrations = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysWindow = parseInt(days, 10) || 30;

    const allCustomers = await Customer.find({
      $or: [{ dob: { $ne: null } }, { anniversaryDate: { $ne: null } }],
    }).lean();

    const todayBirthdays = [];
    const todayAnniversaries = [];
    const upcomingBirthdays = [];
    const upcomingAnniversaries = [];

    allCustomers.forEach((cust) => {
      if (cust.dob) {
        const bdayCheck = checkEventWithinDays(cust.dob, daysWindow);
        if (bdayCheck.isMatch) {
          const item = { ...cust, daysRemaining: bdayCheck.daysRemaining, celebrationType: "BIRTHDAY" };
          if (bdayCheck.daysRemaining === 0) {
            todayBirthdays.push(item);
          } else {
            upcomingBirthdays.push(item);
          }
        }
      }

      if (cust.anniversaryDate) {
        const anniCheck = checkEventWithinDays(cust.anniversaryDate, daysWindow);
        if (anniCheck.isMatch) {
          const item = { ...cust, daysRemaining: anniCheck.daysRemaining, celebrationType: "ANNIVERSARY" };
          if (anniCheck.daysRemaining === 0) {
            todayAnniversaries.push(item);
          } else {
            upcomingAnniversaries.push(item);
          }
        }
      }
    });

    // Sort by days remaining
    upcomingBirthdays.sort((a, b) => a.daysRemaining - b.daysRemaining);
    upcomingAnniversaries.sort((a, b) => a.daysRemaining - b.daysRemaining);

    res.status(200).json({
      success: true,
      data: {
        todayBirthdays,
        todayAnniversaries,
        upcomingBirthdays,
        upcomingAnniversaries,
        stats: {
          todayBirthdaysCount: todayBirthdays.length,
          todayAnniversariesCount: todayAnniversaries.length,
          upcomingBirthdaysCount: upcomingBirthdays.length,
          upcomingAnniversariesCount: upcomingAnniversaries.length,
        },
      },
    });
  } catch (error) {
    console.error("Error getting celebrations:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Send offer message (WhatsApp / SMS)
 * @route   POST /api/customers/:id/send-offer
 */
export const sendOfferMessage = async (req, res) => {
  try {
    const { eventType, offerCode, message, channel = "WHATSAPP" } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    if (!customer.mobile) {
      return res.status(400).json({ success: false, message: "Customer does not have a mobile number" });
    }

    // Format Mobile
    let rawMobile = customer.mobile.replace(/\D/g, "");
    if (rawMobile.length === 10) {
      rawMobile = `91${rawMobile}`;
    }

    // Try sending via AiSensy if configured
    let gatewayResult = { success: false, note: "Manual / Web Link WhatsApp prepared" };
    if (process.env.AISENSY_API_KEY) {
      gatewayResult = await sendInvoiceViaWhatsApp({
        mobile: customer.mobile,
        customerName: customer.name,
        pdfUrl: "",
        pdfFilename: "",
        templateParams: [customer.name, offerCode || "SPECIAL", message || "Happy Celebrations!"],
      });
    }

    // Direct WhatsApp web link for 1-click fallback
    const encodedText = encodeURIComponent(message || `Hi ${customer.name}, Happy Celebrations from Luxe Jewellery! Use offer code ${offerCode} on your next visit.`);
    const waWebUrl = `https://wa.me/${rawMobile}?text=${encodedText}`;

    // Record in history
    customer.offersHistory.push({
      eventType: eventType || "CUSTOM",
      offerCode: offerCode || "",
      message: message || "",
      channel: channel || "WHATSAPP",
      sentAt: new Date(),
    });

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Offer recorded and message generated",
      waWebUrl,
      gatewayResult,
      offersHistory: customer.offersHistory,
    });
  } catch (error) {
    console.error("Error sending offer message:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
