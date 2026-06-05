import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Define schema directly to avoid import issues in test script
const creditNoteSchema = new mongoose.Schema({
  customer: Object,
  status: String,
  remainingAmount: Number
});
const CreditNote = mongoose.model('CreditNote', creditNoteSchema, 'creditnotes');

async function test() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // The number from the screenshot
    const mobile = '06265541081';

    const results = await CreditNote.find({
      "customer.mobile": mobile
    });
    console.log(`Searching for "${mobile}": FOUND ${results.length}`);

    const normalizedMobile = mobile.replace(/^0+/, '');
    const resultsNorm = await CreditNote.find({
      "customer.mobile": normalizedMobile
    });
    console.log(`Searching for normalized "${normalizedMobile}": FOUND ${resultsNorm.length}`);

    const partialResults = await CreditNote.find({
      "customer.mobile": { $regex: normalizedMobile }
    });
    console.log(`Searching for regex "${normalizedMobile}": FOUND ${partialResults.length}`);

    if (results.length === 0 && resultsNorm.length === 0 && partialResults.length === 0) {
      const any = await CreditNote.find({}).limit(5);
      console.log('Sample data from DB:');
      any.forEach(a => console.log(`- ${a.customer?.name}: ${a.customer?.mobile} (Status: ${a.status}, Remaining: ${a.remainingAmount})`));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

test();
