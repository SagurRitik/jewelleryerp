

import Order from "../../models/Order.js";
import RateConfig from "../../models/RateConfig.js";
import calculateItem from "../../utils/calculateItem.js";
import Product from "../../models/Product.js";
import MetalLedger from "../../models/MetalLedger.js";
import { normalizeImage } from "../../utils/normalizeImage.js";

/* ================= HELPERS ================= */
const normalizeString = (v) => {
  if (!v || typeof v !== "string") return v;
  return v.trim().charAt(0).toUpperCase() + v.trim().slice(1);
};

/* ================= PURITY FACTORS ================= */
const PURITY_MAP = {

  "24KT": 1,
  "22KT": 0.916,
  "18KT": 0.76,
  "14KT": 0.60,
  "10KT": 0.43,
  "9KT": 0.39,
  "999": 1,
  "925": 1,
  "835": 0.835,
  "800": 0.8,
  "950": 1,
  "900": 0.947,
};

/* ================= SANITIZER ================= */
const sanitizeOrderData = (data) => {
  const d = { ...data };

  /* ================= NEST FLAT KEYS (multipart/form-data) ================= */
  // Handles nested keys from multipart/form-data
  Object.keys(d).forEach(key => {
    if (key.includes("[") && key.includes("]")) {
      const parts = key.split(/[\[\]]+/).filter(Boolean);
      const isArrayPush = key.endsWith("[]");
      
      let current = d;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const nextPart = parts[i + 1];

        if (nextPart === undefined) {
          // If it's an array push (like productImages[])
          if (isArrayPush) {
            if (!Array.isArray(current[part])) current[part] = [];
            
            // Handle if value is already an array (some middlewares do this)
            if (Array.isArray(d[key])) {
              current[part] = [...current[part], ...d[key]];
            } else {
              current[part].push(d[key]);
            }
          } else {
            current[part] = d[key];
          }
        } else {
          if (!current[part]) {
            current[part] = /^\d+$/.test(nextPart) ? [] : {};
          }
          current = current[part];
        }
      }
    }
  });

  if (d.productSnapshot) {
    const ps = d.productSnapshot;


    // if (Array.isArray(d.productSnapshot?.productImages)) {
    //   d.productSnapshot.productImages =
    //     d.productSnapshot.productImages.map((img) =>
    //       typeof img === "string" ? img.replace(/\\/g, "/") : img
    //     );
    // }


    // if (Array.isArray(d.productSnapshot?.productImages)) {
    //   d.productSnapshot.productImages =
    //     d.productSnapshot.productImages.map((img) => {
    //       if (typeof img !== "string") return img;

    //       // if (img.includes("/uploads/")) {
    //       //   return img.substring(img.indexOf("/uploads/"));
    //       // }

    //       const match = img.match(/\/?uploads\/.+/);
    // return match ? `/${match[0].replace(/^\/+/, "")}` : img;

    //       return img;
    //     });
    // }

    if (Array.isArray(ps.components)) {
      ps.components = ps.components.map(c => ({
        ...c,
        weight: Number(c.weight || 0),
        grossWeight: Number(c.grossWeight || 0),
        // size: Number(c.size || 0),
        size:
          c.size !== undefined && c.size !== null && c.size !== ""
            ? String(c.size)
            : "",
        count: Number(c.count || 0)
      }));
    }

    // if (Array.isArray(d.productSnapshot?.productImages)) {
    //   d.productSnapshot.productImages =
    //     d.productSnapshot.productImages.map((img) => {
    //       if (typeof img !== "string") return img;

    //       // convert full URL → relative path
    //       if (img.includes("/uploads/")) {
    //         return img.substring(img.indexOf("/uploads/"));
    //       }

    //       return img.replace(/\\/g, "/");
    //     });
    // }


    if (Array.isArray(d.productSnapshot?.productImages)) {
      d.productSnapshot.productImages =
        d.productSnapshot.productImages.map((img) => {
          if (typeof img !== "string") return img;

          // normalize slashes
          img = img.replace(/\\/g, "/");

          // extract only uploads path safely
          const match = img.match(/\/?uploads\/.+/);

          return match
            ? `/${match[0].replace(/^\/+/, "")}` // always clean /uploads/...
            : img;
        });
    }


    if (typeof ps.components === "string") {
      try {
        ps.components = JSON.parse(ps.components);
      } catch {
        ps.components = [];
      }
    }

    ["grossWeight", "netWeight"].forEach((f) => {
      if (ps[f] !== undefined) ps[f] = Number(ps[f]);
    });

    if (ps.metalType) ps.metalType = normalizeString(ps.metalType);
    if (ps.metalPurity) {
      ps.metalPurity = String(ps.metalPurity)
        .toUpperCase()
        .replace(/\s/g, "");
    }
  }

  if (d.advancePayment?.amount !== undefined) {
    d.advancePayment.amount = Number(d.advancePayment.amount);
    d.advancePayment.paidAt =
      d.advancePayment.amount > 0 ? new Date() : null;
  }

  return d;
};

/* ================= CREATE ORDER ================= */
export const createOrder = async (req, res) => {
  try {
    const cleanData = sanitizeOrderData(req.body);
    const ps = cleanData.productSnapshot || {};


    console.log("FILES:", req.files);

    // let productImages = [];

    // if (req.files?.length) {
    //   // productImages = req.files.map((file) =>
    //   //   file.path.replace(/\\/g, "/")
    //   // );

    //   productImages = req.files.map((file) =>
    //   `/uploads/${file.filename}`
    // );
    // }else if (Array.isArray(ps.productImages) && ps.productImages.length > 0) {
    //   productImages = ps.productImages;
    // }

    let productImages = [];

    /* 1️⃣ Uploaded images (highest priority) */
    if (req.files?.length) {
      productImages = req.files.map(file => `/uploads/${file.filename}`);
    }

    /* 2️⃣ Images sent from frontend snapshot */
    else if (Array.isArray(ps.productImages) && ps.productImages.length > 0) {
      // productImages = ps.productImages;

      productImages = ps.productImages.filter(
        (img) => img && !img.includes("undefined")
      );

    }

    /* 3️⃣ Fallback to productRef images */
    // else if (cleanData.productRef) {
    //   const product = await Product.findById(cleanData.productRef).lean();

    //   if (product?.images?.length) {
    //     productImages = product.images;
    //   }
    // }

    else if (cleanData.productRef) {
      const product = await Product.findById(cleanData.productRef).lean();

      if (product?.productImages?.length) {
        productImages = product.productImages;
      }
    }

    /* 4️⃣ Final fallback (prevent empty images) */
    if (!productImages.length && ps.productImage) {
      productImages = [ps.productImage];
    }

    if (!ps.metalType || !ps.metalPurity || !ps.netWeight) {
      return res.status(400).json({
        success: false,
        message: "Metal type, purity and net weight required",
      });
    }



    const rate = await RateConfig.findOne({ active: true }).lean();
    if (!rate) {
      return res.status(400).json({
        success: false,
        message: "No active rate configuration",
      });
    }


    let metalPayment = cleanData.metalPayment;

    if (metalPayment?.weight > 0) {
      const mt = metalPayment.metalType.toLowerCase();
      const baseRate =
        mt.includes("gold")
          ? rate.gold24KT
          : mt.includes("silver")
            ? rate.silver999
            : rate.platinum950;

      const purityFactor = PURITY_MAP[metalPayment.purity] || 1;
      const ratePerGram = Number((baseRate * purityFactor).toFixed(2));

      metalPayment = {
        ...metalPayment,
        baseRate,
        purityFactor,
        ratePerGram,
        totalValue: Number((ratePerGram * metalPayment.weight).toFixed(2)),
        receivedAt: metalPayment.receivedAt || new Date(),
      };
    }

    const mt = ps.metalType.toLowerCase();
    const baseRate =
      mt.includes("gold")
        ? rate.gold24KT
        : mt.includes("silver")
          ? rate.silver999
          : rate.platinum950;

    const purityFactor = PURITY_MAP[ps.metalPurity] || 1;
    const ratePerGram = Number((baseRate * purityFactor).toFixed(2));

    const metalSnapshot = {
      metalType: ps.metalType,
      purity: ps.metalPurity,
      baseRate,
      ratePerGram,
      lockedAt: new Date(),
    };

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `NZD-ORD-${today}-`;

    const last = await Order.findOne({
      orderNo: { $regex: `^${prefix}` },
    }).sort({ createdAt: -1 });

    const seq = last ? Number(last.orderNo.split("-").pop()) + 1 : 1;
    const orderNo = `${prefix}${String(seq).padStart(4, "0")}`;

    const order = await Order.create({
      orderNo,
      customer: cleanData.customer,
      productRef: cleanData.productRef || null,
      // productSnapshot: ps,
      //     productImage,
      //       productSnapshot: {
      //   ...ps,
      //   productImage: ps.productImage || cleanData.productImage || null,
      // },
      productSnapshot: {
        ...ps,
        // productImage, // ✅ USE THE RESOLVED PATH
        //  productImages,
        productImages: productImages || [],
      },

      metalSnapshot,
      // metalPayment: cleanData.metalPayment || undefined, 
      metalPayment: metalPayment || undefined,
      advancePayment: cleanData.advancePayment || undefined,
      status: "Placed",
    });

    if (order.metalPayment?.totalValue > 0) {

      await MetalLedger.create({
        type: "CREDIT",
        source: "ORDER",

        referenceId: order._id,
        referenceModel: "Order",

        partyName: order.customer?.name,

        metalType: order.metalPayment.metalType,
        purity: order.metalPayment.purity,

        weight: order.metalPayment.weight,
        ratePerGram: order.metalPayment.ratePerGram,

        value: order.metalPayment.totalValue,

        notes: `Metal received during order ${order.orderNo}`
      });

    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateOrderById = async (req, res) => {
  try {
    const cleanData = sanitizeOrderData(req.body);
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be modified after ${order.status}`,
      });
    }

    const updateOps = { $set: {} };


    let productImages;

    if (req.files?.length) {
      productImages = req.files.map((file) => `/uploads/${file.filename}`);
    }

    /* ================= CUSTOMER ================= */
    if (cleanData.customer) {
      Object.entries(cleanData.customer).forEach(([k, v]) => {
        updateOps.$set[`customer.${k}`] = v;
      });
    }

    /* ================= PRODUCT SNAPSHOT ================= */
    // if (cleanData.productSnapshot) {
    //   updateOps.$set.productSnapshot = {
    //     ...order.productSnapshot,
    //     ...cleanData.productSnapshot,
    //   };
    // }

    /* ================= PRODUCT SNAPSHOT ================= */
    // if (cleanData.productSnapshot) {
    //   Object.entries(cleanData.productSnapshot).forEach(([key, value]) => {
    //     updateOps.$set[`productSnapshot.${key}`] = value;
    //   });
    // }

    if (cleanData.productSnapshot) {
      Object.entries(cleanData.productSnapshot).forEach(([key, value]) => {
        updateOps.$set[`productSnapshot.${key}`] = value;
      });
    }

    /* ================= PRODUCT IMAGES ================= */
    // Combine existing images (from cleanData) and new uploads
    let finalImages = cleanData.productSnapshot?.productImages || order.productSnapshot?.productImages || [];

    if (productImages && productImages.length > 0) {
      finalImages = [...finalImages, ...productImages];
    }

    updateOps.$set["productSnapshot.productImages"] = finalImages;
    
    // Remove it from nested loop to avoid double setting if it was in cleanData
    if (cleanData.productSnapshot) {
      delete cleanData.productSnapshot.productImages;
    }




    /* ================= METAL PAYMENT (RECALCULATED) ================= */
    if (cleanData.metalPayment) {
      const mp = {
        ...order.metalPayment,
        ...cleanData.metalPayment,
      };

      if (mp.weight > 0 && mp.metalType && mp.purity) {
        const rate = await RateConfig.findOne({ active: true }).lean();
        if (!rate) {
          return res.status(400).json({
            success: false,
            message: "No active rate configuration",
          });
        }

        const mt = mp.metalType.toLowerCase();
        const baseRate =
          mt.includes("gold")
            ? rate.gold24KT
            : mt.includes("silver")
              ? rate.silver999
              : rate.platinum950;

        const purityFactor = PURITY_MAP[mp.purity] || 1;
        const ratePerGram = Number((baseRate * purityFactor).toFixed(2));

        mp.baseRate = baseRate;
        mp.purityFactor = purityFactor;
        mp.ratePerGram = ratePerGram;
        mp.totalValue = Number((ratePerGram * mp.weight).toFixed(2));
        mp.receivedAt = mp.receivedAt || new Date();
      }

      updateOps.$set.metalPayment = mp;
    }

    /* ================= PRICING / BILLING ================= */
    if (cleanData.pricingSnapshot) {
      updateOps.$set.pricingSnapshot = {
        ...order.pricingSnapshot,
        ...cleanData.pricingSnapshot,
      };
    }

    if (cleanData.markupPercent !== undefined) {
      updateOps.$set["pricingSnapshot.markupPercent"] =
        Number(cleanData.markupPercent);
    }

    if (cleanData.markupAmount !== undefined) {
      updateOps.$set["pricingSnapshot.markupAmount"] =
        Number(cleanData.markupAmount);
    }

    if (cleanData.finalPayable !== undefined) {
      updateOps.$set["pricingSnapshot.payable"] =
        Number(cleanData.finalPayable);
    }

    /* ================= SAFETY CHECK ================= */
    if (!Object.keys(updateOps.$set).length) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
        received: cleanData,
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateOps,
      { new: true }
    );

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateOrderStatusById = async (req, res) => {
  try {
    const { status: newStatus } = req.body;

    let order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const allowedTransitions = {
      Placed: ["In-Process", "Cancelled"],
      "In-Process": ["Ready", "Cancelled"],
      Ready: ["Delivered"],
      Delivered: [],
      Cancelled: [],
    };

    if (!allowedTransitions[order.status]?.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status change from ${order.status} to ${newStatus}`,
      });
    }

    /* ================= PRICING ================= */
    if (newStatus === "Ready") {
      if (!order.metalSnapshot?.ratePerGram) {
        return res.status(400).json({
          success: false,
          message: "Metal rate must be locked before Ready",
        });
      }

      // 🔥 RELOAD ORDER WITH LATEST PRODUCT SNAPSHOT
      order = await Order.findById(req.params.id);

      if (!order.productSnapshot?.netWeight) {
        return res.status(400).json({
          success: false,
          message: "Product details incomplete for pricing",
        });
      }

      const rateConfig = await RateConfig.findOne({ active: true }).lean();
      if (!rateConfig) {
        return res.status(400).json({
          success: false,
          message: "No active rate configuration",
        });
      }

      const pricingSnapshot = await calculateItem(
        {
          quantity: 1,
          metalRateOverride: order.metalSnapshot.ratePerGram,
          customSnapshot: {
            productDetails: order.productSnapshot,
          },
        },
        rateConfig
      );

      if (!pricingSnapshot || pricingSnapshot.subtotal <= 0) {
        console.error("❌ PRICING FAILED:", pricingSnapshot);
        return res.status(500).json({
          success: false,
          message: "Pricing calculation failed",
        });
      }

      order.pricingSnapshot = {
        ...pricingSnapshot,
        metalRateLocked: order.metalSnapshot.ratePerGram,
        lockedAt: new Date(),
        advanceUsed: order.advancePayment?.amount || 0,
        metalUsed: order.metalPayment?.totalValue || 0,
        payable: Math.max(
          pricingSnapshot.grandTotal -
          (order.advancePayment?.amount || 0) -
          (order.metalPayment?.totalValue || 0),
          0
        ),
      };
    }

    order.status = newStatus;
    order.orderStatusHistory.push({ status: newStatus, at: new Date() });

    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


/* ================= CANCEL ================= */
export const cancelOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled after ${order.status}`,
      });
    }

    order.status = "Cancelled";
    order.cancelReason = req.body.reason;
    order.cancelledAt = new Date();
    order.orderStatusHistory.push({
      status: "Cancelled",
      at: new Date(),
      reason: req.body.reason,
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error("CANCEL ORDER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= SKU ================= */
export const assignSkuToOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status !== "Ready") {
      return res.status(400).json({
        success: false,
        message: "SKU can be assigned only when order is Ready"
      });
    }

    order.sku = req.body.sku;
    await order.save();

    res.json({ success: true, order });
  } catch (err) {
    console.error("ASSIGN SKU ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= GET ================= */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });


    //     const BASE_URL = process.env.BASE_URL || "http://122.176.216.225:5000";

    // if (order.productSnapshot?.productImages) {
    //   order.productSnapshot.productImages =
    //     order.productSnapshot.productImages.map(
    //       img => `${BASE_URL}${img}`
    //     );
    // }

    if (order.productSnapshot?.productImages) {
      order.productSnapshot.productImages =
        order.productSnapshot.productImages.map(normalizeImage);
    }


    // Add debugging info
    if (order.status === "Ready" || order.status === "Delivered") {
      console.log("📋 ORDER DEBUG:", {
        orderNo: order.orderNo,
        status: order.status,
        hasPricingSnapshot: !!order.pricingSnapshot,
        pricingSnapshot: order.pricingSnapshot ? {
          subtotal: order.pricingSnapshot.subtotal,
          grandTotal: order.pricingSnapshot.grandTotal,
          metalValue: order.pricingSnapshot.metalValue,
          diamondValue: order.pricingSnapshot.diamondValue,
          componentBreakup: order.pricingSnapshot.componentBreakup?.length || 0
        } : null
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("GET ORDER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getOrderByOrderNo = async (req, res) => {
  try {
    const order = await Order.findOne({ orderNo: req.params.orderNo });
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    console.error("GET ORDER BY ORDER NO ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, date, startDate, endDate } = req.query;

    const filter = {};

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { orderNo: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.mobile": { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      filter.createdAt = {
        $gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(nextDate.setHours(0, 0, 0, 0))
      };
    } else if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(new Date(startDate).setHours(0, 0, 0, 0));
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        filter.createdAt.$lt = new Date(end.setHours(0, 0, 0, 0));
      }
    }

    /* ================= PAGINATED ORDERS ================= */
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Order.countDocuments(filter);

    /* ================= GLOBAL STATS (🔥 FIX 🔥) ================= */
    const statsAgg = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      total,
      placed: 0,
      processing: 0,
      ready: 0,
      delivered: 0,
      cancelled: 0,
    };

    statsAgg.forEach((s) => {
      switch (s._id) {
        case "Placed":
          stats.placed = s.count;
          break;
        case "In-Process":
          stats.processing = s.count;
          break;
        case "Ready":
          stats.ready = s.count;
          break;
        case "Delivered":
          stats.delivered = s.count;
          break;
        case "Cancelled":
          stats.cancelled = s.count;
          break;
      }
    });

    //     const BASE_URL = process.env.BASE_URL || "http://122.176.216.225:5000";

    // orders.forEach(order => {
    //   if (order.productSnapshot?.productImages) {
    //     order.productSnapshot.productImages =
    //       order.productSnapshot.productImages.map(
    //         img => `${BASE_URL}${img}`
    //       );
    //   }
    // });

    orders.forEach(order => {
      if (order.productSnapshot?.productImages) {
        order.productSnapshot.productImages =
          order.productSnapshot.productImages.map(normalizeImage);
      }
    });

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
      stats, // ✅ GLOBAL, pagination-independent
    });
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};


export const deleteOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Optional: Prevent deleting delivered orders
    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a delivered order",
      });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("DELETE ORDER ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
