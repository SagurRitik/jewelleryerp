import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const all = await Product.find({});
  const gt0 = await Product.find({ stock: { $gt: 0 } });
  
  console.log('Total:', all.length, 'gt0:', gt0.length);
  const zero = all.filter(p => !p.stock || p.stock <= 0);
  console.log('Zero:', zero.map(p => p.sku));
  process.exit(0);
});
