import Product from "../../models/Product.js";
import SalesOrder from "../../models/SalesOrder.js";

export const getDeadStockReport = async (req, res) => {
  try {
    // 1. Fetch products with stock > 0
    const totalProducts = await Product.countDocuments();
    const products = await Product.find({ stock: { $gt: 0 } }).lean();

    const now = new Date();
    const buckets = {
      "0-6 Months": { items: [], totalValue: 0 },
      "6-9 Months": { items: [], totalValue: 0 },
      "9-12 Months": { items: [], totalValue: 0 },
      "12+ Months": { items: [], totalValue: 0 },
    };

    // 2. We can estimate standard aging via createdAt
    products.forEach((product) => {
      // If product has lastSoldDate etc., we'd check that.
      // Here, falling back to createdAt as inward date for stock
      const createdDate = new Date(product.createdAt);
      
      const yearsDiff = now.getFullYear() - createdDate.getFullYear();
      const monthsDiff = yearsDiff * 12 + now.getMonth() - createdDate.getMonth();
      const differenceInMonths = monthsDiff + (now.getDate() < createdDate.getDate() ? -1 : 0);
      
      const itemData = {
        _id: product._id,
        sku: product.sku,
        title: product.title,
        jewelleryCategory: product.jewelleryCategory,
        stock: product.stock,
        createdAt: product.createdAt,
        netWeight: product.netWeight,
        grossWeight: product.grossWeight,
        metalType: product.metalType,
        metalPurity: product.metalPurity,
        monthsStagnant: differenceInMonths < 0 ? 0 : differenceInMonths
      };

      if (itemData.monthsStagnant >= 12) {
        buckets["12+ Months"].items.push(itemData);
      } else if (itemData.monthsStagnant >= 9) {
        buckets["9-12 Months"].items.push(itemData);
      } else if (itemData.monthsStagnant >= 6) {
        buckets["6-9 Months"].items.push(itemData);
      } else {
        buckets["0-6 Months"].items.push(itemData);
      }
    });

    res.json({
      success: true,
      data: buckets,
      totalCatalogSize: totalProducts,
      inStockSize: products.length
    });
  } catch (err) {
    console.error("DEAD STOCK ERROR:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};
