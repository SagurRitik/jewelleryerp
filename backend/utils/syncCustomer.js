import Customer from "../models/Customer.js";

/**
 * Automatically syncs / creates / updates customer profile when a bill / invoice is created.
 * Preserves existing dob & anniversaryDate if not provided.
 * Increments totalPurchases.
 */
export async function syncCustomerFromOrder(customerData = {}, invoiceAmount = 0) {
  try {
    const rawMobile = customerData.mobile || customerData.phone || "";
    const cleanMobile = String(rawMobile).replace(/\D/g, "").slice(-10);

    if (!cleanMobile || cleanMobile.length < 10) return null;

    const name = (customerData.name || "").trim() || "Customer";

    const updateFields = {
      $setOnInsert: {
        customerType: "Regular",
        loyaltyPoints: 0,
        offersHistory: [],
      },
      $inc: {
        totalPurchases: Number(invoiceAmount) || 0,
      },
    };

    const setFields = {};
    if (name) setFields.name = name;
    if (customerData.email) setFields.email = customerData.email.trim();
    if (customerData.address) setFields.address = customerData.address.trim();
    if (customerData.city) setFields.city = customerData.city.trim();
    if (customerData.gstin) setFields.gstin = customerData.gstin.trim().toUpperCase();
    if (customerData.stateCode) setFields.stateCode = String(customerData.stateCode).trim();
    if (customerData.panNumber) setFields.panNumber = customerData.panNumber.trim().toUpperCase();
    if (customerData.dob) setFields.dob = new Date(customerData.dob);
    if (customerData.anniversaryDate) setFields.anniversaryDate = new Date(customerData.anniversaryDate);

    if (Object.keys(setFields).length > 0) {
      updateFields.$set = setFields;
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { mobile: cleanMobile },
      updateFields,
      { new: true, upsert: true }
    );

    return updatedCustomer;
  } catch (error) {
    console.error("syncCustomerFromOrder error:", error.message);
    return null;
  }
}
