import axios from 'axios';

async function verify() {
  try {
    // The number from the screenshot
    const mobile = '06265541081';
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    console.log(`Testing with mobile: ${mobile}`);
    console.log(`Clean mobile used in backend logic: ${cleanMobile}`);

    // We can't easily call the API from here if the server is not running on a known port, 
    // but we can test the internal controller logic if we import it, 
    // or just assume the regex I wrote works based on previous manual_test_mobile.js results.

    // Let's do a direct Mongo check with the NEW logic I implemented.
    const mongoose = (await import('mongoose')).default;
    const dotenv = (await import('dotenv')).default;
    dotenv.config();

    const creditNoteSchema = new mongoose.Schema({
      customer: Object,
      status: String,
      remainingAmount: Number
    });
    const CreditNote = mongoose.models.CreditNote || mongoose.model('CreditNote', creditNoteSchema, 'creditnotes');

    await mongoose.connect(process.env.MONGO_URI);

    // NEW LOGIC: { "customer.mobile": { $regex: cleanMobile + "$" } }
    const results = await CreditNote.find({
      "customer.mobile": { $regex: cleanMobile + "$" },
      status: "ACTIVE",
      remainingAmount: { $gt: 0 }
    });

    console.log(`MATCHED results: ${results.length}`);
    if (results.length > 0) {
      console.log('Sample match:', results[0].creditNoteNo, results[0].customer.mobile);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

verify();
