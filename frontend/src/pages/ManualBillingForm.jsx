



//=========================================================================






import React, { useState, useEffect, useRef } from "react";
import { createManualInvoice } from "../api/invoiceApi";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { useRates } from "../context/RatesContext";

export default function ManualBillingForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirm } = useModal();
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
      ratesLocked: false,
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
        title: prefill.sku
          ? `Loose Diamond: ${prefill.labNatural || "Natural"} ${prefill.shape || ""} ${prefill.weight || ""}ct ${prefill.color || ""}/${prefill.clarity || ""} ${prefill.lab ? `(${prefill.lab})` : ""} [SKU: ${prefill.sku}]`
          : `Loose Diamond: ${prefill.labNatural || "Natural"} ${prefill.shape || ""} ${prefill.weight || ""}ct`,
        hsnCode: prefill.hsnCode || "",
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
      gstPercent: savedGST ? Number(savedGST) : 3,
      makingRates: localStorage.getItem("billing_making_rates")
        ? JSON.parse(localStorage.getItem("billing_making_rates"))
        : { Gold: "", Silver: "", Platinum: "" },
      ratesLocked: false,
    };
  });

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

    // Making charge: use flat fee if weight is below threshold
    const weight = Number(netWt || 0);
    const minWeight = Number(rates?.making?.minWeight || 0);
    const minFlat = Number(rates?.making?.flatFee || 0);
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
    if (location.state?.prefillDiamond) {
      toast.success("Diamond details auto-filled from stock!");
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
    setForm((p) => ({
      ...p,
      customer: { ...p.customer, [field]: value },
    }));
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

  useEffect(() => {
    localStorage.setItem("billing_base_rates", JSON.stringify(form.baseRates));
    localStorage.setItem("billing_items", JSON.stringify(form.items));
    localStorage.setItem("billing_gst", form.gstPercent);
    localStorage.setItem("billing_making_rates", JSON.stringify(form.makingRates));
  }, [form.baseRates, form.items, form.gstPercent, form.makingRates]);

  useEffect(() => {
    if (form.ratesLocked) return;

    const minWeight = Number(rates?.making?.minWeight || 0);
    const minFlat = Number(rates?.making?.flatFee || 0);

    const updatedItems = form.items.map((item) => {
      const weight = Number(item.netWeight || 0);
      const rate = Number(form.makingRates[item.metalType] || 0);

      let makingCharge = "0.00";
      if (weight > 0) {
        if (minWeight > 0 && weight < minWeight) {
          makingCharge = minFlat.toFixed(2);
        } else {
          makingCharge = (weight * rate).toFixed(2);
        }
      }

      return {
        ...item,
        makingRate: rate,
        makingCharge,
      };
    });

    setForm((p) => ({ ...p, items: updatedItems }));
  }, [form.makingRates, form.items.length, form.ratesLocked, rates]);

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
      const minWeight = Number(rates?.making?.minWeight || 0);
      const minFlat = Number(rates?.making?.flatFee || 0);

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

    if (isSplitPayment) {
      if (Math.abs(splitTotal - maxPayable) > 0.05) {
        alert(`Split payment total (₹${splitTotal.toLocaleString("en-IN")}) must match the Net Due (₹${maxPayable.toLocaleString("en-IN")})`);
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
        const netWeight = Number(d.netWeight || 0);
        const rate = Number(d.rate || 0);

        if (qty > 0) {
          componentBreakup.push({
            pricingRef: "DIAMOND",
            count: qty,
            weight: netWeight,
            rate,
            value: netWeight * rate,
            diamondId: d.diamondId
          });
        }
      });

      item.stones.forEach((s) => {
        const qty = Number(s.qty || 0);
        const netWeight = Number(s.netWeight || 0);
        const rate = Number(s.rate || 0);

        if (qty > 0) {
          componentBreakup.push({
            pricingRef: "STONE",
            count: qty,
            weight: netWeight,
            rate,
            value: netWeight * rate,
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

    const payload = {
      customer: form.customer,
      items: itemsPayload,
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
          mode: form.payment.mode,
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

      if (!invoiceId) return alert("Invoice ID missing");

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

      // optional: clear items cache
      localStorage.removeItem("billing_items");

      navigate(`/invoice/${invoiceId}`);
    } catch (err) {
      console.error("API Submission Error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Submission Failed: ${errMsg}`);
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
  const maxPayable = Math.max(0, grandTotal - appliedCredit);

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

  return (
    <div className="min-h-screen bg-[#fafbfc] p-6 font-sans text-[#4a2b3d]">

      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-[#5c2b41] hover:border-[#5c2b41]/20 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#5c2b41] leading-none mb-1">Manual Billing</h1>
            <p className="text-xs text-gray-400">Create client invoices manually</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
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
                <input
                  placeholder="GSTIN"
                  className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                  value={form.customer.gstin}
                  onChange={(e) =>
                    handleCustomerChange("gstin", e.target.value)
                  }
                />
                <input
                  placeholder="State Code"
                  className="w-full border border-[#ebdbe2] rounded text-sm px-3 py-2.5 text-[#4a2b3d] placeholder-[#c3b1bc] focus:outline-none focus:border-[#632f4a] focus:ring-1 focus:ring-[#632f4a]"
                  value={form.customer.stateCode}
                  onChange={(e) =>
                    handleCustomerChange("stateCode", e.target.value)
                  }
                />
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
                <button
                  type="button"
                  onClick={addItem}
                  className="text-[#632f4a] font-bold text-sm flex items-center gap-1 hover:text-[#4a2b3d] transition-colors"
                >
                  <span className="text-lg leading-none">+</span> Add Item
                </button>
              </div>

              {form.items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border-l-[4px] border-[#632f4a] rounded-r-xl border-y border-r border-[#ebdbe2] shadow-sm flex flex-col md:flex-row relative overflow-hidden"
                >
                  {/* Left part of the item card */}
                  <div className="flex-1 p-5 space-y-5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-[#4a2b3d] text-base">
                          Item {i + 1}
                        </h3>

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
                    <option>CASH</option>
                    <option>UPI</option>
                    <option>CARD</option>
                    <option>Bank</option>
                    <option>Cheque</option>
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

                <div className="flex justify-between items-center pb-4 border-b border-[#73425d]">
                  <span className="text-[#d8c5cf]">Tax (GST {form.gstPercent}%)</span>
                  <span>₹ {gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="pt-3">
                  <span className="text-[10px] uppercase font-bold text-[#bfa9b4] tracking-wider block mb-1">
                    Payable
                  </span>

                  <div className="flex justify-between items-end mb-2">
                    <span className="text-lg font-bold">Grand Total</span>
                    <span className={appliedCredit > 0 ? "text-2xl font-bold" : "text-3xl font-bold"}>
                      ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {appliedCredit > 0 && (
                    <div className="flex justify-between items-end mb-2 text-green-300">
                      <span className="text-sm font-bold">Exchange Credit Applied</span>
                      <span className="text-xl font-bold">
                        - ₹ {appliedCredit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {appliedCredit > 0 && (
                    <div className="flex justify-between items-end pt-2 border-t border-[#73425d]">
                      <span className="text-lg font-bold text-yellow-500">Net Due</span>
                      <span className="text-3xl font-bold text-yellow-500">
                        ₹ {Math.max(0, grandTotal - appliedCredit).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
      </div>
    </div>
  );
}