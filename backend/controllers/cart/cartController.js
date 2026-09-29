


import Order from "../../models/Order.js";
import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import DiamondStock from "../../models/DiamondStock.js";
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

    const maxStock = Number(product.stock || 0);
    const addQty = Number(quantity);

    if (existing) {
      if (existing.quantity + addQty > maxStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot exceed available stock. Maximum ${maxStock} available.`,
        });
      }
      existing.quantity += addQty;
    } else {
      if (addQty > maxStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot exceed available stock. Maximum ${maxStock} available.`,
        });
      }
      cart.items.push({
        itemType: "PRODUCT",
        quantity: addQty,
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

/* ================= ADD LOOSE DIAMOND TO CART ================= */
export const addLooseDiamondToCart = async (req, res) => {
  try {
    const { sessionId, diamondId, diamondData } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: "sessionId is required" });
    }

    let diamond = null;
    if (diamondId) {
      diamond = await DiamondStock.findById(diamondId).lean();
    }

    const d = {
      shape: diamondData?.shape || diamond?.shape || "",
      weight: Number(diamondData?.weight ?? diamond?.weight ?? 0),
      color: diamondData?.color || diamond?.color || "",
      clarity: diamondData?.clarity || diamond?.clarity || "",
      cut: diamondData?.cut || diamond?.cut || "",
      lab: diamondData?.lab || diamond?.lab || "",
      labNatural: diamondData?.labNatural || diamond?.labNatural || (/lab\s*grown/i.test(diamondData?.title || diamond?.title || '') ? "Lab Grown" : "Natural"),
      certificateNo: diamondData?.certificateNo || diamond?.certificateNo || "",
      sellingPrice: Number(diamondData?.sellingPrice ?? diamond?.sellingPrice ?? 0),
      sku: diamondData?.sku || diamond?.sku || `LD-${Date.now().toString().slice(-6)}`,
      diamondId: diamond?._id || diamondData?.diamondId || undefined,
    };

    const rate = Number(diamondData?.sellingRate || diamond?.sellingRate || (d.weight > 0 ? Math.round(d.sellingPrice / d.weight) : d.sellingPrice));
    const availableStock = diamond ? Number(diamond.stock ?? 1) : Number(diamondData?.stock ?? 1);

    if (availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: "This loose diamond is out of stock",
      });
    }

    const cart = await getCart(sessionId);

    // Prevent exceeding available stock if already in cart
    if (d.diamondId) {
      const alreadyInCart = cart.items.find(
        (i) =>
          i.customSnapshot?.diamondId?.toString() === d.diamondId.toString() ||
          i.diamond?.toString() === d.diamondId.toString()
      );
      if (alreadyInCart) {
        if (alreadyInCart.quantity >= availableStock) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more. Maximum available stock is ${availableStock}.`,
          });
        }
        alreadyInCart.quantity += 1;
        await cart.save();
        const freshCart = await Cart.findOne({ sessionId }).lean();
        return res.json({ success: true, cart: freshCart });
      }
    }

    const origin = d.labNatural || "Lab Grown";
    const shapeStr = d.shape ? ` - ${d.shape}` : "";
    const qualityStr = (d.color || d.clarity) ? ` (${[d.color, d.clarity].filter(Boolean).join("/")})` : "";
    const title = `${origin} Diamond${shapeStr}${qualityStr}`.trim();

    cart.items.push({
      itemType: "LOOSE_DIAMOND",
      quantity: 1,
      diamond: d.diamondId || undefined,
      sku: d.sku,
      customSnapshot: {
        title,
        diamondId: d.diamondId,
        rateSource: "ACTIVE",
        isLooseDiamond: true,
        stock: availableStock,
        weight: d.weight,
        caratWeight: d.weight,
        sellingRate: rate,
        shape: d.shape,
        color: d.color,
        clarity: d.clarity,
        cut: d.cut,
        lab: d.lab,
        labNatural: d.labNatural,
        certificateNo: d.certificateNo,
        productDetails: {
          title,
          sku: d.sku,
          jewelleryCategory: "Loose Diamond",
          productType: "Loose Diamond",
          metalType: "LooseDiamond",
          metalPurity: "NA",
          netWeight: 0,
          grossWeight: 0,
          stock: availableStock,
          caratWeight: d.weight,
          diamondWeight: d.weight,
          sellingRate: rate,
          hsnCode: diamondData?.hsnCode || diamond?.hsnCode || "",
          certificates: d.certificateNo ? [{ lab: d.lab || "Cert", certificateNo: d.certificateNo }] : [],
          components: [
            {
              type: "Diamond",
              pricingRef: "DIAMOND",
              shape: d.shape,
              color: d.color,
              clarity: d.clarity,
              cut: d.cut,
              count: 1,
              weight: d.weight,
              grossWeight: d.weight,
              rateOverride: rate > 0 ? rate : null,
              diamondId: d.diamondId,
            },
          ],
        },
      },
    });

    await cart.save();
    const freshCart = await Cart.findOne({ sessionId }).lean();
    return res.json({ success: true, cart: freshCart });
  } catch (err) {
    console.error("ADD LOOSE DIAMOND TO CART ERROR:", err);
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

        /* ================= CUSTOM ORDER / LIVE CALCULATION ================= */
        if (item.itemType === "CUSTOM" && item.customSnapshot?.pricingSnapshot) {
          breakup = item.customSnapshot?.pricingSnapshot || {};
        } else {
          /* ================= PRODUCT OR LOOSE DIAMOND (LIVE CALCULATION) ================= */
          breakup = await calculateItem(
            {
              ...item,
              customSnapshot: {
                ...item.customSnapshot,
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

        let availableStock = undefined;
        if (item.itemType === "PRODUCT" && item.product) {
          const prod = await Product.findById(item.product).lean();
          if (prod) availableStock = Number(prod.stock ?? 0);
        } else if (item.itemType === "LOOSE_DIAMOND" || item.diamond || item.customSnapshot?.diamondId) {
          const diamondId = item.diamond || item.customSnapshot?.diamondId;
          if (diamondId) {
            const dStock = await DiamondStock.findById(diamondId).lean();
            if (dStock) availableStock = Number(dStock.stock ?? 1);
          } else if (item.customSnapshot?.stock !== undefined) {
            availableStock = Number(item.customSnapshot.stock);
          }
        }

        return {
          ...item,
          availableStock,
          breakup,
          customSnapshot: {
            ...item.customSnapshot,
            stock: availableStock ?? item.customSnapshot?.stock,
            title:
              item.customSnapshot?.title ||
              item.customSnapshot?.productDetails?.title ||
              (item.itemType === "CUSTOM"
                ? `Order #${item.customSnapshot?.orderNo || ""}`
                : "Jewellery Item"),

            productImages: finalImages,
            productImage: finalImage,

            productDetails: {
              ...item.customSnapshot?.productDetails,
              stock: availableStock ?? item.customSnapshot?.productDetails?.stock,
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

    const unroundedGrandTotal = Number((subtotal + gst).toFixed(2));
    const roundedGrandTotal = Math.round(unroundedGrandTotal);
    const roundOff = Number((roundedGrandTotal - unroundedGrandTotal).toFixed(2));

    const payable = Math.max(
      Math.round(roundedGrandTotal - advancePayment - metalPayment),
      0
    );

    const totals = {
      subtotal: Number(subtotal.toFixed(2)),
      gst: Number(gst.toFixed(2)),
      roundOff,
      grandTotal: roundedGrandTotal,

      grossTotal: Number(grossTotal.toFixed(2)),

      advancePayment: Number(advancePayment.toFixed(2)),
      metalPayment: Number(metalPayment.toFixed(2)),
      payable,

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

    const targetQty = Number(quantity);
    if (targetQty <= 0) {
      cart.items.splice(idx, 1);
    } else {
      const item = cart.items[idx];
      let maxStock = Infinity;

      if (item.itemType === "PRODUCT" && item.product) {
        const prod = await Product.findById(item.product).lean();
        if (prod) maxStock = Number(prod.stock ?? 0);
      } else if (item.itemType === "LOOSE_DIAMOND" || item.diamond || item.customSnapshot?.diamondId) {
        const diamondId = item.diamond || item.customSnapshot?.diamondId;
        if (diamondId) {
          const dStock = await DiamondStock.findById(diamondId).lean();
          if (dStock) maxStock = Number(dStock.stock ?? 1);
        } else if (item.customSnapshot?.stock !== undefined) {
          maxStock = Number(item.customSnapshot.stock);
        }
      }

      if (maxStock !== Infinity && targetQty > maxStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot exceed available stock. Maximum ${maxStock} available.`,
        });
      }

      cart.items[idx].quantity = targetQty;
    }

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
