import SalesOrder from "../../models/SalesOrder.js";

const round2 = (n) => Math.round(Number(n || 0) * 100) / 100;

export const getFindCalculation = async (req, res) => {
  try {
    const { query } = req.query;
    const rawIdentifier = req.params.identifier || query || "";

    if (!rawIdentifier) {
      return res.status(400).json({
        success: false,
        error: "Invoice number or QR Code data is required",
      });
    }

    let invoice = null;
    let qrParsedData = null;

    // 1. Try parsing if rawIdentifier is JSON string from QR code
    if (typeof rawIdentifier === "string" && rawIdentifier.trim().startsWith("{")) {
      try {
        qrParsedData = JSON.parse(rawIdentifier.trim());
      } catch (e) {
        qrParsedData = null;
      }
    }

    let searchInvNo = qrParsedData?.invNo || rawIdentifier.trim();
    searchInvNo = searchInvNo.replace(/^INV:/i, "").trim();

    // 2. Search Database by invoiceNo or MongoDB ObjectId
    if (searchInvNo) {
      if (searchInvNo.match(/^[0-9a-fA-F]{24}$/)) {
        invoice = await SalesOrder.findById(searchInvNo).lean();
      } else {
        invoice = await SalesOrder.findOne({
          invoiceNo: { $regex: new RegExp(`^${searchInvNo}$`, "i") }
        }).lean();

        // Fallback partial match
        if (!invoice) {
          invoice = await SalesOrder.findOne({
            invoiceNo: { $regex: searchInvNo, $options: "i" }
          }).lean();
        }
      }
    }

    // 3. Build Detailed Mathematical Calculation Audit
    if (invoice) {
      const itemsAudit = (invoice.items || []).map((item, index) => {
        const pd = item.itemSnapshot?.productDetails || item.customSnapshot?.productDetails || {};
        const breakup = item.breakup || {};
        const components = breakup.componentBreakup || pd.components || [];

        const metalType = pd.metalType || "Gold";
        const metalPurity = pd.metalPurity || "14kt";
        const grossWeight = round2(pd.grossWeight || item.grossWeight || 0);
        const netWeight = round2(pd.netWeight || item.netWeight || 0);
        const fineGold = round2(pd.fineGold || 0);

        const metalRate = round2(breakup.metalRate || 0);
        const metalValue = round2(breakup.metalValue || (netWeight * metalRate));

        const diamondComponents = components.filter(c => (c.pricingRef === "DIAMOND" || c.type === "Diamond"));
        const totalDiamondWeight = round2(breakup.totalDiamondWeight || diamondComponents.reduce((sum, c) => sum + (Number(c.weight || 0) * Number(c.count || 1)), 0));
        const totalDiamondValue = round2(breakup.diamondValue || breakup.totalDiamondValue || diamondComponents.reduce((sum, c) => sum + Number(c.value || 0), 0));

        const stoneComponents = components.filter(c => (c.pricingRef === "STONE" || c.type === "Stone"));
        const totalStoneValue = round2(breakup.stoneValue || breakup.totalStoneValue || stoneComponents.reduce((sum, c) => sum + Number(c.value || 0), 0));

        const accessoryComponents = components.filter(c => (c.pricingRef === "BELT" || c.type === "Accessory"));
        const totalAccessoryValue = round2(breakup.accessoryValue || breakup.totalAccessoryValue || accessoryComponents.reduce((sum, c) => sum + Number(c.value || 0), 0));

        const makingCharge = round2(breakup.makingCharge || 0);

        const itemGrossTotal = round2(breakup.grossTotal || (metalValue + totalDiamondValue + totalStoneValue + totalAccessoryValue + makingCharge));
        const itemRegularDiscount = round2(Number(breakup.discountMaking || 0) + Number(breakup.discountDiamond || 0) + Number(breakup.discountStone || 0));
        const itemNetSubtotal = round2(breakup.finalAmount || breakup.subtotal || Math.max(0, itemGrossTotal - itemRegularDiscount));

        return {
          itemIndex: index + 1,
          title: pd.title || item.title || `Item ${index + 1}`,
          sku: pd.sku || item.sku || "N/A",
          hsnCode: pd.hsnCode || item.hsn || "7113119",
          huid: pd.huid || "N/A",

          // Metal Formula Audit
          metalDetails: {
            metalType,
            metalPurity,
            grossWeight,
            netWeight,
            fineGold,
            metalRate,
            metalValueFormula: `${netWeight}g (Net Wt) × ₹${metalRate.toLocaleString("en-IN")}/g`,
            metalValue,
          },

          // Component Formula Audit
          componentDetails: {
            diamondComponents,
            totalDiamondWeight,
            totalDiamondValue,
            stoneComponents,
            totalStoneValue,
            totalAccessoryValue,
          },

          diamondDetails: {
            totalWeightCarat: totalDiamondWeight,
            totalValue: totalDiamondValue,
          },
          stoneDetails: {
            totalValue: totalStoneValue,
          },
          accessoryDetails: {
            totalValue: totalAccessoryValue,
          },

          // Service / Making Audit
          makingDetails: {
            makingChargeFormula: `Labor / Making Fees`,
            makingCharge,
          },

          // Item Totals
          itemGrossTotal,
          itemRegularDiscount,
          itemNetSubtotal,
        };
      });

      const totals = invoice.totals || {};
      const calculatedItemsGross = round2(itemsAudit.reduce((sum, item) => sum + item.itemGrossTotal, 0));
      const calculatedItemsRegDisc = round2(itemsAudit.reduce((sum, item) => sum + item.itemRegularDiscount, 0));

      const grossTotal = round2(totals.grossTotal || calculatedItemsGross);
      const regularDiscount = round2(totals.regularDiscount || calculatedItemsRegDisc);
      const celebrationDiscount = round2(totals.celebrationDiscount || 0);
      const combinedDiscount = round2(totals.discount || (regularDiscount + celebrationDiscount));
      const subtotal = round2(totals.subtotal || Math.max(0, grossTotal - combinedDiscount));
      const gst = round2(totals.gst || 0);
      const cgst = round2(totals.cgst ?? (gst / 2));
      const sgst = round2(totals.sgst ?? (gst / 2));
      const grandTotal = round2(totals.grandTotal || (subtotal + gst));
      const netPayable = round2(totals.netPayable || grandTotal);

      return res.json({
        success: true,
        source: "DATABASE",
        invoiceNo: invoice.invoiceNo,
        date: invoice.date || invoice.createdAt,
        customer: invoice.customer || {},
        payment: invoice.payment || {},

        // Exhaustive Audit Object
        audit: {
          itemsCount: itemsAudit.length,
          items: itemsAudit,

          calculationSteps: {
            step1_grossTotal: {
              label: "1. Gross Product Value (Sum of Metal + Diamond + Stone + Making)",
              value: grossTotal,
            },
            step1_grossProductValue: {
              label: "1. Gross Product Value (Sum of Metal + Diamond + Stone + Making)",
              value: grossTotal,
            },
            step2_regularDiscount: {
              label: "2. Regular Scheme Discount (RateConfig / Product Offers)",
              value: regularDiscount,
            },
            step3_celebrationDiscount: {
              label: "3. Celebration Gift Discount (Birthday / Anniversary Offer)",
              value: celebrationDiscount,
            },
            step4_totalDiscount: {
              label: "4. Total Combined Discount Applied",
              formula: `₹${regularDiscount.toLocaleString("en-IN")} (Regular) + ₹${celebrationDiscount.toLocaleString("en-IN")} (Celebration)`,
              value: combinedDiscount,
            },
            step5_taxableSubtotal: {
              label: "5. Net Taxable Subtotal (Gross Total - Combined Discount)",
              formula: `₹${grossTotal.toLocaleString("en-IN")} - ₹${combinedDiscount.toLocaleString("en-IN")}`,
              value: subtotal,
            },
            step6_taxation: {
              label: "6. Applicable GST (3%)",
              formula: `3% on Taxable Subtotal ₹${subtotal.toLocaleString("en-IN")}`,
              gstTotal: gst,
              cgst1_5: cgst,
              sgst1_5: sgst,
            },
            step7_grandTotal: {
              label: "7. Invoice Grand Total",
              formula: `Taxable Subtotal ₹${subtotal.toLocaleString("en-IN")} + GST ₹${gst.toLocaleString("en-IN")}`,
              value: grandTotal,
            },
            step8_settlement: {
              label: "8. Final Payable & Settlement",
              value: netPayable,
              mode: invoice.payment?.mode || "CASH",
              status: invoice.payment?.status || "PAID",
            }
          }
        },

        rawInvoice: invoice
      });
    }

    // 4. Fallback if decoded from self-contained QR payload directly without DB record (e.g., deleted invoice)
    if (qrParsedData) {
      const tot = qrParsedData.totals || {};
      const cust = qrParsedData.customer || {};
      const itemsList = qrParsedData.items || [];

      const items = itemsList.map((it, idx) => {
        const nWt = round2(it.nWt || it.netWeight || 0);
        const gWt = round2(it.gWt || it.grossWeight || 0);
        const mRate = round2(it.mRate || it.metalRate || 0);
        const mVal = round2(it.mVal || (nWt * mRate));
        const dWt = round2(it.dWt || it.diamondWeight || 0);
        const dVal = round2(it.dVal || it.diamondValue || 0);
        const stVal = round2(it.stVal || it.stoneValue || 0);
        const accVal = round2(it.accVal || it.accessoryValue || 0);
        const making = round2(it.making || it.makingCharge || 0);
        const regDisc = round2(it.regDisc || 0);
        const itemGross = round2(it.grossTotal || (mVal + dVal + stVal + accVal + making));
        const itemNet = round2(it.subtotal || Math.max(0, itemGross - regDisc));

        return {
          itemIndex: idx + 1,
          title: it.title || `Item ${idx + 1}`,
          sku: it.sku || "",
          metalDetails: {
            metalType: it.metal || "Gold",
            metalPurity: it.purity || "18kt",
            grossWeight: gWt,
            netWeight: nWt,
            fineGold: round2(nWt * (it.purity?.includes("14") ? 0.585 : it.purity?.includes("18") ? 0.750 : 0.916)),
            metalRate: mRate,
            metalValueFormula: `${nWt}g (Net Wt) × ₹${mRate.toLocaleString("en-IN")}/g`,
            metalValue: mVal,
          },
          diamondDetails: {
            totalWeightCarat: dWt,
            totalValue: dVal,
          },
          stoneDetails: {
            totalValue: stVal,
          },
          accessoryDetails: {
            totalValue: accVal,
          },
          componentDetails: {
            totalDiamondWeight: dWt,
            totalDiamondValue: dVal,
            totalStoneValue: stVal,
            totalAccessoryValue: accVal,
          },
          makingDetails: {
            makingCharge: making,
          },
          itemGrossTotal: itemGross,
          itemNetSubtotal: itemNet,
          regularDiscount: regDisc,
        };
      });

      const calculatedGross = round2(items.reduce((sum, i) => sum + i.itemGrossTotal, 0));
      const calculatedRegDisc = round2(items.reduce((sum, i) => sum + i.regularDiscount, 0));

      const subtotal = round2(tot.subtotal || calculatedGross);
      const regDiscount = round2(tot.regularDiscount || calculatedRegDisc);
      const celebDiscount = round2(tot.celebrationDiscount || 0);
      const totalDiscount = round2(tot.discount || (regDiscount + celebDiscount));
      const taxableSubtotal = round2(tot.taxableAmount || Math.max(0, subtotal - totalDiscount));
      const gstTotal = round2(tot.gst || (taxableSubtotal * 0.03));
      const cgst = round2(tot.cgst ?? (gstTotal / 2));
      const sgst = round2(tot.sgst ?? (gstTotal / 2));
      const grandTotal = round2(tot.grandTotal || (taxableSubtotal + gstTotal));
      const netPayable = round2(tot.netPayable || grandTotal);

      return res.json({
        success: true,
        source: "SELF_CONTAINED_QR_RECORD",
        isOfflineSelfContainedRecord: true,
        invoiceNo: qrParsedData.invNo || searchInvNo || "QR-RECORD",
        date: qrParsedData.date || new Date(),
        customer: {
          name: typeof cust === "string" ? cust : (cust?.name || "Retail Customer"),
          mobile: typeof cust === "object" ? (cust?.mobile || "") : "",
        },
        audit: {
          itemsCount: items.length,
          items,
          calculationSteps: {
            step1_grossTotal: {
              label: "1. Gross Product Value (Before Offer)",
              formula: "Sum of Metal + Diamond + Stone + Making for all items",
              value: subtotal,
            },
            step1_grossProductValue: {
              label: "1. Gross Product Value (Before Offer)",
              formula: "Sum of Metal + Diamond + Stone + Making for all items",
              value: subtotal,
            },
            step2_regularDiscount: {
              label: "2. Regular Scheme Discount (Offer)",
              formula: "Item level offer discounts",
              value: regDiscount,
            },
            step3_celebrationDiscount: {
              label: "3. Celebration Gift Offer 🎁 (Birthday / Anniversary)",
              formula: celebDiscount > 0 ? "Special celebration offer applied" : "No celebration offer",
              value: celebDiscount,
            },
            step4_totalDiscount: {
              label: "4. Total Combined Offer Discount",
              formula: "Regular Offer + Celebration Offer",
              value: totalDiscount,
            },
            step5_taxableSubtotal: {
              label: "5. Net Taxable Subtotal",
              formula: "Gross Product Value - Total Offer Discount",
              value: taxableSubtotal,
            },
            step6_taxation: {
              label: "6. Applicable GST (3%)",
              gstRate: "3%",
              cgst1_5: cgst,
              sgst1_5: sgst,
              gstTotal: gstTotal,
            },
            step7_grandTotal: {
              label: "7. Invoice Grand Total",
              formula: `Taxable Subtotal ₹${taxableSubtotal.toLocaleString("en-IN")} + GST ₹${gstTotal.toLocaleString("en-IN")}`,
              value: grandTotal,
            },
            step8_settlement: {
              label: "8. Final Payable & Settlement",
              value: netPayable,
              mode: qrParsedData.payment?.mode || "CASH",
              status: qrParsedData.payment?.status || "PAID",
            }
          }
        }
      });
    }

    return res.status(404).json({
      success: false,
      error: `No invoice found for '${searchInvNo}'. Please verify the Invoice Number or QR Code.`,
    });

  } catch (err) {
    console.error("FIND CALCULATION ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
