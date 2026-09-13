



//=========================================================================






import React, { useState, useEffect, useRef } from "react";
import { createManualInvoice } from "../api/invoiceApi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API from "../api";
import { resolveImage } from "../utils/resolveImage";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Sparkles, Loader2, PackageSearch, Search, X, Gem, Barcode, Check, Heart, LayoutGrid, Coins, Shield, Globe, MapPin } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { useRates } from "../context/RatesContext";
import { INDIAN_STATE_CODES, INDIAN_STATE_OPTIONS, determineTaxType, validateGSTIN, normalizeStateCode } from "../utils/gstStateHelper";

export default function ManualBillingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirm, showAlert } = useModal();
  const { rates } = useRates();

  const getFormattedInvoiceNo = (datePart, seqVal) => {
    if (!seqVal?.trim()) return "";
    const seq = seqVal.trim();
    const paddedSeq = /^\d+$/.test(seq) ? seq.padStart(5, "0") : seq;
    const cleanDatePart = datePart ? datePart.trim() : "";
    return `NZD-${cleanDatePart}-${paddedSeq}`;
  };

  const [credits, setCredits] = useState([]);
  const [selectedCreditIds, setSelectedCreditIds] = useState([]);
  const [appliedCredit, setAppliedCredit] = useState(0);
  const [isSplitPayment, setIsSplitPayment] = useState(false);
  const [splitPayments, setSplitPayments] = useState([
    { mode: "CASH", amount: 0, referenceNo: "" },
    { mode: "UPI", amount: 0, referenceNo: "" },
  ]);

  const purityOptions = {
    gold: ["24KT", "22KT", "18KT", "14KT", "10KT", "9KT"],
    Gold: ["24KT", "22KT", "18KT", "14KT", "10KT", "9KT"],
    silver: ["999", "925", "835", "800"],
    Silver: ["999", "925", "835", "800"],
    platinum: ["950", "900"],
    Platinum: ["950", "900"],
  };

  const emptyItem = {
    // PRODUCT
    title: "",
    hsnCode: "",
    certificates: [], // Multiple certificates support

    // METAL
    metalType: "Gold",
    purity: "14KT",
    grossWeight: "",
    netWeight: "",
    metalRate: "",

    diamonds: [
      { qty: "", grossWeight: "", netWeight: "", rate: "" }
    ],
    stones: [
      { qty: "", grossWeight: "", netWeight: "", rate: "" }
    ],
    belts: [
      { material: "", color: "", size: "", qty: "", rate: "" }
    ],

    // OTHER
    makingRate: "", // ₹ per gram

    discounts: {
      making: { type: "flat", value: "" },
      diamond: { type: "flat", value: "" },
      stone: { type: "flat", value: "" },
      belt: { type: "flat", value: "" },
    },
    discountEnabled: true, // Auto-open for UI match
  };

  const addDiamond = (itemIndex) => {
    const updated = [...form.items];

    // updated[itemIndex].diamonds.push({ qty: "", weight: "", rate: "" });
    updated[itemIndex].diamonds.push({
      qty: "",
      grossWeight: "",
      netWeight: "",
      rate: "",
    });

    setForm((p) => ({ ...p, items: updated }));
  };

  const removeDiamond = (itemIndex, dIndex) => {
    const updated = [...form.items];
    updated[itemIndex].diamonds.splice(dIndex, 1);
    setForm((p) => ({ ...p, items: updated }));
  };

  const handleDiamondChange = (itemIndex, dIndex, field, value) => {
    const updated = [...form.items];
    const diamond = updated[itemIndex].diamonds[dIndex];

    diamond[field] = value;

    const qty = Number(diamond.qty || 0);
    const gross = Number(diamond.grossWeight || 0);

    if (qty > 0 && gross > 0) {
      diamond.netWeight = (gross / qty).toFixed(3);
    } else {
      diamond.netWeight = "";
    }

    setForm((p) => ({ ...p, items: updated }));
  };


  const addStone = (itemIndex) => {
    const updated = [...form.items];
    updated[itemIndex].stones.push({
      qty: "",
      grossWeight: "",
      netWeight: "",
      rate: "",
    });
    setForm((p) => ({ ...p, items: updated }));
  };

  const removeStone = (itemIndex, sIndex) => {
    const updated = [...form.items];
    updated[itemIndex].stones.splice(sIndex, 1);
    setForm((p) => ({ ...p, items: updated }));
  };
  const handleStoneChange = (itemIndex, sIndex, field, value) => {
    const updated = [...form.items];
    const stone = updated[itemIndex].stones[sIndex];

    stone[field] = value;

    const qty = Number(stone.qty || 0);
    const gross = Number(stone.grossWeight || 0);

    if (qty > 0 && gross > 0) {
      stone.netWeight = (gross * qty).toFixed(3);
    } else {
      stone.netWeight = "";
    }

    setForm((p) => ({ ...p, items: updated }));
  };

  const addBelt = (itemIndex) => {
    const updated = [...form.items];
    updated[itemIndex].belts.push({
      material: "",
      color: "",
      size: "",
      qty: "",
      rate: "",
    });
    setForm((p) => ({ ...p, items: updated }));
  };

  const removeBelt = (itemIndex, bIndex) => {
    const updated = [...form.items];
    updated[itemIndex].belts.splice(bIndex, 1);
    setForm((p) => ({ ...p, items: updated }));
  };

  const handleBeltChange = (itemIndex, bIndex, field, value) => {
    const updated = [...form.items];
    const belt = updated[itemIndex].belts[bIndex];
    belt[field] = value;
    setForm((p) => ({ ...p, items: updated }));
  };


  const addCertificate = (itemIndex) => {
    const updated = [...form.items];
    if (!updated[itemIndex].certificates) {
      updated[itemIndex].certificates = [];
    }
    updated[itemIndex].certificates.push({ lab: "", certificateNo: "" });
    setForm((p) => ({ ...p, items: updated }));
  };

  const removeCertificate = (itemIndex, cIndex) => {
    const updated = [...form.items];
    updated[itemIndex].certificates.splice(cIndex, 1);
    setForm((p) => ({ ...p, items: updated }));
  };

  const handleCertificateChange = (itemIndex, cIndex, field, value) => {
    const updated = [...form.items];
    updated[itemIndex].certificates[cIndex][field] = value;
    setForm((p) => ({ ...p, items: updated }));
  };



  const getInitialForm = () => {
    const savedRates = localStorage.getItem("billing_base_rates");
    const savedGST = localStorage.getItem("billing_gst");

    return {
      date: new Date().toISOString().split("T")[0],
      invoiceDatePart: new Date().toISOString().split("T")[0].replace(/-/g, "/"),
      invoiceSeq: "",
      baseRates: savedRates
        ? JSON.parse(savedRates)
        : {
          gold24k: "",
          silver999: "",
          platinum999: "",
        },

      customer: {
        name: "",
        mobile: "",
        email: "",
        address: "",
        gstin: "",
        stateCode: "",
        panNumber: "",
      },

      items: [{ ...emptyItem }],

      salesperson: "",

      payment: {
        mode: "CASH",
        referenceNo: "",
      },

      gstPercent: savedGST ? Number(savedGST) : 3,
      makingRates: localStorage.getItem("billing_making_rates")
        ? JSON.parse(localStorage.getItem("billing_making_rates"))
        : { Gold: "", Silver: "", Platinum: "" },
      ratesLocked: localStorage.getItem("billing_rates_locked") === "true",
      disableMinMakingRule: localStorage.getItem("billing_disable_min_making") === "true",
      taxTypeOverride: "AUTO",
    };
  };



  const [form, setForm] = useState(() => {
    const savedRates = localStorage.getItem("billing_base_rates");
    const savedItems = localStorage.getItem("billing_items");
    const savedGST = localStorage.getItem("billing_gst");

    // Check for Prefill from Location State during initialization
    const prefill = location.state?.prefillDiamond;
    const parsedInvoice = location.state?.parsedInvoice;
    let initialItems = [{ ...emptyItem }];

    let initialBaseRates = savedRates
      ? JSON.parse(savedRates)
      : {
        gold24k: "",
        silver999: "",
        platinum999: "",
      };

    let initialCustomer = {
      name: "",
      mobile: "",
      email: "",
      address: "",
      gstin: "",
      stateCode: "",
      panNumber: "",
    };

    let initialDate = new Date().toISOString().split("T")[0];

    if (parsedInvoice) {
      initialCustomer = {
        name: parsedInvoice.partyDetails?.name || "",
        mobile: parsedInvoice.partyDetails?.mobile || "",
        email: parsedInvoice.partyDetails?.email || "",
        address: parsedInvoice.partyDetails?.address || "",
        gstin: parsedInvoice.partyDetails?.gstin || "",
        stateCode: parsedInvoice.partyDetails?.stateCode || "",
        panNumber: "",
      };

      if (parsedInvoice.date) {
        initialDate = parsedInvoice.date;
      }

      const puritiesMap = {
        Gold: { "24KT": 1, "22KT": 0.916, "18KT": 0.76, "14KT": 0.6, "10KT": 0.43, "9KT": 0.39 },
        Silver: { "999": 1, "950": 0.95, "925": 0.925, "900": 0.9, "800": 0.8 },
        Platinum: { "999": 1, "950": 0.95, "900": 0.9 }
      };

      if (parsedInvoice.items && parsedInvoice.items.length > 0) {
        initialItems = parsedInvoice.items.map((item) => {
          const metal = item.metalType || "Gold";
          const purity = (item.purity || "18KT").toUpperCase();
          const rateNum = Number(item.rate || 0);

          if (puritiesMap[metal] && puritiesMap[metal][purity] && rateNum > 0) {
            const factor = puritiesMap[metal][purity];
            const baseVal = Math.round(rateNum / factor).toString();
            if (metal === "Gold") initialBaseRates.gold24k = baseVal;
            else if (metal === "Silver") initialBaseRates.silver999 = baseVal;
            else if (metal === "Platinum") initialBaseRates.platinum999 = baseVal;
          }

          return {
            ...emptyItem,
            title: item.description || "",
            metalType: metal,
            purity: item.purity || "18KT",
            grossWeight: item.grossWeight !== null && item.grossWeight !== undefined ? item.grossWeight.toString() : "",
            netWeight: (item.netWeight || item.grossWeight || "").toString(),
            metalRate: item.rate ? item.rate.toString() : "",
            makingRate: item.makingRate ? item.makingRate.toString() : "",
            amount: item.amount ? item.amount.toString() : "",
          };
        });
      }
    } else if (prefill) {
      initialItems = [{
        ...emptyItem,
        isLooseDiamond: true,
        title: prefill.sku
          ? `Loose Diamond: ${prefill.labNatural || "Natural"} ${prefill.shape || ""} ${prefill.weight || ""}ct ${prefill.color || ""}/${prefill.clarity || ""} ${prefill.lab ? `(${prefill.lab})` : ""} [SKU: ${prefill.sku}]`
          : `Loose Diamond: ${prefill.labNatural || "Natural"} ${prefill.shape || ""} ${prefill.weight || ""}ct`,
        hsnCode: prefill.hsnCode || "7102",
        netWeight: 0,
        grossWeight: 0,
        metalType: "Gold",
        diamonds: [{
          qty: prefill.qty || 1,
          grossWeight: prefill.weight || 0,
          netWeight: prefill.weight || 0,
          rate: prefill.rate || 0,
          shape: prefill.shape || "",
          color: prefill.color || "",
          clarity: prefill.clarity || "",
          diamondId: prefill.diamondId
        }],
        certificates: prefill.certificateNo ? [{ lab: prefill.lab || "Cert", certificateNo: prefill.certificateNo }] : []
      }];
    } else if (savedItems) {
      initialItems = JSON.parse(savedItems).map((item) => ({
        ...emptyItem,
        ...item,
        discounts: {
          ...emptyItem.discounts,
          ...(item.discounts || {}),
        },
        discountEnabled: true,
      }));
    }

    const isLooseDiamondInitial = Boolean(location.state?.isLooseDiamond || location.state?.prefillDiamond);

    return {
      date: initialDate,
      invoiceDatePart: initialDate.replace(/-/g, "/"),
      invoiceSeq: "",
      baseRates: initialBaseRates,
      customer: initialCustomer,
      items: initialItems,
      salesperson: "",
      payment: {
        mode: "CASH",
        referenceNo: "",
      },
      gstPercent: isLooseDiamondInitial
        ? (rates?.tax?.looseDiamondGst ?? 1.5)
        : (savedGST ? Number(savedGST) : (rates?.tax?.gst ?? 3)),
      makingRates: localStorage.getItem("billing_making_rates")
        ? JSON.parse(localStorage.getItem("billing_making_rates"))
        : { Gold: "", Silver: "", Platinum: "" },
      ratesLocked: localStorage.getItem("billing_rates_locked") === "true",
      disableMinMakingRule: localStorage.getItem("billing_disable_min_making") === "true",
    };
  });

  /* ================= PICKUP BY SKU FEATURE ================= */
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [pickupSearch, setPickupSearch] = useState("");
  const [pickupTab, setPickupTab] = useState("ALL"); // "ALL", "PRODUCT", "DIAMOND"
  const [pickupResults, setPickupResults] = useState([]);
  const [pickupLoading, setPickupLoading] = useState(false);
  const [targetItemIndex, setTargetItemIndex] = useState(null);

  const fetchPickupResults = async (query = "") => {
    try {
      setPickupLoading(true);
      const [prodRes, diaRes] = await Promise.all([
        API.get("/products", { params: { search: query, limit: 20 } }).catch(() => ({ data: { products: [] } })),
        API.get("/diamonds", { params: { search: query, limit: 20 } }).catch(() => ({ data: { diamonds: [] } }))
      ]);

      const prods = (prodRes.data?.products || []).map((p) => {
        const calculatedPrice = Number(
          p.pricing?.grandTotal ??
          p.pricing?.payable ??
          p.pricing?.grossTotal ??
          p.price ??
          p.sellingPrice ??
          0
        );

        return {
          id: `prod_${p._id}`,
          sku: p.sku || "N/A",
          title: p.title || "Jewellery Product",
          subtitle: `${p.metalPurity || ""} ${p.metalType || ""} • Net Wt: ${p.netWeight || 0}g`,
          category: p.jewelleryCategory || "Fine Jewellery",
          price: Math.round(calculatedPrice),
          image: resolveImage(p.images?.[0]),
          stock: p.stock !== undefined ? p.stock : 0,
          metalType: p.metalType || "Gold",
          type: "PRODUCT",
          raw: p,
        };
      });

      const dias = (diaRes.data?.diamonds || []).map((d) => {
        const diaPrice = Number(
          d.sellingPrice ||
          (Number(d.weight || 0) * Number(d.sellingRate || 0)) ||
          0
        );

        return {
          id: `dia_${d._id}`,
          sku: d.sku || "N/A",
          title: `Loose Diamond: ${d.labNatural || "Natural"} ${d.shape || ""} ${d.weight || 0}ct`,
          subtitle: `${d.color || ""}/${d.clarity || ""} • ${d.lab ? `${d.lab} ` : ""}${d.certificateNo || "No Cert"}`,
          category: "Loose Diamond",
          price: Math.round(diaPrice),
          image: null,
          stock: d.stock !== undefined ? d.stock : 0,
          metalType: null,
          type: "DIAMOND",
          raw: d,
        };
      });

      setPickupResults([...prods, ...dias]);
    } catch (err) {
      console.error("Pickup search error:", err);
    } finally {
      setPickupLoading(false);
    }
  };

  const openPickupModal = (itemIndex = null) => {
    setTargetItemIndex(itemIndex);
    setPickupSearch("");
    setPickupTab("ALL");
    setIsPickupModalOpen(true);
    fetchPickupResults("");
  };

  const convertProductToBillingItem = (p, pricing = null, currentForm = null) => {
    const pr = pricing || p.pricing || {};

    // If Loose Diamond from DiamondStock model
    if (p.shape && !p.components && (p.labNatural !== undefined || p.weight > 0)) {
      const diaRate = p.weight > 0 ? (Number(p.sellingPrice || 0) / Number(p.weight)) : Number(p.sellingRate || 0);
      return {
        ...emptyItem,
        isLooseDiamond: true,
        sku: p.sku || "",
        title: p.sku
          ? `Loose Diamond: ${p.labNatural || "Natural"} ${p.shape || ""} ${p.weight || ""}ct ${p.color || ""}/${p.clarity || ""} ${p.lab ? `(${p.lab})` : ""} [SKU: ${p.sku}]`
          : `Loose Diamond: ${p.labNatural || "Natural"} ${p.shape || ""} ${p.weight || ""}ct`,
        hsnCode: "7102",
        netWeight: 0,
        grossWeight: 0,
        metalType: "Gold",
        metalRate: 0,
        makingRate: 0,
        makingCharge: 0,
        diamonds: [{
          qty: 1,
          grossWeight: p.weight || 0,
          netWeight: p.weight || 0,
          rate: Math.round(diaRate || 0),
          shape: p.shape || "",
          color: p.color || "",
          clarity: p.clarity || "",
          diamondId: p._id
        }],
        stones: [{ qty: "", grossWeight: "", netWeight: "", rate: "" }],
        belts: [{ material: "", color: "", size: "", qty: "", rate: "" }],
        certificates: p.certificateNo ? [{ lab: p.lab || "Cert", certificateNo: p.certificateNo }] : []
      };
    }

    // Regular Jewellery Product
    const isLooseCategory = p.jewelleryCategory === "Loose Diamond";
    const netWt = Number(p.netWeight || p.grossWeight || 0);

    // 1. Resolve metalRate (from pricing, baseRates, or rates helper)
    let metalRate = pr.metalRate || "";
    if (!metalRate && pr.metalValue > 0 && netWt > 0) {
      metalRate = (pr.metalValue / netWt).toFixed(2);
    }
    if (!metalRate && currentForm) {
      const config = METAL_CONFIG[p.metalType || "Gold"];
      if (config) {
        const baseRate = Number(currentForm.baseRates?.[config.baseKey] || 0);
        const factor = config.purities[p.metalPurity || "18KT"] || 1;
        if (baseRate > 0) metalRate = (baseRate * factor).toFixed(2);
      }
    }
    if (!metalRate && rates?.helpers?.getMetalRate) {
      const fetchedRate = rates.helpers.getMetalRate(p.metalType || "Gold", p.metalPurity || "18KT");
      if (fetchedRate > 0) metalRate = fetchedRate.toFixed(2);
    }

    // 2. Resolve makingRate & makingCharge
    let makingRate = pr.makingRate || p.makingRate || "";
    let makingCharge = pr.makingCharge !== undefined && pr.makingCharge !== null && pr.makingCharge !== "" ? String(pr.makingCharge) : "";

    if (!makingCharge && currentForm) {
      const mRate = Number(makingRate || currentForm.makingRates?.[p.metalType || "Gold"] || 0);
      const minWeight = currentForm.disableMinMakingRule ? 0 : Number(rates?.making?.minWeight || 0);
      const minFlat = currentForm.disableMinMakingRule ? 0 : Number(rates?.making?.flatFee || 0);
      if (netWt > 0) {
        if (minWeight > 0 && netWt < minWeight) {
          makingCharge = minFlat.toFixed(2);
        } else if (mRate > 0) {
          makingCharge = (netWt * mRate).toFixed(2);
        }
      }
      if (!makingRate && mRate > 0) makingRate = mRate.toString();
    }
    if (!makingRate && Number(makingCharge) > 0 && netWt > 0) {
      makingRate = (Number(makingCharge) / netWt).toFixed(2);
    }

    // 3. Map Diamonds & Stones with calculated rates from pricing.componentBreakup
    const componentBreakup = pr.componentBreakup || [];
    const diamondBreakups = componentBreakup.filter(c => c.pricingRef === "DIAMOND" || ["Diamond", "Polki", "Moissanite"].includes(c.type));
    const stoneBreakups = componentBreakup.filter(c => c.pricingRef === "STONE" || (!["Diamond", "Polki", "Moissanite"].includes(c.type) && c.pricingRef !== "BELT"));
    const beltBreakups = componentBreakup.filter(c => c.pricingRef === "BELT");

    const rawDiamonds = (p.components || []).filter(c => ["Diamond", "Polki", "Moissanite"].includes(c.type));
    const rawStones = (p.components || []).filter(c => !["Diamond", "Polki", "Moissanite"].includes(c.type) && c.pricingRef !== "BELT");

    const mappedDiamonds = (diamondBreakups.length > 0 ? diamondBreakups : rawDiamonds).map((d, idx) => {
      const rawMatch = rawDiamonds[idx] || {};
      const count = Number(rawMatch.count || d.count || 1);
      // Total carats: prioritize rawMatch.weight (which represents total diamond carats e.g. 2.46) or d.weight
      const totalCarats = Number(rawMatch.weight || d.weight || (d.grossWeight && d.grossWeight < 100 ? d.grossWeight : 0) || 0);
      const pieceCarats = count > 0 && totalCarats > 0 ? Number((totalCarats / count).toFixed(3)) : totalCarats;
      let rate = Number(d.rate || rawMatch.rateOverride || rawMatch.rate || 0);

      // Fallback if rate is 0 but diamond values exist
      if (rate <= 0 && pr.diamondValue > 0 && totalCarats > 0) {
        rate = Math.round(pr.diamondValue / totalCarats);
      } else if (rate <= 0 && d.value > 0 && totalCarats > 0) {
        rate = Math.round(d.value / totalCarats);
      }

      return {
        qty: count,
        grossWeight: totalCarats,
        netWeight: pieceCarats,
        rate: rate,
        shape: d.shape || rawMatch.shape || "",
        color: d.color || rawMatch.color || "",
        clarity: d.clarity || rawMatch.clarity || ""
      };
    });

    const mappedStones = (stoneBreakups.length > 0 ? stoneBreakups : rawStones).map((s, idx) => {
      const rawMatch = rawStones[idx] || {};
      const count = Number(rawMatch.count || s.count || 1);
      const totalWeight = Number(rawMatch.weight || s.weight || s.grossWeight || 0);
      const pieceWeight = count > 0 && totalWeight > 0 ? Number((totalWeight / count).toFixed(3)) : totalWeight;
      let rate = Number(s.rate || rawMatch.rateOverride || rawMatch.rate || 0);

      if (rate <= 0 && pr.stoneValue > 0 && totalWeight > 0) {
        rate = Math.round(pr.stoneValue / totalWeight);
      } else if (rate <= 0 && s.value > 0 && totalWeight > 0) {
        rate = Math.round(s.value / totalWeight);
      }

      return {
        qty: count,
        grossWeight: totalWeight,
        netWeight: pieceWeight,
        rate: rate,
        shape: s.shape || rawMatch.shape || ""
      };
    });

    const mappedBelts = beltBreakups.length > 0
      ? beltBreakups.map(b => ({
          material: b.category || b.description || "",
          color: b.color || "",
          size: b.size || "",
          qty: b.count || 1,
          rate: b.rate || 0
        }))
      : [{ material: "", color: "", size: "", qty: "", rate: "" }];

    return {
      ...emptyItem,
      isLooseDiamond: isLooseCategory,
      sku: p.sku || "",
      title: p.title || "",
      hsnCode: p.hsnCode || (isLooseCategory ? "7102" : "7113"),
      metalType: p.metalType || "Gold",
      purity: p.metalPurity || "18KT",
      grossWeight: p.grossWeight !== undefined && p.grossWeight !== null ? p.grossWeight.toString() : "",
      netWeight: p.netWeight !== undefined && p.netWeight !== null ? p.netWeight.toString() : "",
      metalRate: metalRate ? String(metalRate) : "",
      makingRate: makingRate ? String(makingRate) : "",
      makingCharge: makingCharge ? String(makingCharge) : "",
      diamonds: mappedDiamonds.length > 0 ? mappedDiamonds : [{ qty: "", grossWeight: "", netWeight: "", rate: "" }],
      stones: mappedStones.length > 0 ? mappedStones : [{ qty: "", grossWeight: "", netWeight: "", rate: "" }],
      belts: mappedBelts,
      certificates: p.certificateNo
        ? [{ lab: p.lab || "Cert", certificateNo: p.certificateNo }]
        : (Array.isArray(p.certificates) && p.certificates.length > 0
            ? p.certificates.map(c => ({ lab: c.lab || "", certificateNo: c.certificateNo || "" }))
            : [])
    };
  };

  const handleSelectPickupProduct = async (res) => {
    let rawProduct = res.raw;
    let pricing = rawProduct.pricing;

    // If regular product and pricing is missing or incomplete, fetch detailed product by SKU:
    if (res.type === "PRODUCT" && res.sku && (!pricing || !pricing.componentBreakup || !pricing.metalRate)) {
      try {
        const skuRes = await API.get(`/products/sku/${encodeURIComponent(res.sku)}`);
        if (skuRes.data?.product) {
          rawProduct = skuRes.data.product;
          pricing = skuRes.data.product.pricing;
        }
      } catch (err) {
        console.warn("Could not fetch product details by SKU:", err);
      }
    }

    const newBillingItem = convertProductToBillingItem(rawProduct, pricing, form);

    setForm((prev) => {
      const updatedItems = [...prev.items];
      if (targetItemIndex !== null && targetItemIndex >= 0 && targetItemIndex < updatedItems.length) {
        updatedItems[targetItemIndex] = newBillingItem;
      } else {
        if (
          updatedItems.length === 1 &&
          !updatedItems[0].title &&
          !updatedItems[0].sku &&
          !updatedItems[0].grossWeight
        ) {
          updatedItems[0] = newBillingItem;
        } else {
          updatedItems.push(newBillingItem);
        }
      }

      // If current form base rate for this metal is empty, prefill from metalRate
      const config = METAL_CONFIG[newBillingItem.metalType || "Gold"];
      const updatedBaseRates = { ...prev.baseRates };
      if (config && (!updatedBaseRates[config.baseKey] || Number(updatedBaseRates[config.baseKey]) === 0)) {
        const factor = config.purities[newBillingItem.purity || "18KT"] || 1;
        if (Number(newBillingItem.metalRate) > 0 && factor > 0) {
          updatedBaseRates[config.baseKey] = Math.round(Number(newBillingItem.metalRate) / factor).toString();
        }
      }

      // If current form making rate is empty, prefill from makingRate
      const updatedMakingRates = { ...prev.makingRates };
      if (newBillingItem.metalType && (!updatedMakingRates[newBillingItem.metalType] || Number(updatedMakingRates[newBillingItem.metalType]) === 0)) {
        if (Number(newBillingItem.makingRate) > 0) {
          updatedMakingRates[newBillingItem.metalType] = Number(newBillingItem.makingRate).toString();
        }
      }

      return {
        ...prev,
        items: updatedItems,
        baseRates: updatedBaseRates,
        makingRates: updatedMakingRates,
      };
    });

    setIsPickupModalOpen(false);
    toast.success(`Picked up SKU: ${res.sku} with rates & specifications!`);
  };

  const [useMetalExchange, setUseMetalExchange] = useState(false);
  const [metalExchange, setMetalExchange] = useState({
    metalType: "gold",
    purity: "22KT",
    weight: 0,
    ratePerGram: 0,
    totalValue: 0,
  });

  useEffect(() => {
    const metalTypeLower = (metalExchange.metalType || "gold").toLowerCase();
    let baseKey = "gold24k";
    let purities = {
      "24KT": 1, "22KT": 0.916, "18KT": 0.76, "14KT": 0.6, "10KT": 0.43, "9KT": 0.39
    };

    if (metalTypeLower === "silver") {
      baseKey = "silver999";
      purities = { 999: 1, 950: 0.95, 925: 0.925, 900: 0.9, 800: 0.8 };
    } else if (metalTypeLower === "platinum") {
      baseKey = "platinum999";
      purities = { 999: 1, 950: 0.95, 900: 0.9 };
    }

    const userBaseRate = Number(form?.baseRates?.[baseKey] || 0);
    const factor = purities[metalExchange.purity] || 1;

    let rate = 0;
    if (userBaseRate > 0) {
      rate = Number((userBaseRate * factor).toFixed(2));
    } else if (rates?.helpers?.getMetalRate) {
      rate = rates.helpers.getMetalRate(metalExchange.metalType, metalExchange.purity) || 0;
    }

    setMetalExchange((prev) => ({
      ...prev,
      ratePerGram: rate,
    }));
  }, [metalExchange.metalType, metalExchange.purity, form?.baseRates, rates]);

  useEffect(() => {
    const value = (metalExchange.weight || 0) * (metalExchange.ratePerGram || 0);
    setMetalExchange((prev) => ({
      ...prev,
      totalValue: value,
    }));
  }, [metalExchange.weight, metalExchange.ratePerGram]);

  const [isScanning, setIsScanning] = useState(false);
  const aiFileInputRef = useRef(null);

  // Shared helper: convert AI-parsed item → ManualBillingForm item shape
  const buildItemFromAiData = (item, existingFormItem) => {
    const metal = ["Gold", "Silver", "Platinum"].includes(item.metalType)
      ? item.metalType
      : "Gold";
    const rawPurity = (item.purity || "").toUpperCase();
    const purity = rawPurity || (metal === "Gold" ? "18KT" : metal === "Silver" ? "925" : "950");
    const netWt = (item.netWeight || item.grossWeight || "").toString();
    const mRate = item.makingRate ? item.makingRate.toString() : "";

    // Making charge: use flat fee if weight is below threshold (unless disableMinMakingRule is active)
    const weight = Number(netWt || 0);
    const minWeight = form?.disableMinMakingRule ? 0 : Number(rates?.making?.minWeight || 0);
    const minFlat = form?.disableMinMakingRule ? 0 : Number(rates?.making?.flatFee || 0);
    let makingCharge = "";
    if (weight > 0) {
      if (minWeight > 0 && weight < minWeight) {
        makingCharge = minFlat.toFixed(2);
      } else if (mRate) {
        makingCharge = (weight * Number(mRate)).toFixed(2);
      } else if (item.makingCharge != null) {
        makingCharge = item.makingCharge.toString();
      }
    }

    // Diamonds: map AI diamonds array into form shape
    const parsedDiamonds = Array.isArray(item.diamonds) && item.diamonds.length > 0
      ? item.diamonds.map(d => ({
        qty: d.qty != null ? d.qty.toString() : "",
        grossWeight: d.grossWeight != null ? d.grossWeight.toString() : "",
        netWeight: d.netWeight != null ? d.netWeight.toString() : "",
        rate: d.rate != null ? d.rate.toString() : "",
      }))
      : [{ qty: "", grossWeight: "", netWeight: "", rate: "" }];

    // Stones: map AI stones array into form shape
    const parsedStones = Array.isArray(item.stones) && item.stones.length > 0
      ? item.stones.map(s => ({
        qty: s.qty != null ? s.qty.toString() : "",
        grossWeight: s.grossWeight != null ? s.grossWeight.toString() : "",
        netWeight: s.netWeight != null ? s.netWeight.toString() : "",
        rate: s.rate != null ? s.rate.toString() : "",
      }))
      : [{ qty: "", grossWeight: "", netWeight: "", rate: "" }];

    // Accessories/Belts: map AI accessories array into belt form shape
    const parsedBelts = Array.isArray(item.accessories) && item.accessories.length > 0
      ? item.accessories.map(a => ({
        material: a.description || "",
        color: "",
        size: "",
        qty: a.qty != null ? a.qty.toString() : "",
        rate: a.rate != null ? a.rate.toString() : "",
      }))
      : [{ material: "", color: "", size: "", qty: "", rate: "" }];

    return {
      ...emptyItem,
      title: item.description || "",
      hsnCode: item.hsnCode || "",
      metalType: metal,
      purity,
      grossWeight: item.grossWeight != null ? item.grossWeight.toString() : "",
      netWeight: netWt,
      // Use scanned metalRate if available, else keep existing form rate
      metalRate: item.metalRate != null
        ? item.metalRate.toString()
        : (item.rate != null ? item.rate.toString() : (existingFormItem?.metalRate || "")),
      makingRate: mRate,
      makingCharge,
      diamonds: parsedDiamonds,
      stones: parsedStones,
      belts: parsedBelts,
    };
  };

  const handleAiScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append("bill", file);

    try {
      const response = await axios.post("/api/ai/parse-bill", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.success) {
        const data = response.data.data;

        setForm((p) => {
          const parsedItems = data.items && data.items.length > 0
            ? data.items.map((item, idx) => buildItemFromAiData(item, p.items[idx]))
            : p.items;

          return {
            ...p,
            date: data.date || p.date,
            gstPercent: data.pricing?.gstRate ? data.pricing.gstRate.toString() : p.gstPercent,
            customer: {
              ...p.customer,
              name: data.partyDetails?.name || p.customer.name,
              mobile: data.partyDetails?.mobile || p.customer.mobile,
              email: data.partyDetails?.email || p.customer.email,
              gstin: data.partyDetails?.gstin || p.customer.gstin,
              address: data.partyDetails?.address || p.customer.address,
              stateCode: data.partyDetails?.stateCode || p.customer.stateCode,
            },
            items: parsedItems,
          };
        });
        toast.success("AI scanned invoice data auto-filled!");
      } else {
        toast.error("Failed to parse invoice using AI.");
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to scan.";
      toast.error(`AI Scan Error: ${errorMsg}`);
    } finally {
      setIsScanning(false);
      if (aiFileInputRef.current) aiFileInputRef.current.value = "";
    }
  };

  // Handle Prefill from Diamond Inventory & AI Scanner
  useEffect(() => {
    if (location.state?.prefillDiamond || location.state?.isLooseDiamond) {
      const looseRate = rates?.tax?.looseDiamondGst ?? rates?.base?.looseDiamondGstRate ?? 1.5;
      setForm((p) => ({
        ...p,
        gstPercent: looseRate,
      }));
      toast.success(`Loose Diamond auto-filled! GST set to ${looseRate}%.`);
    } else if (location.state?.parsedInvoice) {
      const data = location.state.parsedInvoice;

      setForm((p) => {
        const parsedItems = data.items && data.items.length > 0
          ? data.items.map((item, idx) => buildItemFromAiData(item, p.items[idx]))
          : p.items;

        return {
          ...p,
          date: data.date || p.date,
          gstPercent: data.pricing?.gstRate ? data.pricing.gstRate.toString() : p.gstPercent,
          customer: {
            ...p.customer,
            name: data.partyDetails?.name || p.customer.name,
            mobile: data.partyDetails?.mobile || p.customer.mobile,
            email: data.partyDetails?.email || p.customer.email,
            gstin: data.partyDetails?.gstin || p.customer.gstin,
            address: data.partyDetails?.address || p.customer.address,
            stateCode: data.partyDetails?.stateCode || p.customer.stateCode,
          },
          items: parsedItems,
        };
      });
      toast.success("AI scanned invoice data auto-filled!");
    }
  }, [location.state]);

  const handleCustomerChange = (field, value) => {
    setForm((p) => {
      let finalVal = value;
      if (field === "stateCode" && value.includes(" - ")) {
        finalVal = value.split(" - ")[0].trim();
      }

      const updatedCustomer = { ...p.customer, [field]: finalVal };

      // Auto-extract state code from GSTIN if stateCode is empty or default
      if (field === "gstin") {
        const cleanGst = (value || "").trim().toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 15);
        updatedCustomer.gstin = cleanGst;
        if (cleanGst.length >= 2) {
          const code = cleanGst.slice(0, 2);
          if (INDIAN_STATE_CODES[code]) {
            updatedCustomer.stateCode = code;
          }
        } else if (cleanGst.length === 0) {
          updatedCustomer.stateCode = "23";
        }

        // Auto-populate PAN if empty
        if (cleanGst.length >= 12 && (!updatedCustomer.panNumber || updatedCustomer.panNumber.length !== 10)) {
          const potPan = cleanGst.slice(2, 12);
          if (/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(potPan)) {
            updatedCustomer.panNumber = potPan;
          }
        }
      }

      return {
        ...p,
        customer: updatedCustomer,
      };
    });
  };

  const handleDiscountChange = (index, field, subField, value) => {
    const updated = [...form.items];
    updated[index].discounts[field][subField] = value;
    setForm((p) => ({ ...p, items: updated }));
  };

  const METAL_CONFIG = {
    Gold: {
      baseKey: "gold24k",
      purities: {
        "24KT": 1,
        "22KT": 0.916,
        "18KT": 0.76,
        "14KT": 0.6,
        "10KT": 0.43,
        "9KT": 0.39,
      },
    },
    Silver: {
      baseKey: "silver999",
      purities: {
        999: 1,
        950: 0.95,
        925: 0.925,
        900: 0.9,
        800: 0.8,
      },
    },
    Platinum: {
      baseKey: "platinum999",
      purities: {
        999: 1,
        950: 0.95,
        900: 0.9,
      },
    },
  };

  const toggleRateLock = () => {
    setForm((p) => ({
      ...p,
      ratesLocked: !p.ratesLocked,
    }));
  };

  // 🚫 Disable mouse wheel value changing on number inputs
  useEffect(() => {
    const handleWheel = () => {
      if (document.activeElement && document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    };
    window.addEventListener("wheel", handleWheel);
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    localStorage.setItem("billing_base_rates", JSON.stringify(form.baseRates));
    localStorage.setItem("billing_items", JSON.stringify(form.items));
    localStorage.setItem("billing_gst", form.gstPercent);
    localStorage.setItem("billing_making_rates", JSON.stringify(form.makingRates));
    localStorage.setItem("billing_rates_locked", String(form.ratesLocked || false));
    localStorage.setItem("billing_disable_min_making", String(form.disableMinMakingRule || false));
  }, [form.baseRates, form.items, form.gstPercent, form.makingRates, form.ratesLocked, form.disableMinMakingRule]);

  useEffect(() => {
    if (form.ratesLocked) return;

    const minWeight = form.disableMinMakingRule ? 0 : Number(rates?.making?.minWeight || 0);
    const minFlat = form.disableMinMakingRule ? 0 : Number(rates?.making?.flatFee || 0);

    const updatedItems = form.items.map((item) => {
      const weight = Number(item.netWeight || 0);
      const rate = Number(form.makingRates[item.metalType] || 0);

      let makingCharge = item.makingCharge || "0.00";
      if (weight > 0) {
        if (minWeight > 0 && weight < minWeight) {
          makingCharge = minFlat.toFixed(2);
        } else if (rate > 0) {
          makingCharge = (weight * rate).toFixed(2);
        }
      }

      return {
        ...item,
        makingRate: rate > 0 ? rate : (item.makingRate || 0),
        makingCharge,
      };
    });

    setForm((p) => ({ ...p, items: updatedItems }));
  }, [form.makingRates, form.items.length, form.ratesLocked, form.disableMinMakingRule, rates]);

  const handleItemChange = (index, field, value) => {
    const updated = [...form.items];

    if (field === "discounts") {
      updated[index].discounts = value;
    } else {
      updated[index][field] = value;
    }

    const item = updated[index];

    if ((field === "netWeight" || field === "metalType" || field === "purity") && !form.ratesLocked) {
      const weight = Number(updated[index].netWeight || 0);
      const rate = Number(form.makingRates[item.metalType] || 0);
      const minWeight = form.disableMinMakingRule ? 0 : Number(rates?.making?.minWeight || 0);
      const minFlat = form.disableMinMakingRule ? 0 : Number(rates?.making?.flatFee || 0);

      if (weight > 0) {
        if (minWeight > 0 && weight < minWeight) {
          updated[index].makingCharge = minFlat.toFixed(2);
        } else {
          updated[index].makingCharge = (weight * rate).toFixed(2);
        }
      } else {
        updated[index].makingCharge = "0.00";
      }
    }

    if (field === "diamondGrossWeight" || field === "diamondQty") {
      const qty = Number(updated[index].diamondQty || 0);
      const gross = Number(updated[index].diamondGrossWeight || 0);

      if (qty > 0) {
        updated[index].diamondWeight = (gross / qty).toFixed(3);
      } else {
        updated[index].diamondWeight = "";
      }
    }

    const config = METAL_CONFIG[item.metalType];

    if (field === "metalType" && config) {
      const firstPurity = Object.keys(config.purities)[0];
      item.purity = firstPurity;
    }

    if (config) {
      const baseRate = Number(form.baseRates[config.baseKey] || 0);
      const factor = config.purities[item.purity] || 1;
      item.metalRate = (baseRate * factor).toFixed(2);
    }

    setForm((p) => ({ ...p, items: updated }));
  };

  const handleBaseRateChange = (metalKey, value) => {
    const baseRate = Number(value || 0);

    const updatedItems = form.items.map((item) => {
      const config = METAL_CONFIG[item.metalType];

      if (config && config.baseKey === metalKey) {
        const factor = config.purities[item.purity] || 1;
        return {
          ...item,
          metalRate: (baseRate * factor).toFixed(2),
        };
      }
      return item;
    });

    setForm((p) => ({
      ...p,
      baseRates: {
        ...p.baseRates,
        [metalKey]: value,
      },
      items: updatedItems,
    }));
  };

  const addItem = () => {
    setForm((p) => ({ ...p, items: [...p.items, { ...emptyItem }] }));
  };

  const removeItem = (index) => {
    setForm((p) => ({
      ...p,
      items: p.items.filter((_, i) => i !== index),
    }));
  };

  const calcDiscount = (discountObj, baseValue) => {
    const val = Number(discountObj?.value || 0);
    if (discountObj?.type === "percent") {
      return (baseValue * val) / 100;
    }
    return val;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.customer?.gstin) {
      const gCheck = validateGSTIN(form.customer.gstin, form.customer.stateCode);
      if (!gCheck.isValid) {
        showAlert(`GSTIN Error: ${gCheck.error}`);
        return;
      }
    }

    if (subtotal < 0) {
      showAlert("Invoice subtotal cannot be less than 0.");
      return;
    }

    const currentMetalCredit = useMetalExchange ? (metalExchange.totalValue || 0) : 0;
    const currentNetDue = grandTotal - appliedCredit - currentMetalCredit;

    if (currentNetDue < -0.01 || (useMetalExchange && currentMetalCredit > grandTotal + 0.01)) {
      showAlert(`Invoice cannot be generated: Old metal exchange credit (₹${currentMetalCredit.toLocaleString("en-IN")}) exceeds the bill total (₹${grandTotal.toLocaleString("en-IN")}). Net amount cannot be less than 0.`);
      return;
    }

    if (isSplitPayment) {
      if (Math.abs(splitTotal - maxPayable) > 0.05) {
        showAlert(`Split payment total (₹${splitTotal.toLocaleString("en-IN")}) must match the Net Due (₹${maxPayable.toLocaleString("en-IN")})`);
        return;
      }
    }

    const itemsPayload = form.items.map((item) => {
      const netWeight = Number(item.netWeight || 0);
      const grossWeight = Number(item.grossWeight || 0);
      const metalRate = Number(item.metalRate || 0);


      const makingCharge = Number(item.makingCharge || 0);

      const metalValue = netWeight * metalRate;

      const diamondValue = item.diamonds.reduce((sum, d) => {
        return sum + (Number(d.grossWeight || 0) * Number(d.rate || 0));
      }, 0);

      // const stoneValue = stoneQty * stoneWeight * stoneRate;
      const stoneValue = item.stones.reduce((sum, s) => {
        return sum + (Number(s.netWeight || 0) * Number(s.rate || 0));
      }, 0);

      const makingDiscount = calcDiscount(item.discounts.making, makingCharge);
      const diamondDiscount = calcDiscount(item.discounts.diamond, diamondValue);
      const stoneDiscount = calcDiscount(item.discounts.stone, stoneValue);

      const beltValue = item.belts.reduce((sum, b) => {
        return sum + (Number(b.qty || 0) * Number(b.rate || 0));
      }, 0);
      const beltDiscount = calcDiscount(item.discounts.belt, beltValue);

      const totalDiscount = makingDiscount + diamondDiscount + stoneDiscount + beltDiscount;
      const subtotalBeforeDiscount =
        metalValue + diamondValue + stoneValue + beltValue + makingCharge;
      const subtotal = Math.max(0, subtotalBeforeDiscount - totalDiscount);

      const gstPercent = Number(form.gstPercent || 0);
      const gst = subtotal * (gstPercent / 100);
      const grandTotal = subtotal + gst;

      const componentBreakup = [];

      item.diamonds.forEach((d) => {
        const qty = Number(d.qty || 0);
        const grossWeight = Number(d.grossWeight || 0);
        const netWeight = Number(d.netWeight || 0);
        const rate = Number(d.rate || 0);

        if (qty > 0 || grossWeight > 0) {
          const roundedWeight = Number(netWeight.toFixed(3));
          const totalVal = grossWeight > 0 ? grossWeight * rate : roundedWeight * qty * rate;
          componentBreakup.push({
            pricingRef: "DIAMOND",
            count: qty,
            grossWeight: grossWeight,
            weight: roundedWeight,
            rate,
            value: totalVal,
            diamondId: d.diamondId
          });
        }
      });

      item.stones.forEach((s) => {
        const qty = Number(s.qty || 0);
        const grossWeight = Number(s.grossWeight || 0);
        const netWeight = Number(s.netWeight || 0);
        const rate = Number(s.rate || 0);

        if (qty > 0 || netWeight > 0 || grossWeight > 0) {
          const totalVal = netWeight > 0 ? netWeight * rate : grossWeight * rate;
          componentBreakup.push({
            pricingRef: "STONE",
            count: qty,
            grossWeight: grossWeight,
            weight: netWeight,
            rate,
            value: totalVal,
          });
        }
      });

      item.belts.forEach((b) => {
        const qty = Number(b.qty || 0);
        const rate = Number(b.rate || 0);

        if (qty > 0) {
          componentBreakup.push({
            pricingRef: "BELT",
            type: b.material || "Accessory",
            count: qty,
            rate,
            value: qty * rate,
          });
        }
      });

      return {
        quantity: 1,
        certificateNo: item.certificates?.length > 0 ? item.certificates[0].certificateNo : item.certificateNo,
        certificates: item.certificates || [],
        itemSnapshot: {
          productDetails: {
            title: item.title,
            metalType: item.metalType,
            metalPurity: item.purity,
            grossWeight,
            netWeight,
            hsnCode: item.hsnCode || "",
            certificates: item.certificates || [],
          },
          certificateNo: item.certificates?.length > 0 ? item.certificates[0].certificateNo : item.certificateNo,
          certificates: item.certificates || [],
        },
        breakup: {
          subtotal,
          gstPercent: Number(form.gstPercent || 0),
          gst,
          grandTotal,
          metalRate,
          makingCharge,
          discountMaking: makingDiscount,
          discountDiamond: diamondDiscount,
          discountStone: stoneDiscount,
          discountBelt: beltDiscount,
          discount: totalDiscount,
          componentBreakup,
        },
      };
    });

    const metalPayload =
      useMetalExchange &&
      Number(metalExchange.weight) > 0 &&
      Number(metalExchange.ratePerGram) > 0
        ? {
            metalType: metalExchange.metalType,
            purity: metalExchange.purity,
            weight: Number(metalExchange.weight),
            ratePerGram: Number(metalExchange.ratePerGram),
          }
        : undefined;

    const payload = {
      customer: {
        ...form.customer,
        stateCode: taxCalculation.stateCode || form.customer.stateCode,
      },
      taxTypeOverride: form.taxTypeOverride || "AUTO",
      taxType: taxCalculation.taxType,
      items: itemsPayload,
      metalPayment: metalPayload,
      payment: isSplitPayment
        ? {
          mode: "SPLIT",
          referenceNo: splitPayments.filter(s => s.referenceNo).map(s => `${s.mode}: ${s.referenceNo}`).join(", ") || "",
          status: "PAID",
          splitPayments: splitPayments.map(s => ({
            mode: s.mode,
            amount: Number(s.amount || 0),
            referenceNo: s.referenceNo || ""
          }))
        }
        : {
          mode: (form.payment.mode || "CASH").toUpperCase(),
          referenceNo: form.payment.referenceNo,
          status: "PAID"
        },
      salesperson: form.salesperson,
      creditNoteIds: selectedCreditIds,
      appliedCredit,
      date: form.date,
      invoiceNo: getFormattedInvoiceNo(form.invoiceDatePart, form.invoiceSeq),
      totals: {
        discount: itemsPayload.reduce(
          (sum, i) => sum + (i.breakup.discount || 0),
          0
        ),
      },
    };

    try {
      const res = await createManualInvoice(payload);
      const invoiceId = res?.data?.invoiceId;

      if (!invoiceId) return showAlert("Invoice ID missing");

      // ✅ FORM RESET (LOCK PRESERVED 🔒)
      setForm((prev) => ({
        ...getInitialForm(),
        ratesLocked: prev.ratesLocked,
        baseRates: prev.baseRates,
        makingRates: prev.makingRates,
      }));
      setIsSplitPayment(false);
      setSplitPayments([
        { mode: "CASH", amount: 0, referenceNo: "" },
        { mode: "UPI", amount: 0, referenceNo: "" }
      ]);
      setUseMetalExchange(false);
      setMetalExchange({
        metalType: "gold",
        purity: "22KT",
        weight: 0,
        ratePerGram: 0,
        totalValue: 0,
      });

      // optional: clear items cache
      localStorage.removeItem("billing_items");

      navigate(`/invoice/${invoiceId}`);
    } catch (err) {
      console.error("API Submission Error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      showAlert(`Submission Failed: ${errMsg}`);
    }
  };

  const totals = form.items.reduce(
    (acc, item) => {
      const netWeight = Number(item.netWeight || 0);
      const metalRate = Number(item.metalRate || 0);

      // const diamondQty = Number(item.diamondQty || 0);
      // const diamondWeight = Number(item.diamondWeight || 0);
      // const diamondRate = Number(item.diamondRate || 0);

      // const stoneQty = Number(item.stoneQty || 0);
      // const stoneWeight = Number(item.stoneWeight || 0);
      // const stoneRate = Number(item.stoneRate || 0);

      const makingCharge = Number(item.makingCharge || 0);

      const metalValue = netWeight * metalRate;
      // const diamondValue = diamondQty * diamondWeight * diamondRate;
      // const stoneValue = stoneQty * stoneWeight * stoneRate;

      const diamondValue = item.diamonds.reduce((sum, d) => {
        return sum + (Number(d.grossWeight || 0) * Number(d.rate || 0));
      }, 0);

      const stoneValue = item.stones.reduce((sum, s) => {
        return sum + (Number(s.netWeight || 0) * Number(s.rate || 0));
      }, 0);

      const beltValue = item.belts.reduce((sum, b) => {
        return sum + (Number(b.qty || 0) * Number(b.rate || 0));
      }, 0);

      const makingDiscount = calcDiscount(item.discounts.making, makingCharge);
      const diamondDiscount = calcDiscount(
        item.discounts.diamond,
        diamondValue
      );
      const stoneDiscount = calcDiscount(item.discounts.stone, stoneValue);
      const beltDiscount = calcDiscount(item.discounts.belt, beltValue);

      const totalDiscount = makingDiscount + diamondDiscount + stoneDiscount + beltDiscount;

      acc.metal += metalValue;
      acc.diamond += diamondValue;
      acc.stone += stoneValue;
      acc.belt += beltValue;
      acc.making += makingCharge;
      acc.discount += totalDiscount;

      return acc;
    },
    { metal: 0, diamond: 0, stone: 0, belt: 0, making: 0, discount: 0 }
  );

  const subtotal =
    totals.metal +
    totals.diamond +
    totals.stone +
    totals.belt +
    totals.making -
    totals.discount;
  const gst = subtotal * (Number(form.gstPercent || 0) / 100);
  const grandTotal = subtotal + gst;
  const metalCredit = useMetalExchange ? (metalExchange.totalValue || 0) : 0;
  const maxPayable = Math.max(0, grandTotal - appliedCredit - metalCredit);

  /* ================= 🌐 TAX DETERMINATION (INTER-STATE vs INTRA-STATE) ================= */
  const taxCalculation = determineTaxType(form.customer, form.taxTypeOverride || "AUTO");
  const isInterState = taxCalculation.isInterState;
  const gstRate = Number(form.gstPercent || 0);
  const halfGstRate = Math.round((gstRate / 2) * 100) / 100;
  const halfGstAmount = Math.round((gst / 2) * 100) / 100;

  useEffect(() => {
    // Normalise: remove non-digits and take last 10 characters
    const cleanMobile = form.customer.mobile.replace(/\D/g, "");

    if (cleanMobile.length >= 10) {
      axios.get(`/api/creditnotes/customer/${cleanMobile}`)
        .then(res => setCredits(res.data || []))
        .catch(err => console.error("Could not fetch customer credits", err));
    } else {
      setCredits([]);
      setAppliedCredit(0);
      setSelectedCreditIds([]);
    }
  }, [form.customer.mobile]);

  // Sync applied credit when grand total changes
  useEffect(() => {
    const totalAvailable = credits
      .filter(c => selectedCreditIds.includes(c._id))
      .reduce((sum, c) => sum + c.remainingAmount, 0);
    setAppliedCredit(Math.min(totalAvailable, grandTotal));
  }, [grandTotal, selectedCreditIds, credits]);

  const toggleCredit = (cn) => {
    let newSelected = [...selectedCreditIds];
    if (newSelected.includes(cn._id)) {
      newSelected = newSelected.filter(id => id !== cn._id);
    } else {
      newSelected.push(cn._id);
    }

    // Recalculate total available from selected
    const totalAvailable = credits
      .filter(c => newSelected.includes(c._id))
      .reduce((sum, c) => sum + c.remainingAmount, 0);

    setSelectedCreditIds(newSelected);
    setAppliedCredit(Math.min(totalAvailable, grandTotal));
  };

  const splitTotal = splitPayments.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  useEffect(() => {
    // Sync split payments when maxPayable changes
    setSplitPayments(prev => {
      const updated = [...prev];
      if (updated.length === 2) {
        updated[0] = { ...updated[0], amount: maxPayable };
        updated[1] = { ...updated[1], amount: 0 };
      } else if (updated.length > 0) {
        updated[0] = { ...updated[0], amount: maxPayable };
        for (let i = 1; i < updated.length; i++) {
          updated[i] = { ...updated[i], amount: 0 };
        }
      }
      return updated;
    });
  }, [maxPayable]);

  const handleAmountChange = (idx, value) => {
    const inputVal = Number(value);
    const cleanVal = isNaN(inputVal) ? 0 : inputVal;

    if (splitPayments.length === 2) {
      const val = Math.min(maxPayable, Math.max(0, cleanVal));
      const otherIdx = idx === 0 ? 1 : 0;
      const updated = [...splitPayments];
      updated[idx] = { ...updated[idx], amount: val };
      updated[otherIdx] = {
        ...updated[otherIdx],
        amount: Number(Math.max(0, maxPayable - val).toFixed(2))
      };
      setSplitPayments(updated);
    } else {
      const updated = [...splitPayments];
      updated[idx] = { ...updated[idx], amount: Math.min(maxPayable, Math.max(0, cleanVal)) };
      setSplitPayments(updated);
    }
  };

  const addSplitPayment = () => {
    const allocated = splitPayments.reduce((sum, s) => sum + Number(s.amount || 0), 0);
    const remaining = Math.max(0, maxPayable - allocated);
    setSplitPayments([...splitPayments, { mode: "CARD", amount: remaining, referenceNo: "" }]);
  };

  const deleteSplitPayment = (idx) => {
    if (splitPayments.length <= 1) return;

    if (splitPayments.length === 2) {
      const remainingSplit = splitPayments[idx === 0 ? 1 : 0];
      setForm(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          mode: remainingSplit.mode,
          referenceNo: remainingSplit.referenceNo,
        }
      }));
      setIsSplitPayment(false);
      return;
    }

    const removedAmount = Number(splitPayments[idx].amount || 0);
    const updated = splitPayments.filter((_, i) => i !== idx);

    if (updated.length > 0) {
      updated[0].amount = Number((Number(updated[0].amount || 0) + removedAmount).toFixed(2));
    }

    setSplitPayments(updated);
  };

  const updateSplitPaymentField = (idx, field, value) => {
    const updated = [...splitPayments];
    updated[idx] = { ...updated[idx], [field]: value };
    setSplitPayments(updated);
  };

  // Render Helper to calculate individual item final value for the UI card
  const getItemFinalPrice = (item) => {
    const netWeight = Number(item.netWeight || 0);
    const metalRate = Number(item.metalRate || 0);

    const makingCharge = Number(item.makingCharge || 0);

    const metalValue = netWeight * metalRate;
    // const diamondValue = diamondQty * diamondWeight * diamondRate;
    const diamondValue = item.diamonds.reduce((sum, d) => {
      return sum + (Number(d.grossWeight || 0) * Number(d.rate || 0));
    }, 0);

    const stoneValue = item.stones.reduce((sum, s) => {
      return sum + (Number(s.netWeight || 0) * Number(s.rate || 0));
    }, 0);

    const beltValue = item.belts.reduce((sum, b) => {
      return sum + (Number(b.qty || 0) * Number(b.rate || 0));
    }, 0);

    const makingDiscount = calcDiscount(item.discounts.making, makingCharge);
    const diamondDiscount = calcDiscount(item.discounts.diamond, diamondValue);
    const stoneDiscount = calcDiscount(item.discounts.stone, stoneValue);
    const beltDiscount = calcDiscount(item.discounts.belt, beltValue);
    const totalDiscount = makingDiscount + diamondDiscount + stoneDiscount + beltDiscount;

    const subtotalBeforeDiscount = metalValue + diamondValue + stoneValue + beltValue + makingCharge;
    return Math.max(0, subtotalBeforeDiscount - totalDiscount);
  };

  const gstinValidation = validateGSTIN(form.customer?.gstin, form.customer?.stateCode);

  return (
    <div className="min-h-screen bg-[#fafbfc] p-3 sm:p-6 font-sans text-[#4a2b3d]">

      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-[#5c2b41] hover:border-[#5c2b41]/20 transition-colors shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#5c2b41] leading-none mb-1">Manual Billing</h1>
              <p className="text-[11px] sm:text-xs text-gray-400">Create client invoices manually</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* AI Scan Button */}
            <input
              type="file"
              accept="image/*"
              ref={aiFileInputRef}
              onChange={handleAiScan}
              className="hidden"
            />
            <button
              type="button"
              disabled={isScanning}
              onClick={() => aiFileInputRef.current?.click()}
              title={isScanning ? "Scanning..." : "Scan with AI"}
              className="flex items-center justify-center bg-[#5c2b41] hover:bg-[#4a2234] text-white p-2.5 rounded-full shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isScanning ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Sparkles size={15} />
              )}
            </button>
            {/* Invoice Date Field */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date:</label>
              <input
                type="date"
                required
                className="text-xs font-bold text-gray-700 focus:outline-none cursor-pointer border-none p-0 bg-transparent"
                value={form.date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    date: newDate,
                    invoiceDatePart: newDate.replace(/-/g, "/")
                  }));
                }}
              />
            </div>

            {/* Invoice No Field */}
            <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Invoice No:</label>
              <div className="flex items-center text-xs font-bold text-gray-700 gap-0.5">
                <span className="text-gray-400 select-none">NZD-</span>
                <input
                  type="text"
                  placeholder="YYYY/MM/DD"
                  className="w-[84px] focus:outline-none border-none p-0 bg-transparent text-xs font-bold text-gray-700 placeholder-gray-300"
                  value={form.invoiceDatePart || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, invoiceDatePart: e.target.value }))}
                />
                <span className="text-gray-400 select-none">-</span>
                <input
                  type="text"
                  placeholder="Auto"
                  className="w-10 focus:outline-none border-none p-0 bg-transparent text-xs font-bold text-gray-700 placeholder-gray-300"
                  value={form.invoiceSeq || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, invoiceSeq: e.target.value.replace(/\D/g, "") }))}
                />
              </div>
            </div>

            {/* Reset Form Button */}
            <button
              type="button"
              title="Clear Billing Form"
              onClick={async () => {
                const confirmed = await showConfirm("Are you sure you want to clear the entire billing form?");
                if (confirmed) {
                  setForm(getInitialForm());
                  localStorage.removeItem("billing_items");
                  toast.success("Billing form cleared!");
                }
              }}
              className="w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-colors"
            >
              <RotateCcw size={16} />
            </button>

            <div className="flex items-center gap-2 bg-[#e8f5e9] text-[#2e7d32] px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-green-100">
              <div className="w-2 h-2 bg-[#4caf50] rounded-full"></div>
              System Online
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* LEFT COLUMN: Main Form Entry */}
          <div className="lg:col-span-8 space-y-6">
            {/* Customer Details Box */}
            <div className="bg-white p-5 rounded-xl border border-[#ebdbe2] shadow-sm relative">
              <h2 className="text-[10px] uppercase font-bold text-[#a68e9b] tracking-wider mb-4">
                Customer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  placeholder="Name"
                  className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                  value={form.customer.name}
                  onChange={(e) => handleCustomerChange("name", e.target.value)}
                />
                <input
                  placeholder="Mobile"
                  className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                  value={form.customer.mobile}
                  onChange={(e) =>
                    handleCustomerChange("mobile", e.target.value)
                  }
                />
                <input
                  placeholder="Email"
                  className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                  value={form.customer.email}
                  onChange={(e) =>
                    handleCustomerChange("email", e.target.value)
                  }
                />
                <input
                  placeholder="Address"
                  className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                  value={form.customer.address}
                  onChange={(e) =>
                    handleCustomerChange("address", e.target.value)
                  }
                />
                <div className="relative">
                  <input
                    placeholder="GSTIN (15 characters)"
                    maxLength={15}
                    className={`w-full border rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] uppercase font-mono transition-colors focus:outline-none focus:ring-1 ${
                      !gstinValidation.isEmpty && !gstinValidation.isValid
                        ? gstinValidation.stateMismatch
                          ? "border-amber-400 focus:border-amber-500 focus:ring-amber-500 bg-amber-50/20"
                          : form.customer.gstin?.length === 15
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50/20"
                            : "border-[#ebdbe2] focus:border-[#632f4a] focus:ring-[#632f4a]"
                        : !gstinValidation.isEmpty && gstinValidation.isValid
                          ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500 bg-emerald-50/20 font-bold"
                          : "border-[#ebdbe2] focus:border-[#632f4a] focus:ring-[#632f4a]"
                    }`}
                    value={form.customer.gstin}
                    onChange={(e) =>
                      handleCustomerChange("gstin", e.target.value)
                    }
                  />
                  {gstinValidation.isEmpty ? (
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      Optional. Auto-syncs State & PAN
                    </span>
                  ) : form.customer.gstin?.length < 15 ? (
                    <span className="text-[10px] text-amber-600 font-mono mt-1 block font-semibold">
                      {form.customer.gstin?.length}/15 chars • State: {INDIAN_STATE_CODES[form.customer.gstin.slice(0, 2)] || "Entering..."}
                    </span>
                  ) : gstinValidation.isValid ? (
                    <span className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                      ✓ Valid GSTIN ({gstinValidation.stateName})
                    </span>
                  ) : gstinValidation.stateMismatch ? (
                    <div className="mt-1 p-1 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[10px] flex items-center justify-between gap-1">
                      <span>⚠️ Starts with {gstinValidation.stateCode} ({gstinValidation.stateName})</span>
                      <button
                        type="button"
                        onClick={() => handleCustomerChange("stateCode", gstinValidation.stateCode)}
                        className="px-1.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition shrink-0"
                      >
                        Sync {gstinValidation.stateCode}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-red-600 font-semibold mt-1 block">
                      ⚠️ {gstinValidation.error}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    list="indian-state-codes"
                    placeholder="State Code (e.g. 23, 27)"
                    className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                    value={form.customer.stateCode}
                    onChange={(e) =>
                      handleCustomerChange("stateCode", e.target.value)
                    }
                  />
                  <datalist id="indian-state-codes">
                    {INDIAN_STATE_OPTIONS.map((st) => (
                      <option key={st.code} value={`${st.code} - ${st.name}`} />
                    ))}
                  </datalist>
                  {taxCalculation.stateCode && (
                    <div className="mt-1 flex items-center justify-between text-[10px] px-0.5">
                      <span className="text-[#8b7280] font-semibold truncate max-w-[140px]">
                        📍 {taxCalculation.stateName}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        taxCalculation.isInterState
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}>
                        {taxCalculation.isInterState ? "IGST" : "CGST+SGST"}
                      </span>
                    </div>
                  )}
                </div>
                <input
                  placeholder="PAN Number (If > 2L)"
                  className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                  value={form.customer.panNumber}
                  onChange={(e) =>
                    handleCustomerChange("panNumber", e.target.value.toUpperCase())
                  }
                  maxLength={10}
                />

              </div>


            </div>

            <div>
              <h2 className="text-[10px] uppercase font-bold text-[#a68e9b] tracking-wider mb-4">
                Salesperson Info
              </h2>

              <input
                placeholder="Salesperson"
                className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                value={form.salesperson}
                onChange={(e) =>
                  setForm((p) => ({ ...p, salesperson: e.target.value }))
                }
              />
            </div>

            {/* Bill Items Wrapper */}
            <div className="space-y-4 relative">
              <div className="flex justify-between items-end border-b border-[#ebdbe2] pb-2">
                <h2 className="text-[10px] uppercase font-bold text-[#a68e9b] tracking-wider">
                  Bill Items
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openPickupModal(null)}
                    className="bg-[#f7eff3] text-[#632f4a] hover:bg-[#ebdbe2] border border-[#ebdbe2] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    title="Pickup product or diamond by SKU"
                  >
                    <PackageSearch size={15} /> Pickup by SKU
                  </button>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-[#632f4a] font-bold text-sm flex items-center gap-1 hover:text-[#4a2b3d] transition-colors"
                  >
                    <span className="text-lg leading-none">+</span> Add Item
                  </button>
                </div>
              </div>

              {form.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border-l-[4px] border-[#632f4a] rounded-r-xl border-y border-r border-[#ebdbe2] shadow-sm flex flex-col md:flex-row relative overflow-hidden"
                >
                  {/* Left part of the item card */}
                  <div className="flex-1 p-5 space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-bold text-[#4a2b3d] text-base">
                          Item {i + 1}
                        </h3>
                        {item.sku && (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono font-bold">
                            SKU: {item.sku}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openPickupModal(i)}
                          className="text-[11px] font-bold text-[#632f4a] bg-[#f7eff3] hover:bg-[#ebdbe2] px-2.5 py-1 rounded-md border border-[#ebdbe2] flex items-center gap-1 transition-colors"
                          title="Search & Pickup specs by SKU for this item"
                        >
                          <PackageSearch size={13} /> Pickup Product
                        </button>
                      </div>
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="text-[#e57373] hover:text-[#d32f2f] transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* PRODUCT INFO */}
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-[#b8a6b1] tracking-wider mb-2">
                        Product Info
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Product Name
                          </label>
                          <input
                            value={item.title}
                            onChange={(e) =>
                              handleItemChange(i, "title", e.target.value)
                            }
                            placeholder="Earring"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            HSN Code
                          </label>
                          <input
                            value={item.hsnCode}
                            onChange={(e) =>
                              handleItemChange(i, "hsnCode", e.target.value)
                            }
                            placeholder="J118"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                          />
                        </div>
                        {/* Multiple Certificates */}
                        <div className="col-span-full">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] uppercase font-bold text-[#a68e9b]">
                              Certificates
                            </label>
                            <button
                              type="button"
                              onClick={() => addCertificate(i)}
                              className="text-[10px] text-[#632f4a] font-bold hover:underline"
                            >
                              + Add Certificate
                            </button>
                          </div>
                          <div className="space-y-2">
                            {item.certificates?.map((cert, cIndex) => (
                              <div key={cIndex} className="flex gap-2 items-center">
                                <input
                                  placeholder="Lab (e.g. GIA, IGI)"
                                  className="w-1/3 border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                                  value={cert.lab}
                                  onChange={(e) => handleCertificateChange(i, cIndex, "lab", e.target.value)}
                                />
                                <input
                                  placeholder="Certificate Number"
                                  className="flex-1 border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                                  value={cert.certificateNo}
                                  onChange={(e) => handleCertificateChange(i, cIndex, "certificateNo", e.target.value)}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeCertificate(i, cIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                            {(!item.certificates || item.certificates.length === 0) && (
                              <p className="text-[10px] text-[#a68e9b] italic">No certificates added</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* METAL INFO */}
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-[#b8a6b1] tracking-wider mb-2">
                        Metal Info
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Metal
                          </label>
                          <select
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={item.metalType}
                            onChange={(e) =>
                              handleItemChange(i, "metalType", e.target.value)
                            }
                          >
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Platinum">Platinum</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Purity
                          </label>
                          <select
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={item.purity}
                            onChange={(e) =>
                              handleItemChange(i, "purity", e.target.value)
                            }
                          >
                            {Object.keys(METAL_CONFIG[item.metalType].purities).map(
                              (p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Gross WT (g)
                          </label>
                          <input
                            placeholder="0.000"
                            min="0"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={item.grossWeight}
                            onChange={(e) =>
                              handleItemChange(i, "grossWeight", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Net WT (g)
                          </label>
                          <input
                            placeholder="0.000"
                            min="0"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={item.netWeight}
                            onChange={(e) =>
                              handleItemChange(i, "netWeight", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* <button   className="px-3 py-1.5 text-xs bg-[#6B2E4A] text-white rounded-md hover:bg-[#5A2640] transition-colors"  type="button" onClick={() => addDiamond(i)}>+ Add Diamond</button> */}
                    {/* ADD DIAMOND BUTTON */}


                    <button
                      className={`px-3 py-1.5 text-xs bg-[#6B2E4A] text-white rounded-md hover:bg-[#5A2640] transition-colors 
  ${item.diamonds.length === 0 ? "mb-0" : ""}`}
                      type="button"
                      onClick={() => addDiamond(i)}
                    >
                      + Add Diamond
                    </button>
                    {/* DIAMOND INFO */}

                    {item.diamonds.map((d, dIndex) => (
                      <div key={dIndex} className="grid grid-cols-5 gap-2">

                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Qty
                          </label>

                          <input
                            placeholder="Qty"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={d.qty}
                            onChange={(e) =>
                              handleDiamondChange(i, dIndex, "qty", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Total (ct)
                          </label>
                          <input
                            placeholder="total (Ct)"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={d.grossWeight}
                            onChange={(e) =>
                              handleDiamondChange(i, dIndex, "grossWeight", e.target.value)
                            }
                          />
                        </div>


                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            weight (CT)
                          </label>
                          <input
                            placeholder="weight (CT)"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={d.netWeight}
                            readOnly
                          />
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Rate
                          </label>

                          <input
                            placeholder="Rate"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={d.rate}
                            onChange={(e) =>
                              handleDiamondChange(i, dIndex, "rate", e.target.value)
                            }
                          />
                        </div>
                        <button className="text-xs text-red-600 hover:text-red-800" type="button" onClick={() => removeDiamond(i, dIndex)}>remove</button>
                      </div>
                    ))}

                    {/* STONE INFO */}
                    {/* <div>
                      <h4 className="text-[10px] uppercase font-bold text-[#b8a6b1] tracking-wider mb-2">
                        Stone Info
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Weight (CT)
                          </label>
                          <input
                            placeholder="0.00"
                             min="0"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={item.stoneWeight}
                            onChange={(e) =>
                              handleItemChange(i, "stoneWeight", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Qty
                          </label>
                          <input
                            placeholder="0"
                             min="0"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={item.stoneQty}
                            onChange={(e) =>
                              handleItemChange(i, "stoneQty", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Rate
                          </label>
                          <input
                            placeholder="0.00"
                             min="0"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={item.stoneRate}
                            onChange={(e) =>
                              handleItemChange(i, "stoneRate", e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">
                            Making Value
                          </label>
                          <input
                            placeholder="0.00"
                             min="0"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none"
                            value={item.makingCharge}
                            readOnly
                          />
                        </div>
                      </div>
                    </div> */}

                    {/* <button    type="button" onClick={() => addStone(i)}>+ Add Stone</button> */}

                    {/* ADD STONE BUTTON */}
                    <button
                      className={`px-3 py-1.5 text-xs bg-[#6B2E4A] text-white rounded-md hover:bg-[#5A2640] transition-colors ml-2
  ${item.stones.length === 0 ? "mt-0" : ""}`}
                      type="button"
                      onClick={() => addStone(i)}
                    >
                      + Add Stone
                    </button>


                    {item.stones.map((s, sIndex) => (
                      <div key={sIndex} className="grid grid-cols-5 gap-2">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">Qty</label>
                          <input
                            placeholder="Qty"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={s.qty}
                            onChange={(e) => handleStoneChange(i, sIndex, "qty", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">Total (CT)</label>
                          <input
                            placeholder="Total (Ct)"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={s.grossWeight}
                            onChange={(e) => handleStoneChange(i, sIndex, "grossWeight", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">weight (CT)</label>
                          <input
                            placeholder="Weight (CT)"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={s.netWeight}
                            readOnly
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">Rate</label>
                          <input
                            placeholder="Rate"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={s.rate}
                            onChange={(e) => handleStoneChange(i, sIndex, "rate", e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStone(i, sIndex)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          remove
                        </button>
                      </div>
                    ))}

                    {/* BELT BUTTON & INFO */}
                    <button
                      className={`px-3 py-1.5 text-xs bg-[#6B2E4A] text-white rounded-md hover:bg-[#5A2640] transition-colors ml-2
  ${item.belts.length === 0 ? "mt-0" : ""}`}
                      type="button"
                      onClick={() => addBelt(i)}
                    >
                      + Add Belt
                    </button>

                    {item.belts.map((b, bIndex) => (
                      <div key={bIndex} className="grid grid-cols-6 gap-2">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">Material</label>
                          <input
                            placeholder="Material"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={b.material}
                            onChange={(e) => handleBeltChange(i, bIndex, "material", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">Color</label>
                          <input
                            placeholder="Color"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={b.color}
                            onChange={(e) => handleBeltChange(i, bIndex, "color", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">Size</label>
                          <input
                            placeholder="Size"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={b.size}
                            onChange={(e) => handleBeltChange(i, bIndex, "size", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">Qty</label>
                          <input
                            placeholder="Qty"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={b.qty}
                            onChange={(e) => handleBeltChange(i, bIndex, "qty", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-[#a68e9b] block mb-1">Rate</label>
                          <input
                            placeholder="Rate"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={b.rate}
                            onChange={(e) => handleBeltChange(i, bIndex, "rate", e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBelt(i, bIndex)}
                          className="text-xs text-red-600 hover:text-red-800 self-end mb-2"
                        >
                          remove
                        </button>
                      </div>
                    ))}


                  </div>



                  {/* Right part of item card: Discounts & Final Value */}
                  <div className="w-full md:w-[32%] bg-[#faf8f9] border-l border-[#ebdbe2] flex flex-col justify-between p-5 relative">
                    <div>
                      <div className="flex justify-between items-center mb-5">
                        <h4 className="text-[10px] uppercase font-bold text-[#a68e9b] tracking-wider">
                          Item Discounts
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...form.items];
                            updated[i].discountEnabled = !updated[i].discountEnabled;
                            setForm((p) => ({ ...p, items: updated }));
                          }}
                          className="text-[11px] font-bold text-[#4a2b3d] hover:text-[#632f4a]"
                        >
                          {item.discountEnabled ? "Hide" : "Show"}
                        </button>
                      </div>

                      {item.discountEnabled && (
                        <div className="space-y-4">
                          {["making", "diamond", "stone", "belt"].map((type) => (
                            <div
                              key={type}
                              className="grid grid-cols-[1fr_auto_auto] gap-2 items-center"
                            >
                              <span className="text-xs font-semibold text-[#8b7280] capitalize">
                                {type}
                              </span>
                              <select
                                className="w-12 border border-[#ebdbe2] rounded px-1 py-2 text-xs text-center text-[#4a2b3d] bg-white appearance-none focus:outline-none"
                                value={item.discounts[type].type}
                                onChange={(e) =>
                                  handleDiscountChange(i, type, "type", e.target.value)
                                }
                              >
                                <option value="percent">%</option>
                                <option value="flat">₹</option>
                              </select>
                              <input
                                type="number"
                                min="0"
                                className="w-20 border border-[#ebdbe2] rounded px-2 py-2 text-xs text-[#4a2b3d] text-right focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                                value={item.discounts[type].value}
                                onChange={(e) =>
                                  handleDiscountChange(i, type, "value", e.target.value)
                                }
                              />
                            </div>
                          ))}
                        </div>
                      )}


                    </div>



                    {/* Item Final Calculator */}
                    <div className="pt-6 mt-6 border-t border-dashed border-[#ebdbe2] flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-[#a68e9b] tracking-wider">
                        Item Final
                      </span>
                      <span className="text-[#4a2b3d] font-bold text-sm">
                        ₹ {getItemFinalPrice(item).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>


            <div className="bg-white p-5 rounded-xl border border-[#ebdbe2] shadow-sm">
              <div className="flex justify-between items-center">

                {/* Title with left accent */}
                <h3 className="text-sm font-semibold text-[#4a2b3d] relative pl-3">
                  <span className="absolute left-0 top-1 h-4 w-[3px] bg-[#632f4a] rounded"></span>
                  Making Charges
                </h3>

                {/* Value */}
                <div className="text-[#4a2b3d] font-bold text-lg">
                  ₹ {totals.making.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>

              </div>
            </div>

            {/* Payment Info Box */}
            <div className="bg-white p-5 rounded-xl border border-[#ebdbe2] shadow-sm relative mt-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[10px] uppercase font-bold text-[#a68e9b] tracking-wider">
                  Payment Info
                </h2>

                {/* SPLIT TOGGLE BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsSplitPayment(prev => !prev)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest transition-all border ${isSplitPayment
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    }`}
                >
                  ✂ SPLIT PAYMENT
                </button>
              </div>

              {isSplitPayment ? (
                <div className="space-y-4 mb-4">
                  {/* Remaining Balance Indicator */}
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold ${Math.abs(splitTotal - maxPayable) < 1
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                    <span>Total Allocated: ₹{splitTotal.toLocaleString("en-IN")}</span>
                    <span>
                      {Math.abs(splitTotal - maxPayable) < 1
                        ? "✓ Balanced"
                        : `Remaining: ₹${Math.max(0, maxPayable - splitTotal).toLocaleString("en-IN")}`
                      }
                    </span>
                  </div>

                  {/* Split Rows */}
                  {splitPayments.map((split, idx) => (
                    <div key={idx} className="border border-[#ebdbe2] rounded-lg p-3 space-y-3 bg-[#faf8f9] relative">
                      <div className="flex justify-between items-center">
                        <p className="text-[9px] font-extrabold uppercase tracking-widest text-[#632f4a]">
                          Payment {idx + 1}
                        </p>
                        {splitPayments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => deleteSplitPayment(idx)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>

                      {/* Mode Selector */}
                      <div className="flex flex-wrap gap-1.5">
                        {["CASH", "UPI", "CARD", "BANK"].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              const updated = [...splitPayments];
                              updated[idx] = { ...updated[idx], mode: m, referenceNo: "" };
                              setSplitPayments(updated);
                            }}
                            className={`px-3 py-1 rounded-full text-[9px] font-bold tracking-widest transition-all ${split.mode === m
                              ? "bg-[#632f4a] text-white"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                              }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>

                      {/* Amount input */}
                      <div>
                        <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Amount</label>
                        <input
                          type="number"
                          placeholder="Amount"
                          className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                          value={split.amount || ""}
                          onChange={(e) => handleAmountChange(idx, e.target.value)}
                        />
                      </div>

                      {/* Reference No (if not CASH) */}
                      {split.mode !== "CASH" && (
                        <div>
                          <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Reference No.</label>
                          <input
                            placeholder="TXN987654321"
                            className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                            value={split.referenceNo || ""}
                            onChange={(e) => updateSplitPaymentField(idx, "referenceNo", e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Payment Button */}
                  <button
                    type="button"
                    onClick={addSplitPayment}
                    className="w-full py-2 bg-white hover:bg-neutral-50 text-[#632f4a] text-[10px] font-bold tracking-widest uppercase rounded-xl border border-dashed border-[#632f4a]/30 transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    + Add Payment Method
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <select
                    className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] bg-white focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                    value={form.payment.mode}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        payment: { ...p.payment, mode: e.target.value },
                      }))
                    }
                  >
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">CARD</option>
                    <option value="BANK">BANK</option>
                    <option value="CHEQUE">CHEQUE</option>
                  </select>
                  <input
                    placeholder="Reference No."
                    className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                    value={form.payment.referenceNo}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        payment: { ...p.payment, referenceNo: e.target.value },
                      }))
                    }
                  />
                </div>
              )}

              {/* Available Credits Block */}
              {credits.length > 0 && (
                <div className="mt-4 p-3 border-t border-[#ebdbe2]">
                  <h3 className="text-[10px] uppercase font-bold text-green-600 tracking-wider mb-2 flex justify-between items-center">
                    <span>Available Credits ({credits.length})</span>
                    {selectedCreditIds.length > 0 && (
                      <span className="text-xs text-[#4a2b3d] lowercase font-normal">
                        {selectedCreditIds.length} selected
                      </span>
                    )}
                  </h3>
                  <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {credits.map(cn => (
                      <div
                        key={cn._id}
                        onClick={() => toggleCredit(cn)}
                        className={`flex justify-between items-center p-2.5 rounded border transition-all cursor-pointer ${selectedCreditIds.includes(cn._id)
                          ? "bg-[#f0f9f0] border-green-200 shadow-sm"
                          : "bg-white border-[#eee] hover:border-green-100"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCreditIds.includes(cn._id) ? "bg-green-600 border-green-600" : "border-gray-300"
                            }`}>
                            {selectedCreditIds.includes(cn._id) && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-[#4a2b3d]">{cn.creditNoteNo}</div>
                            <div className="text-[9px] text-gray-500">{new Date(cn.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-[#4a2b3d]">₹{cn.remainingAmount.toLocaleString('en-IN')}</div>
                          {selectedCreditIds.includes(cn._id) && (
                            <div className="text-[9px] text-green-600 font-bold uppercase">Applied</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Old Metal Exchange Box */}
            <div className="bg-white p-5 rounded-xl border border-[#ebdbe2] shadow-sm relative mt-3">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-[#632f4a]" />
                  <h2 className="text-[10px] uppercase font-bold text-[#a68e9b] tracking-wider">
                    Old Gold / Metal Exchange
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setUseMetalExchange(!useMetalExchange)}
                  className={`w-9 h-5 rounded-full relative transition-colors duration-300 focus:outline-none ${useMetalExchange ? 'bg-[#632f4a]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${useMetalExchange ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              {useMetalExchange && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold tracking-widest uppercase text-[#4a2b3d] mb-1">
                        Metal Type
                      </label>
                      <select
                        className="w-full h-9 border border-[#ebdbe2] rounded bg-white text-xs px-2 text-[#4a2b3d] outline-none focus:border-[#632f4a]"
                        value={metalExchange.metalType}
                        onChange={(e) => setMetalExchange({ ...metalExchange, metalType: e.target.value })}
                      >
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="platinum">Platinum</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold tracking-widest uppercase text-[#4a2b3d] mb-1">
                        Purity
                      </label>
                      <select
                        className="w-full h-9 border border-[#ebdbe2] rounded bg-white text-xs px-2 text-[#4a2b3d] outline-none focus:border-[#632f4a]"
                        value={metalExchange.purity}
                        onChange={(e) => setMetalExchange({ ...metalExchange, purity: e.target.value })}
                      >
                        {(purityOptions[metalExchange.metalType] || []).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold tracking-widest uppercase text-[#4a2b3d] mb-1">
                        Rate (₹/g)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className="w-full h-9 border border-[#ebdbe2] rounded bg-white text-xs px-3 text-[#4a2b3d] outline-none focus:border-[#632f4a]"
                        placeholder="0.00"
                        value={metalExchange.ratePerGram || ""}
                        onChange={(e) => setMetalExchange({ ...metalExchange, ratePerGram: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold tracking-widest uppercase text-[#4a2b3d] mb-1">
                        Weight (g)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className="w-full h-9 border border-[#ebdbe2] rounded bg-white text-xs px-3 text-[#4a2b3d] outline-none focus:border-[#632f4a]"
                        placeholder="0.000"
                        value={metalExchange.weight || ""}
                        onChange={(e) => setMetalExchange({ ...metalExchange, weight: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="bg-[#f6faf5] border border-[#e9f2e7] rounded-lg p-3.5 flex flex-col justify-center items-start">
                    <span className="text-[9px] font-bold tracking-widest text-[#3b5b33] uppercase mb-0.5">
                      Old Metal Credit Value
                    </span>
                    <span className="text-xl font-bold text-[#2a4523]">
                      ₹{metalExchange.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-[#557a4c] mt-0.5 font-medium">
                      Rate Applied: ₹{(metalExchange.ratePerGram || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / g
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Summary & Rates (Sticky layout) */}
          <div className="lg:col-span-4 space-y-5 sticky top-6">
            {/* Metal Base Rates */}
            <div className="bg-[#f7f3f5] p-5 rounded-xl border border-[#e8dde2]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[10px] uppercase font-bold text-[#8b7280] tracking-wider">
                  Metal Base Rates
                </h2>
                <button
                  type="button"
                  onClick={toggleRateLock}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded flex items-center gap-1.5 transition-colors ${form.ratesLocked
                    ? "bg-[#632f4a] text-white"
                    : "bg-[#e8dde2] text-[#632f4a]"
                    }`}
                >
                  {form.ratesLocked ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      LOCKED
                    </>
                  ) : (
                    <>🔓 UNLOCK</>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                <input
                  title="Gold 24k"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Gold 24k"
                  className="w-full border border-[#ebdbe2] rounded px-1 py-2 text-xs text-center text-[#4a2b3d] focus:outline-none focus:border-[#632f4a]"
                  disabled={form.ratesLocked}
                  value={form.baseRates.gold24k}
                  onChange={(e) =>
                    handleBaseRateChange("gold24k", e.target.value)
                  }
                />
                <input
                  title="Silver 999"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Silver 999"
                  className="w-full border border-[#ebdbe2] rounded px-1 py-2 text-xs text-center text-[#4a2b3d] focus:outline-none focus:border-[#632f4a]"
                  disabled={form.ratesLocked}
                  value={form.baseRates.silver999}
                  onChange={(e) =>
                    handleBaseRateChange("silver999", e.target.value)
                  }
                />
                <input
                  title="Platinum 999"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Pt"
                  className="w-full border border-[#ebdbe2] rounded px-1 py-2 text-xs text-center text-[#4a2b3d] focus:outline-none focus:border-[#632f4a]"
                  disabled={form.ratesLocked}
                  value={form.baseRates.platinum999}
                  onChange={(e) =>
                    handleBaseRateChange("platinum999", e.target.value)
                  }
                />
                <input
                  title="Gold Making"
                  type="number"
                  step="any"
                  placeholder="Gold M"
                  min="0"
                  className="w-full border border-[#ebdbe2] rounded px-1 py-2 text-xs text-center text-[#4a2b3d] focus:outline-none focus:border-[#632f4a]"
                  disabled={form.ratesLocked}
                  value={form.makingRates.Gold}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, makingRates: { ...p.makingRates, Gold: e.target.value } }))
                  }
                />
                <input
                  title="Silver Making"
                  type="number"
                  step="any"
                  placeholder="Silver M"
                  min="0"
                  className="w-full border border-[#ebdbe2] rounded px-1 py-2 text-xs text-center text-[#4a2b3d] focus:outline-none focus:border-[#632f4a]"
                  disabled={form.ratesLocked}
                  value={form.makingRates.Silver}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, makingRates: { ...p.makingRates, Silver: e.target.value } }))
                  }
                />
                <input
                  title="Platinum Making"
                  type="number"
                  step="any"
                  placeholder="Plat M"
                  min="0"
                  className="w-full border border-[#ebdbe2] rounded px-1 py-2 text-xs text-center text-[#4a2b3d] focus:outline-none focus:border-[#632f4a]"
                  disabled={form.ratesLocked}
                  value={form.makingRates.Platinum}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, makingRates: { ...p.makingRates, Platinum: e.target.value } }))
                  }
                />
                <input
                  title="GST %"
                  type="number"
                  step="any"
                  min="0"
                  placeholder="GST %"
                  className="w-full border border-[#ebdbe2] rounded px-1 py-2 text-xs text-center text-[#4a2b3d] focus:outline-none focus:border-[#632f4a]"
                  disabled={form.ratesLocked}
                  value={form.gstPercent}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, gstPercent: e.target.value }))
                  }
                />
              </div>



              {/* Option to Disable Min Making Weight & Flat Fee */}
              <div className="mt-3 pt-2.5 border-t border-[#ebdbe2]/60 flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#4a2b3d]">Disable Min Weight / Flat Fee</span>
                  <span className="text-[10px] text-[#a68e9b]">Bypass admin minimum weight & flat fee for making</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={form.disableMinMakingRule || false}
                    disabled={form.ratesLocked}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, disableMinMakingRule: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-[#e8dde2] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#632f4a] disabled:opacity-50"></div>
                </label>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="bg-[#632f4a] p-7 rounded-xl text-white shadow-md relative overflow-hidden">
              <h2 className="text-[10px] uppercase font-bold text-[#bfa9b4] tracking-wider mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-[#d8c5cf]">Metal Subtotal</span>
                  <span>₹ {totals.metal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#d8c5cf]">Making Charges</span>
                  <span>₹ {totals.making.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#d8c5cf]">Diamond Value</span>
                  <span>₹ {totals.diamond.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#d8c5cf]">Stone Value</span>
                  <span>₹ {totals.stone.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#d8c5cf]">Belt Value</span>
                  <span>₹ {totals.belt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center font-bold text-white pt-4 pb-3">
                  <span className="uppercase tracking-wider text-xs">Total Discount</span>
                  <span className="text-base">- ₹ {totals.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                {/* Dynamic Tax Breakdown & Override Toggle */}
                <div className="pb-4 border-b border-[#73425d] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isInterState
                          ? "bg-blue-500/30 text-blue-200 border border-blue-400/40"
                          : "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                      }`}>
                        {isInterState ? `🌐 IGST (${taxCalculation.stateName})` : "🏠 CGST + SGST (MP)"}
                      </span>
                    </div>

                    {/* Tax Override Selector */}
                    <div className="flex bg-[#52253e] rounded p-0.5 border border-[#7a4163]">
                      <button
                        type="button"
                        title="Auto-detect based on State Code / GSTIN"
                        onClick={() => setForm(p => ({ ...p, taxTypeOverride: "AUTO" }))}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all ${
                          (!form.taxTypeOverride || form.taxTypeOverride === "AUTO")
                            ? "bg-[#cda44b] text-white shadow-xs"
                            : "text-[#d8c5cf] hover:text-white"
                        }`}
                      >
                        Auto
                      </button>
                      <button
                        type="button"
                        title="Force CGST + SGST (MP Intra-State)"
                        onClick={() => setForm(p => ({ ...p, taxTypeOverride: "INTRA_STATE" }))}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all ${
                          form.taxTypeOverride === "INTRA_STATE"
                            ? "bg-[#cda44b] text-white shadow-xs"
                            : "text-[#d8c5cf] hover:text-white"
                        }`}
                      >
                        CGST+SGST
                      </button>
                      <button
                        type="button"
                        title="Force IGST (Out-of-State)"
                        onClick={() => setForm(p => ({ ...p, taxTypeOverride: "INTER_STATE" }))}
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-all ${
                          form.taxTypeOverride === "INTER_STATE"
                            ? "bg-[#cda44b] text-white shadow-xs"
                            : "text-[#d8c5cf] hover:text-white"
                        }`}
                      >
                        IGST
                      </button>
                    </div>
                  </div>

                  {isInterState ? (
                    <div className="flex justify-between items-center text-sm pt-1">
                      <span className="text-[#d8c5cf]">
                        IGST ({form.gstPercent}%{Number(form.gstPercent) === Number(rates?.tax?.looseDiamondGst ?? 1.5) ? " · Loose Dia" : ""})
                      </span>
                      <span className="font-semibold">₹ {gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[#d8c5cf]">CGST ({halfGstRate}%)</span>
                        <span>₹ {halfGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#d8c5cf]">SGST ({halfGstRate}%)</span>
                        <span>₹ {halfGstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-[#73425d]/50 text-[#e2d4dc] font-semibold">
                        <span>Total GST ({form.gstPercent}%)</span>
                        <span>₹ {gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <span className="text-[10px] uppercase font-bold text-[#bfa9b4] tracking-wider block mb-1">
                    Payable
                  </span>

                  <div className="flex justify-between items-end mb-2">
                    <span className="text-lg font-bold">Grand Total</span>
                    <span className={(appliedCredit > 0 || metalCredit > 0) ? "text-2xl font-bold" : "text-3xl font-bold"}>
                      ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {appliedCredit > 0 && (
                    <div className="flex justify-between items-end mb-2 text-green-300">
                      <span className="text-sm font-bold">Store Credit Applied</span>
                      <span className="text-xl font-bold">
                        - ₹ {appliedCredit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {metalCredit > 0 && (
                    <div className="flex justify-between items-end mb-2 text-emerald-300">
                      <span className="text-sm font-bold">Old Gold Credit</span>
                      <span className="text-xl font-bold">
                        - ₹ {metalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {(appliedCredit > 0 || metalCredit > 0) && (
                    <div className="flex justify-between items-end pt-2 border-t border-[#73425d]">
                      <span className="text-lg font-bold text-yellow-500">Net Due</span>
                      <span className="text-3xl font-bold text-yellow-500">
                        ₹ {Math.max(0, grandTotal - appliedCredit - metalCredit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-4">
              <button
                type="submit"
                className="w-full bg-[#cda44b] hover:bg-[#b08b3c] text-white py-4 rounded-xl font-bold text-base shadow-sm transition-colors"
              >
                Generate Final Invoice
              </button>
            </div>

            {/* <p className="text-center text-[11px] text-[#a68e9b] font-medium">
              Draft autosaved at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p> */}
          </div>
        </form>

        {/* ================= PICKUP BY SKU MODAL ================= */}
        {isPickupModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full p-3.5 sm:p-6 shadow-2xl border border-[#ebdbe2]/80 flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in zoom-in-95 duration-200 overflow-hidden">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start pb-3 sm:pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#fbf4f7] to-[#f2e2ec] border border-[#ebdbe2] text-[#632f4a] flex items-center justify-center shadow-xs shrink-0">
                    <PackageSearch className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-[#3a1a2b] text-base sm:text-xl tracking-tight">
                        Product Pickup by SKU
                      </h3>
                      {targetItemIndex !== null && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#fbf4f7] text-[#632f4a] border border-[#ebdbe2]">
                          Item {targetItemIndex + 1}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
                      Search inventory or loose diamonds to auto-fill metal, making rates, diamonds, and prices.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPickupModalOpen(false)}
                  className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 ml-1"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Bar & Filter Tabs */}
              <div className="py-3 sm:py-4 space-y-2.5 sm:space-y-3">
                <div className="relative flex items-center">
                  <Search size={16} className="absolute left-3.5 sm:left-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search by SKU (e.g. NDNK0001, RK-001) or Product Name..."
                    value={pickupSearch}
                    onChange={(e) => {
                      setPickupSearch(e.target.value);
                      fetchPickupResults(e.target.value);
                    }}
                    className="w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#632f4a] focus:ring-4 focus:ring-[#632f4a]/10 transition-all font-medium text-gray-800 placeholder-gray-400 shadow-xs"
                  />
                  <div className="absolute right-3 sm:right-3.5 flex items-center gap-1.5">
                    {pickupLoading && (
                      <Loader2 size={16} className="text-[#632f4a] animate-spin" />
                    )}
                    {pickupSearch && !pickupLoading && (
                      <button
                        type="button"
                        onClick={() => {
                          setPickupSearch("");
                          fetchPickupResults("");
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar sm:scrollbar-none -mx-1 px-1">
                  {[
                    { key: "ALL", label: "All Items", icon: LayoutGrid, count: pickupResults.length },
                    { key: "PRODUCT", label: "Jewellery", icon: Gem, count: pickupResults.filter(r => r.type === "PRODUCT").length },
                    { key: "DIAMOND", label: "Loose Diamonds", icon: Sparkles, count: pickupResults.filter(r => r.type === "DIAMOND").length },
                    { key: "GOLD", label: "Gold", icon: Coins, count: pickupResults.filter(r => r.type === "PRODUCT" && (r.metalType || "").toLowerCase().includes("gold")).length },
                    { key: "SILVER", label: "Silver", icon: Shield, count: pickupResults.filter(r => r.type === "PRODUCT" && (r.metalType || "").toLowerCase().includes("silver")).length },
                  ].map((tab) => {
                    const isActive = pickupTab === tab.key;
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setPickupTab(tab.key)}
                        className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                          isActive
                            ? "bg-[#4a2037] text-white shadow-sm"
                            : "bg-[#f4eff3] text-[#4a2b3d] hover:bg-[#ebdbe2]"
                        }`}
                      >
                        <IconComponent size={13} className={isActive ? "text-white" : "text-[#7a4b67]"} />
                        <span>{tab.label}</span>
                        <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive ? "bg-white/20 text-white" : "bg-[#e5dce2] text-[#4a2b3d]"
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Results List */}
              <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-2.5 pr-0.5 sm:pr-1 min-h-[260px] max-h-[58vh]">
                {pickupLoading && pickupResults.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#fbf4f7] flex items-center justify-center mb-3">
                      <Loader2 size={24} className="animate-spin text-[#632f4a]" />
                    </div>
                    <p className="text-sm font-bold text-gray-700">Searching inventory & diamond stock...</p>
                    <p className="text-xs text-gray-400 mt-1">Fetching live rates, breakdown, and product pricing</p>
                  </div>
                ) : (
                  (() => {
                    const filtered = pickupResults.filter((res) => {
                      if (pickupTab === "ALL") return true;
                      if (pickupTab === "PRODUCT") return res.type === "PRODUCT";
                      if (pickupTab === "DIAMOND") return res.type === "DIAMOND";
                      if (pickupTab === "GOLD") return res.type === "PRODUCT" && (res.metalType || "").toLowerCase().includes("gold");
                      if (pickupTab === "SILVER") return res.type === "PRODUCT" && (res.metalType || "").toLowerCase().includes("silver");
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-150 flex items-center justify-center mb-3 text-gray-300">
                            <Barcode size={32} />
                          </div>
                          <p className="text-sm font-bold text-gray-700">No matching items found</p>
                          <p className="text-xs text-gray-400 mt-1">Try entering a different SKU number or keyword</p>
                        </div>
                      );
                    }

                    return filtered.map((res, idx) => {
                      const isDiamond = res.type === "DIAMOND";
                      return (
                        <div
                          key={res.id}
                          onClick={() => handleSelectPickupProduct(res)}
                          className="group p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-[#efe9ed] hover:border-[#632f4a] bg-white hover:bg-[#fffcfd] shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3.5"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                            {/* Image Thumbnail with Heart Icon */}
                            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-[#f5f1f4] border border-[#ebdbe2] overflow-hidden relative shrink-0 flex items-center justify-center">
                              {res.image ? (
                                <img src={res.image} alt={res.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Gem size={22} className={isDiamond ? "text-purple-600" : "text-amber-600"} />
                                </div>
                              )}
                              <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-gray-400 shadow-xs">
                                <Heart size={10} className="sm:w-3 sm:h-3" strokeWidth={2} />
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Badges row */}
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
                                <span className="font-mono text-[10px] sm:text-[11px] font-extrabold px-1.5 sm:px-2 py-0.5 bg-[#fbf0f5] text-[#82335b] rounded-md border border-[#f0dce7]">
                                  {res.sku}
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-[#fef4e8] text-[#9b5c2a] border border-[#fae2cb]">
                                  {isDiamond ? "Loose Diamond" : res.category || "Jewellery"}
                                </span>
                                {res.stock !== undefined && (
                                  res.stock > 2 ? (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-[#eafaf1] text-[#229954] border border-[#cceeda] flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#229954]"></span>
                                      In Stock ({res.stock})
                                    </span>
                                  ) : res.stock > 0 ? (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-[#fef0ee] text-[#e74c3c] border border-[#fbcfca] flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#e74c3c]"></span>
                                      Low Stock ({res.stock})
                                    </span>
                                  ) : (
                                    <span className="text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                                      Out of Stock
                                    </span>
                                  )
                                )}
                              </div>

                              <h4 className="font-extrabold text-xs sm:text-base text-[#1f242e] truncate group-hover:text-[#632f4a] transition-colors leading-tight">
                                {res.title}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-gray-500 truncate mt-0.5 sm:mt-1 font-medium">
                                {res.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                            <div className="text-left sm:text-right">
                              <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-wider text-[#8b99a6] block leading-none mb-0.5">
                                LIVE VALUE
                              </span>
                              <p className="text-sm sm:text-lg font-black text-[#1c222c] tracking-tight">
                                ₹{(res.price || 0).toLocaleString("en-IN")}
                              </p>
                            </div>

                            <button
                              type="button"
                              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-lg sm:rounded-xl shadow-xs transition-all flex items-center gap-1 shrink-0 ${
                                idx === 0
                                  ? "bg-[#5c2644] text-white hover:bg-[#431b31]"
                                  : "bg-[#f7edf3] text-[#5c2644] group-hover:bg-[#5c2644] group-hover:text-white"
                              }`}
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}