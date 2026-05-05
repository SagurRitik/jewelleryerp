


import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import RateConfig from "../../models/RateConfig.js";
import calculateItem from "../../utils/calculateItem.js";
import { normalizeImage } from "../../utils/normalizeImage.js";

/* ================= GET OR CREATE CART ================= */
const getCart = async (sessionId) => {
  let cart = await Cart.findOne({ sessionId });
  if (!cart) {
    cart = await Cart.create({ sessionId, items: [] });
  }
  return cart;
};

/* ================= ADD PRODUCT TO CART ================= */
export const addProductToCart = async (req, res) => {
  try {
    const { sessionId, productId, quantity = 1 } = req.body;
    if (!sessionId || !productId) {
      return res.status(400).json({ success: false, message: "sessionId and productId required" });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (Number(product.stock || 0) <= 0) {
      return res.status(400).json({ success: false, message: "Product is out of stock" });
    }

    const cart = await getCart(sessionId);
    const normalizedImages = (product.images || []).map(normalizeImage);

    const existing = cart.items.find(
      (i) => i.itemType === "PRODUCT" && i.product?.toString() === productId
    );

    if (existing) {
      existing.quantity += Number(quantity);
    } else {
      cart.items.push({
        itemType: "PRODUCT",
        quantity: Number(quantity),
        product: product._id,
        sku: product.sku,
        customSnapshot: {
          title: product.title,

          // productImages: product.images || [],
          // productImage: normalizeImage(
          //   product.images?.[0] || null
          // ),
          productImages: normalizedImages,
          productImage: normalizedImages[0] || null,
          rateSource: "ACTIVE",
          // productDetails: {
          //   title: product.title,
          //   description: product.description || "",
          //   jewelleryCategory: product.jewelleryCategory || "",
          //   productType: product.productType || "",
          //   metalType: product.metalType,
          //   metalPurity: String(product.metalPurity || "").toUpperCase().replace(/\s/g, ""),
          //   metalColor: product.metalColor || "",
          //   netWeight: Number(product.netWeight) || 0,
          //   grossWeight: Number(product.grossWeight) || 0,
          //   wastagePercent: Number(product.wastagePercent) || 0,
          //   components: (product.components || []).map((c) => ({
          //     type: c.type,
          //     shape: String(c.shape || "").trim(),
          //     color: c.color || "",
          //     clarity: c.clarity || "",
          //     count: Number(c.count) || 0,
          //     weight: Number(c.weight) || 0,
          //     // grossWeight:
          //     //   Number(c.grossWeight) || (Number(c.weight || 0) * Number(c.count || 0)),
          //     grossWeight: Number(c.grossWeight || 0),
          //     pricingRef: c.pricingRef || "STONE",
          //     rateOverride: c.rateOverride || null,
          //   })),
          //   hsnCode: product.hsnCode || "",
          //   certificateNo: product.certificateNo || "",
          //   huid: product.huid || "",
          // },
          productDetails: JSON.parse(JSON.stringify(product)),
        },
      });
    }



    await cart.save();

    const freshCart = await Cart.findOne({ sessionId }).lean();
    return res.json({
      success: true,
      cart: freshCart,
    });

  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= ADD CUSTOM / ORDER TO CART ================= */
// export const addCustomToCart = async (req, res) => {
//   try {
//     const { sessionId, orderId } = req.body;

//     if (!sessionId || !orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "sessionId and orderId required",
//       });
//     }

//     const order = await Order.findById(orderId).lean();
//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // ✅ Ready check (business rule)
//     if (order.status !== "Ready") {
//       return res.status(400).json({
//         success: false,
//         message: "Order must be Ready before adding to cart",
//       });
//     }

//     if (!order.metalSnapshot?.ratePerGram) {
//       return res.status(400).json({
//         success: false,
//         message: "Locked metal rate not found on order",
//       });
//     }

//     const cart = await getCart(sessionId);

//     // Prevent duplicate
//     const alreadyAdded = cart.items.find(
//       (i) =>
//         i.itemType === "CUSTOM" &&
//         i.customSnapshot?.orderId?.toString() === order._id.toString()
//     );

//     if (alreadyAdded) {
//       return res.status(400).json({
//         success: false,
//         message: "Order already added to cart",
//       });
//     }

//     /* ================= 🔥 FORCE CALCULATION HERE ================= */

//     const rateConfig = await RateConfig.findOne({ active: true }).lean();
//     if (!rateConfig) {
//       return res.status(400).json({
//         success: false,
//         message: "Active rate configuration not found",
//       });
//     }

//     const pricing = await calculateItem(
//       {
//         quantity: 1,
//         metalRateOverride: order.metalSnapshot.ratePerGram, // 🔒 LOCKED METAL
//         customSnapshot: {
//           productDetails: order.productSnapshot,
//         },
//       },
//       rateConfig
//     );

//     if (!pricing || pricing.subtotal <= 0) {
//       return res.status(500).json({
//         success: false,
//         message: "Pricing calculation failed",
//       });
//     }

//     /* ================= PAYABLE ================= */
//     const advanceUsed = Number(order.advancePayment?.amount || 0);
//     const metalUsed = Number(order.metalPayment?.totalValue || 0);
//     const payable = Math.max(
//       pricing.grandTotal - advanceUsed - metalUsed,
//       0
//     );

//     const productSnapshot = order.productSnapshot || {};

//     const displayTitle =
//   productSnapshot.title ||
//   `Custom ${productSnapshot.metalType || "Gold"} ${
//     productSnapshot.jewelleryCategory || "Item"
//   }`;

//     /* ================= ADD TO CART ================= */
//     cart.items.push({
//       itemType: "CUSTOM",
//       quantity: 1,
//       priceEstimate: payable,
//       customSnapshot: {
//         orderId: order._id,
//         orderNo: order.orderNo,
//         //  title: order.productSnapshot?.title || `Order #${order.orderNo}`,
//           title: displayTitle,
//         rateSource: "ORDER_LOCKED",
//         pricingSnapshot: {
//           ...pricing,
//           metalRateLocked: order.metalSnapshot.ratePerGram,
//           advanceUsed,
//           metalUsed,
//           payable,
//         },
//         // productImage: null,
//   //       productImage:
//   // order.productSnapshot?.productImage ||
//   // null,
//   productImages: order.productSnapshot?.productImages || [],

// productImage: normalizeImage(
//   order.productSnapshot?.productImages?.[0] || null
// ),

//         // productDetails: {
//         //   metalType: order.productSnapshot.metalType,
//         //   metalPurity: order.productSnapshot.metalPurity,
//         //   netWeight: order.productSnapshot.netWeight,
//         //   components: order.productSnapshot.components || [],
//         // },
//         productDetails: {
//   title: order.productSnapshot.title || "",
//   description: order.productSnapshot.description || "",
//   jewelleryCategory: order.productSnapshot.jewelleryCategory || "",
//   productType: order.productSnapshot.productType || "",

//   metalType: order.productSnapshot.metalType,
//   metalPurity: order.productSnapshot.metalPurity,
//   netWeight: order.productSnapshot.netWeight,
//   grossWeight: order.productSnapshot.grossWeight || 0,
//   wastagePercent: order.productSnapshot.wastagePercent || 0,

//   components: order.productSnapshot.components || [],
// },

//       },
//     });

//     await cart.save();

//     const freshCart = await Cart.findOne({ sessionId }).lean();

//     return res.json({
//       success: true,
//       cart: freshCart,
//       message: "Order added to cart with fresh calculation",
//     });
//   } catch (err) {
//     console.error("ADD CUSTOM ERROR:", err);
//     res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

export const addCustomToCart = async (req, res) => {
  try {
    const { sessionId, orderId } = req.body;

    /* ================= VALIDATION ================= */
    if (!sessionId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "sessionId and orderId required",
      });
    }

    const order = await Order.findById(orderId).lean();


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    /* ================= BUSINESS RULE CHECK ================= */
    if (order.status !== "Ready") {
      return res.status(400).json({
        success: false,
        message: "Order must be Ready before adding to cart",
      });
    }

    if (!order.metalSnapshot?.ratePerGram) {
      return res.status(400).json({
        success: false,
        message: "Locked metal rate not found on order",
      });
    }

    /* ================= GET CART ================= */
    const cart = await getCart(sessionId);

    /* ================= DUPLICATE CHECK ================= */
    const alreadyAdded = cart.items.find(
      (i) =>
        i.itemType === "CUSTOM" &&
        i.customSnapshot?.orderId?.toString() === order._id.toString()
    );

    if (alreadyAdded) {
      return res.status(400).json({
        success: false,
        message: "Order already added to cart",
      });
    }

    /* ================= RATE CONFIG ================= */
    const rateConfig = await RateConfig.findOne({ active: true }).lean();

    if (!rateConfig) {
      return res.status(400).json({
        success: false,
        message: "Active rate configuration not found",
      });
    }

    /* ================= CALCULATE PRICING ================= */
    const pricing = await calculateItem(
      {
        quantity: 1,
        metalRateOverride: order.metalSnapshot.ratePerGram, // 🔒 locked rate
        customSnapshot: {
          productDetails: order.productSnapshot,
        },
      },
      rateConfig
    );

    if (!pricing || pricing.subtotal <= 0) {
      return res.status(500).json({
        success: false,
        message: "Pricing calculation failed",
      });
    }

    /* ================= PAYMENTS ================= */
    const advanceUsed = Number(order.advancePayment?.amount || 0);
    const metalUsed = Number(order.metalPayment?.totalValue || 0);

    const payable = Math.max(
      pricing.grandTotal - advanceUsed - metalUsed,
      0
    );

    /* ================= DISPLAY TITLE ================= */
    const productSnapshot = order.productSnapshot || {};

    const displayTitle =
      productSnapshot.title ||
      `Custom ${productSnapshot.metalType || "Gold"} ${productSnapshot.jewelleryCategory || "Item"
      }`;

    /* ================= MULTIPLE IMAGE SAFE HANDLING ================= */
    const rawImages = productSnapshot.productImages || [];

    const normalizedImages = rawImages.map((img) =>
      normalizeImage(img)
    );

    const previewImage = normalizedImages[0] || null;


    /* ================= PUSH TO CART ================= */
    cart.items.push({
      itemType: "CUSTOM",
      quantity: 1,
      priceEstimate: payable,
      customSnapshot: {
        orderId: order._id,
        orderNo: order.orderNo,
        title: displayTitle,
        rateSource: "ORDER_LOCKED",

        pricingSnapshot: {
          ...pricing,
          metalRateLocked: order.metalSnapshot.ratePerGram,
          advanceUsed,
          metalUsed,
          payable,
        },

        /* 🔥 MULTIPLE IMAGE SUPPORT */
        productImages: normalizedImages,
        productImage: previewImage, // quick preview fallback

        productDetails: {
          title: productSnapshot.title || "",
          description: productSnapshot.description || "",
          jewelleryCategory: productSnapshot.jewelleryCategory || "",
          productType: productSnapshot.productType || "",
          metalType: productSnapshot.metalType,
          metalPurity: productSnapshot.metalPurity,
          netWeight: productSnapshot.netWeight,
          grossWeight: productSnapshot.grossWeight || 0,
          wastagePercent: productSnapshot.wastagePercent || 0,
          components: productSnapshot.components || [],
          certificates: productSnapshot.certificates || [],
        },
      },
    });

    await cart.save();

    const freshCart = await Cart.findOne({ sessionId }).lean();

    return res.json({
      success: true,
      cart: freshCart,
      message: "Order added to cart with locked pricing",
    });
  } catch (err) {
    console.error("ADD CUSTOM ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


/* ================= GET CART (🔥 CALCULATION FIX HERE) ================= */

export const getCartBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const cart = await Cart.findOne({ sessionId }).lean();

    if (!cart) {
      return res.json({
        success: true,
        cart: {
          sessionId,
          items: [],
          totals: {
            subtotal: 0,
            gst: 0,
            grandTotal: 0,

            advancePayment: 0,
            metalPayment: 0,
            payable: 0,
            discount: 0,
            discountDiamond: 0,
            discountStone: 0,
            discountMaking: 0,
          },
        },
      });
    }

    const rateConfig = await RateConfig.findOne({ active: true }).lean();
    if (!rateConfig) throw new Error("Active rate config missing");

    let subtotal = 0;
    let gst = 0;
    let grandTotal = 0;

    let grossTotal = 0;


    let advancePayment = 0;
    let metalPayment = 0;

    let discountDiamond = 0;
    let discountStone = 0;
    let discountMaking = 0;

    const items = await Promise.all(
      cart.items.map(async (item) => {
        let breakup;

        /* ================= CUSTOM ORDER ================= */
        if (item.itemType === "CUSTOM") {
          breakup = item.customSnapshot?.pricingSnapshot || {};
        } else {
          /* ================= PRODUCT (LIVE CALCULATION) ================= */
          breakup = await calculateItem(
            {
              ...item,
              customSnapshot: {
                productDetails: item.customSnapshot?.productDetails,
                title:
                  item.customSnapshot?.title ||
                  item.customSnapshot?.productDetails?.title ||
                  `Custom ${item.customSnapshot?.productDetails?.metalType || "Gold"
                  } Item`,
              },
            },
            rateConfig
          );
        }
        grossTotal += breakup.grossTotal || 0;
        subtotal += breakup.subtotal || 0;
        gst += breakup.gst || 0;
        grandTotal += breakup.grandTotal || 0;

        // 🔥 COLLECT PAYMENTS
        advancePayment += breakup.advanceUsed || 0;
        metalPayment += breakup.metalUsed || 0;

        // 🔥 COLLECT DISCOUNTS
        discountDiamond += breakup.discountDiamond || 0;
        discountStone += breakup.discountStone || 0;
        discountMaking += breakup.discountMaking || 0;


        //   const normalizedImages = Array.isArray(item.customSnapshot?.productImages)
        // ? item.customSnapshot.productImages.map((img) => normalizeImage(img))
        // : [];

        const rawImages = item.customSnapshot?.productImages;
        const rawImage = item.customSnapshot?.productImage;

        // normalize array
        const normalizedImages = Array.isArray(rawImages)
          ? rawImages.map((img) => normalizeImage(img)).filter(Boolean)
          : [];

        // fallback (IMPORTANT)
        const fallbackImage = normalizeImage(rawImage);

        // final images decide
        const finalImages =
          normalizedImages.length > 0
            ? normalizedImages
            : fallbackImage
              ? [fallbackImage]
              : [];

        const finalImage = finalImages[0] || null;

        return {
          ...item,
          breakup,
          customSnapshot: {
            ...item.customSnapshot,

            title:
              item.customSnapshot?.title ||
              item.customSnapshot?.productDetails?.title ||
              (item.itemType === "CUSTOM"
                ? `Order #${item.customSnapshot?.orderNo || ""}`
                : "Jewellery Item"),

            // productImage: normalizeImage(
            //   item.customSnapshot?.productImage
            // ),
            //             productImages: item.customSnapshot?.productImages || [],

            // productImage: normalizeImage(
            //   item.customSnapshot?.productImages?.[0] ||
            //   item.customSnapshot?.productImage ||
            //   null
            // ),

            // productImages: normalizedImages,
            // productImage: normalizedImages[0] || null,

            productImages: finalImages,
            productImage: finalImage,

            productDetails: {
              ...item.customSnapshot?.productDetails,
              title:
                item.customSnapshot?.productDetails?.title ||
                item.customSnapshot?.title ||
                (item.itemType === "CUSTOM"
                  ? `Order #${item.customSnapshot?.orderNo || ""}`
                  : undefined),
            },
          },
        };
      })
    );

    const discount =
      discountDiamond + discountStone + discountMaking;

    const payable = Math.max(
      grandTotal - advancePayment - metalPayment,
      0
    );

    const totals = {
      subtotal: Number(subtotal.toFixed(2)),
      gst: Number(gst.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),

      grossTotal: Number(grossTotal.toFixed(2)),

      advancePayment: Number(advancePayment.toFixed(2)),
      metalPayment: Number(metalPayment.toFixed(2)),
      payable: Number(payable.toFixed(2)),

      discount: Number(discount.toFixed(2)),
      discountDiamond: Number(discountDiamond.toFixed(2)),
      discountStone: Number(discountStone.toFixed(2)),
      discountMaking: Number(discountMaking.toFixed(2)),
    };

    console.log("🧾 FINAL CART TOTALS:", totals);

    return res.json({
      success: true,
      cart: {
        ...cart,
        items,
        totals,
      },
    });
  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= UPDATE QUANTITY ================= */
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { sessionId, itemId, quantity } = req.body;
    const cart = await Cart.findOne({ sessionId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const idx = cart.items.findIndex((i) => i._id.toString() === itemId);
    if (idx === -1) return res.status(404).json({ success: false, message: "Item not found" });

    if (quantity <= 0) cart.items.splice(idx, 1);
    else cart.items[idx].quantity = Number(quantity);

    await cart.save();
    return getCartBySession(req, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= REMOVE ITEM ================= */
export const removeCartItem = async (req, res) => {
  try {
    const { sessionId, itemId } = req.params;
    const cart = await Cart.findOne({ sessionId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();
    return getCartBySession(req, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================= CLEAR CART ================= */
export const clearCart = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Cart.findOneAndDelete({ sessionId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
