
import mongoose from "mongoose";
import dotenv from "dotenv";
import Quotation from "./backend/models/Quotation.js";
import RateConfig from "./backend/models/RateConfig.js";

dotenv.config();

async function debug() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const rates = await RateConfig.findOne({ active: true }).lean();
    console.log("Rates found:", !!rates);

    const testQuotation = {
      customerName: "Test User",
      items: [
        {
          title: "Test Item",
          breakup: {
            subtotal: 100,
            grandTotal: 103,
            gst: 3
          }
        }
      ],
      subtotal: 100,
      gstTotal: 3,
      grandTotal: 103
    };

    console.log("Attempting to create quotation...");
    const q = await Quotation.create(testQuotation);
    console.log("Success! Quotation No:", q.quotationNo);

  } catch (err) {
    console.error("DEBUG ERROR:", err);
  } finally {
    await mongoose.disconnect();
  }
}

debug();
