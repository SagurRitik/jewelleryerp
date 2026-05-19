
import { useEffect, useState } from "react";
import { createOrder, updateOrderById } from "../api/orderApi";
import { updateEstimate } from "../api/quotationApi";
import { useLocation } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";
import { useRates } from "../context/RatesContext";
import { useModal } from "../context/ModalContext";
import { Camera, ToggleLeft, ToggleRight } from "lucide-react";
import Webcam from "react-webcam";
import { useRef } from "react";
import { getDiamondRates } from "../api/diamondRateApi";
import { getStoneRates } from "../api/stoneRateApi";
import { findMatchingDiamondRate, findMatchingStoneRate } from "../utils/rateMatchUtils";

// Stone options - keeping only for reference if needed
const STONE_OPTIONS = [
  "ruby", "pearl", "red-coral", "emerald", "yellow-sapphire",
  "diamond", "blue-sapphire", "hessonite", "cats-eye", "gemstone"
];

const SHAPE_OPTIONS = ["Round", "Princess", "Cushion", "Oval", "Emerald", "Pear",
  "Marquise", "Asscher", "Radiant", "Heart", "Baguette", "Funcy"];
const CLARITY_OPTIONS = ["FL", "IF", "VVS-VS", "VVS1", "VVS2", "VS1", "VS2", "SI", "I"];
const PAYMENT_MODES = ["CASH", "UPI", "CARD", "BANK", "CHEQUE"];
const COLOR_OPTIONS = ["D-F", "G-H", "I-J", "O-Z"];
const ACCESSORY_CATEGORIES = ["Belt", "Box", "Bag", "Certificate", "Other"];


export default function OrderForm({ onSuccess, initialProduct: propInitialProduct, initialOrder }) {
  const [form, setForm] = useState({
    customer: {
      name: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
    },
    productSnapshot: {
      title: "",
      jewelleryCategory: "",
      description: "",
      size: "",
      metalType: "Gold",
      metalPurity: "22KT",
      metalColor: "yellow-gold",
      netWeight: 0,
      grossWeight: 0,
      diamonds: [],
      gemstones: [],
      belts: [],
      hsnCode: "",
      // productImage: null,
      productImages: [],
    },
    advancePayment: {
      amount: 0,
      mode: "CASH",
      transactionId: "",
    },
    metalPayment: null,
    status: "Placed",
    expectedDeliveryDate: "",
  });


  const { rates } = useRates();
  const { showAlert, showConfirm } = useModal();
  const [previewImage, setPreviewImage] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);

  const [adminDiamondRates, setAdminDiamondRates] = useState([]);
  const [adminStoneRates, setAdminStoneRates] = useState([]);

  useEffect(() => {
    getDiamondRates()
      .then((res) => { if (res.data?.success) setAdminDiamondRates(res.data.rates); })
      .catch((err) => console.error("Failed to load diamond rates", err));
    getStoneRates()
      .then((res) => { if (res.data?.success) setAdminStoneRates(res.data.rates); })
      .catch((err) => console.error("Failed to load stone rates", err));
  }, []);

  const location = useLocation();
  const initialProduct = propInitialProduct || location.state?.initialProduct || location.state?.product || null;
  const initialCustomer = location.state?.customer || null;
  const convertedFromEstimateId = location.state?.convertedFromEstimateId || null;
  const METAL_OPTIONS = {
    Gold: {
      purities: ["24KT", "22KT", "18KT", "14KT", "10KT", "9KT"],
      colors: ["yellow-gold", "white-gold", "rose-gold"],
    },
    Silver: {
      purities: ["999", "925", "835", "800"],
      colors: ["silver", "oxidised"],
    },
    Platinum: {
      purities: ["950", "900"],
      colors: ["platinum"],
    },
  };





  /* ================= PREFILL FROM CUSTOM PRODUCT ================= */


  useEffect(() => {
    if (!initialProduct) return;

    const diamonds = [];
    const gemstones = [];
    const belts = [];

    (initialProduct.components || []).forEach(c => {
      if (c.pricingRef === "DIAMOND") {
        diamonds.push({
          shape: c.shape || "",
          weight: Number(c.weight) || 0,
          grossWeight: Number(c.grossWeight) || 0,
          size: c.size ?? "",
          count: Number(c.count) || 1,
          clarity: c.clarity || "VVS",
          color: c.color || "D-F",
          rateOverride: c.rateOverride ?? null,
        });
      } else if (c.pricingRef === "BELT") {
        belts.push({
          material: c.category || "",
          color: c.shape || "",
          size: c.size || "",
          count: Number(c.count) || 1,
          rateOverride: c.rateOverride ?? null,
          rateLocked: !!c.rateOverride
        });
      } else {
        gemstones.push({
          name: c.type || "Ruby",
          shape: c.shape || "",
          weight: Number(c.weight) || 0,
          count: Number(c.count) || 1,
          grossWeight: Number(c.grossWeight) || 0,
          rateOverride: c.rateOverride ?? null,
        });
      }
    });

    setForm(prev => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        title: initialProduct.title || "",
        jewelleryCategory: initialProduct.jewelleryCategory || "",
        description: initialProduct.description || "",
        metalType: initialProduct.metalType || "Gold",
        metalPurity: initialProduct.metalPurity || "22KT",
        metalColor: initialProduct.metalColor || "yellow-gold",
        netWeight: Number(initialProduct.netWeight) || 0,
        grossWeight: Number(initialProduct.grossWeight) || 0,
        diamonds,
        gemstones,
        belts,
        productImages: (initialProduct.images || []).map(img =>
          getImageUrl(img)
        ),
      },
    }));
  }, [initialProduct]);

  useEffect(() => {
    if (!initialCustomer) return;
    setForm(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        name: initialCustomer.name || prev.customer.name,
        mobile: initialCustomer.mobile || prev.customer.mobile,
        email: initialCustomer.email || prev.customer.email,
        address: initialCustomer.address || prev.customer.address,
        city: initialCustomer.city || prev.customer.city,
      }
    }));
  }, [initialCustomer]);

  useEffect(() => {
    if (!initialOrder) return;

    setForm({
      customer: { ...initialOrder.customer },
      productSnapshot: {
        ...initialOrder.productSnapshot,
        diamonds: (initialOrder.productSnapshot?.components || [])
          .filter(c => c.pricingRef === "DIAMOND")
          .map(d => ({ ...d, rateLocked: !!d.rateOverride })),
        gemstones: (initialOrder.productSnapshot?.components || [])
          .filter(c => c.pricingRef === "STONE")
          .map(g => ({ ...g, name: g.type, rateLocked: !!g.rateOverride })),
        belts: (initialOrder.productSnapshot?.components || [])
          .filter(c => c.pricingRef === "BELT")
          .map(b => ({ ...b, material: b.category, color: b.shape, rateLocked: !!b.rateOverride })),
        productImages: initialOrder.productSnapshot?.productImages || [],
      },
      advancePayment: {
        amount: initialOrder.advancePayment?.amount || 0,
        mode: initialOrder.advancePayment?.mode || "CASH",
        transactionId: initialOrder.advancePayment?.transactionId || "",
      },
      metalPayment: initialOrder.metalPayment ? { ...initialOrder.metalPayment } : null,
      status: initialOrder.status || "Placed",
      expectedDeliveryDate: initialOrder.expectedDeliveryDate ? new Date(initialOrder.expectedDeliveryDate).toISOString().split('T')[0] : "",
    });
  }, [initialOrder]);


  const captureFromCamera = () => {
    const imageSrc = webcamRef.current.getScreenshot();

    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera.jpg", { type: "image/jpeg" });

        setForm(prev => ({
          ...prev,
          productSnapshot: {
            ...prev.productSnapshot,
            productImages: [
              ...prev.productSnapshot.productImages,
              file
            ]
          }
        }));
      });

    setShowCamera(false);
  };


  /* ================= IMAGE HELPERS ================= */
  // const getImageSrc = (img) => {
  //   if (!img) return "";
  //   if (img instanceof File) return URL.createObjectURL(img);
  //   if (typeof img === "string" && img.startsWith("http")) return img;
  //   return `/${img}`;
  // };
  // const getImageSrc = (img) => {
  //   if (!img) return "";
  //   if (img instanceof File) return URL.createObjectURL(img);
  //   return getImageUrl(img);
  // };




  console.log("Rates from backend:", rates?.base);
  console.log("RATES FULL:", rates);
  console.log("COMPONENT RATES:", rates?.components);
  console.log("BASE RATES:", rates?.base);

  console.log("Diamonds:", form.productSnapshot.diamonds);
  console.log("Diamond Rate:", rates?.components?.diamond);
  //   const handleImageUpload = (e) => {
  //   const files = Array.from(e.target.files);
  //   if (!files.length) return;

  //   setForm((prev) => ({
  //     ...prev,
  //     productSnapshot: {
  //       ...prev.productSnapshot,
  //       productImages: [
  //         ...prev.productSnapshot.productImages,
  //         ...files,
  //       ],
  //     },
  //   }));
  // };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    setForm(prev => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        productImages: [
          ...prev.productSnapshot.productImages,
          ...files
        ]
      }
    }));
  };

  const removeImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        productImages: prev.productSnapshot.productImages.filter(
          (_, index) => index !== indexToRemove
        ),
      },
    }));
  };


  /* ================= DIAMOND HANDLERS ================= */
  const addDiamond = () => {
    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        diamonds: [
          ...prev.productSnapshot.diamonds,
          {
            shape: "",
            weight: 0,
            grossWeight: 0,
            size: "",
            count: 1,
            clarity: "VVS",
            color: "",
            rateOverride: null,
            rateLocked: false
          }
        ],
      },
    }));
  };

  // const updateDiamond = (index, field, value) => {
  //   const updatedDiamonds = [...form.productSnapshot.diamonds];
  //   updatedDiamonds[index] = {
  //     ...updatedDiamonds[index],
  //     [field]: value,
  //   };

  const updateDiamond = (index, field, value) => {
    const updatedDiamonds = [...form.productSnapshot.diamonds];

    updatedDiamonds[index] = {
      ...updatedDiamonds[index],
      [field]: value,
    };

    // auto calculate net weight from grossWeight / count
    const grossWeight = parseFloat(updatedDiamonds[index].grossWeight) || 0;
    const count = parseFloat(updatedDiamonds[index].count) || 0;

    if (count > 0) {
      updatedDiamonds[index].weight = (grossWeight / count).toFixed(3);
    }

    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        diamonds: updatedDiamonds,
      },
    }));
  };

  const removeDiamond = (index) => {
    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        diamonds: prev.productSnapshot.diamonds.filter((_, i) => i !== index),
      },
    }));
  };

  /* ================= GEMSTONE HANDLERS ================= */
  const addGemstone = () => {
    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        gemstones: [
          ...prev.productSnapshot.gemstones,
          {
            name: "Ruby",
            shape: "",
            weight: 0,
            grossWeight: 0,
            count: 1,
            rateOverride: null,
            rateLocked: false,
          }
        ],
      },
    }));
  };

  // const updateGemstone = (index, field, value) => {
  //   const updatedGemstones = [...form.productSnapshot.gemstones];
  //   updatedGemstones[index] = {
  //     ...updatedGemstones[index],
  //     [field]: value,
  //   };

  const updateGemstone = (index, field, value) => {
    const updatedGemstones = [...form.productSnapshot.gemstones];

    updatedGemstones[index] = {
      ...updatedGemstones[index],
      [field]:
        field === "grossWeight" || field === "count"
          ? (value === "" ? "" : Number(value))
          : value,
    };

    // 🔥 SAME LOGIC AS PRODUCT FORM
    if (field === "grossWeight" || field === "count") {
      const grossWeight = Number(updatedGemstones[index].grossWeight) || 0;
      const count = Number(updatedGemstones[index].count) || 0;

      updatedGemstones[index].weight =
        count > 0 ? grossWeight / count : 0;
    }

    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        gemstones: updatedGemstones,
      },
    }));
  };

  //   setForm((prev) => ({
  //     ...prev,
  //     productSnapshot: {
  //       ...prev.productSnapshot,
  //       gemstones: updatedGemstones,
  //     },
  //   }));
  // };

  const removeGemstone = (index) => {
    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        gemstones: prev.productSnapshot.gemstones.filter((_, i) => i !== index),
      },
    }));
  };

  /* ================= BELT HANDLERS ================= */
  const addBelt = () => {
    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        belts: [
          ...(prev.productSnapshot.belts || []),
          {
            category: "Belt",
            material: "",
            color: "",
            size: "",
            count: 1,
            rateOverride: null,
            rateLocked: false,
          }
        ],
      },
    }));
  };

  const updateBelt = (index, field, value) => {
    const updatedBelts = [...form.productSnapshot.belts];
    updatedBelts[index] = {
      ...updatedBelts[index],
      [field]: field === "count" || field === "rateOverride"
        ? (value === "" ? "" : Number(value))
        : value,
    };

    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        belts: updatedBelts,
      },
    }));
  };

  const removeBelt = (index) => {
    setForm((prev) => ({
      ...prev,
      productSnapshot: {
        ...prev.productSnapshot,
        belts: prev.productSnapshot.belts.filter((_, i) => i !== index),
      },
    }));
  };


  /* ================= METAL PAYMENT HANDLERS ================= */
  // const handleMetalPaymentChange = (field, value) => {
  //   setForm((prev) => ({
  //     ...prev,
  //     metalPayment: prev.metalPayment ? {
  //       ...prev.metalPayment,
  //       [field]: value
  //     } : {
  //       metalType: form.productSnapshot.metalType,
  //       purity: form.productSnapshot.metalPurity,
  //       weight: 0,
  //       baseRate: 0,
  //       purityFactor: PURITY_MAP[form.productSnapshot.metalPurity] || 1,
  //       ratePerGram: 0,
  //       totalValue: 0,
  //       receivedAt: new Date(),
  //     }
  //   }));
  // };


  const handleMetalPaymentChange = (field, value) => {
    setForm((prev) => {
      const current = prev.metalPayment || {
        metalType: form.productSnapshot.metalType,
        purity: form.productSnapshot.metalPurity,
        weight: 0,
        receivedAt: new Date(),
      };

      const updated = {
        ...current,
        [field]: value,
      };

      if (rates) {
        const ratePerGram = rates.helpers.getMetalRate(
          updated.metalType,
          updated.purity
        );

        const purityFactor = rates.helpers.getPurityFactor(
          updated.metalType,
          updated.purity
        );

        const totalValue =
          (ratePerGram || 0) * (updated.weight || 0);

        updated.ratePerGram = ratePerGram;
        updated.purityFactor = purityFactor;
        updated.totalValue = Number(totalValue.toFixed(2));
      }

      return {
        ...prev,
        metalPayment: updated,
      };
    });
  };

  const calculateDiamondValue = () => {
    if (!rates) return "0.00";

    const total = form.productSnapshot.diamonds.reduce((sum, d) => {
      if (!d.weight || !d.count) return sum;

      const overrideVal = parseFloat(d.rateOverride);
      let rate = overrideVal;
      if (isNaN(rate)) {
        const matchedRate = findMatchingDiamondRate(d, adminDiamondRates);
        rate = matchedRate !== null ? matchedRate : parseFloat(rates?.components?.diamond || 0);
      }

      return sum + (rate * parseFloat(d.weight) * parseFloat(d.count));
    }, 0);

    return total.toFixed(2);
  };

  const calculateStoneValue = () => {
    if (!rates) return "0.00";

    const total = form.productSnapshot.gemstones.reduce((sum, g) => {
      if (!g.weight || !g.count) return sum;

      const overrideVal = parseFloat(g.rateOverride);
      let rate = overrideVal;
      if (isNaN(rate)) {
        // Map gemstone name to type since findMatchingStoneRate expects type
        const matchedRate = findMatchingStoneRate({ ...g, type: g.name }, adminStoneRates);
        rate = matchedRate !== null ? matchedRate : parseFloat(rates?.components?.stone || 0);
      }

      return sum + (rate * parseFloat(g.weight) * parseFloat(g.count));
    }, 0);

    return total.toFixed(2);
  };

  const calculateBeltValue = () => {
    if (!rates) return "0.00";

    const total = (form.productSnapshot.belts || []).reduce((sum, b) => {
      if (!b.count) return sum;

      const overrideVal = parseFloat(b.rateOverride);
      let rate = overrideVal || 0; // Default to 0 for belts if no override, as they are custom accessories

      return sum + (rate * parseFloat(b.count));
    }, 0);

    return total.toFixed(2);
  };

  const calculateTotalComponents = () => {
    return (
      Number(calculateDiamondValue()) +
      Number(calculateStoneValue()) +
      Number(calculateBeltValue())
    ).toFixed(2);
  };


  const buildComponents = () => {
    const components = [];

    form.productSnapshot.diamonds.forEach((d) => {
      if (!d.weight || !d.count) return;

      components.push({
        type: "Diamond",
        componentRole: "MAIN",
        shape: d.shape || "",
        clarity: d.clarity || "",
        color: d.color || "",
        weight: d.weight,
        grossWeight: d.grossWeight,
        size: d.size,
        count: d.count,
        pricingRef: "DIAMOND",
        rateOverride: d.rateOverride ?? undefined,
      });
    });

    form.productSnapshot.gemstones.forEach((g) => {
      if (!g.weight || !g.count) return;

      components.push({
        type: g.name,
        componentRole: "SIDE",
        shape: g.shape || "",
        weight: g.weight,
        count: g.count,
        grossWeight: g.grossWeight,
        pricingRef: "STONE",
        rateOverride: g.rateOverride ?? undefined,
      });
    });

    (form.productSnapshot.belts || []).forEach((b) => {
      if (!b.count) return;

      components.push({
        type: "Accessory",
        componentRole: "SIDE",
        shape: b.color || "", 
        category: b.category || "Belt", 
        description: b.material || "", // Store material in description or keep as is
        size: b.size || "",
        count: b.count,
        pricingRef: "BELT",
        rateOverride: b.rateOverride ?? undefined,
      });
    });

    return components;
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    try {
      if (!form.productSnapshot.netWeight) {
        //   alert("Net metal weight is required");
        showAlert("Net metal weight is required");
        return;
      }

      const fd = new FormData();

      fd.append("customer[name]", form.customer.name);
      fd.append("customer[mobile]", form.customer.mobile);
      if (form.customer.email) fd.append("customer[email]", form.customer.email);
      if (form.customer.address) fd.append("customer[address]", form.customer.address);
      if (form.customer.city) fd.append("customer[city]", form.customer.city);

      fd.append("productSnapshot[title]", form.productSnapshot.title || "Custom Order");
      fd.append("productSnapshot[jewelleryCategory]", form.productSnapshot.jewelleryCategory || "");
      fd.append("productSnapshot[description]", form.productSnapshot.description || "");
      fd.append("productSnapshot[size]", form.productSnapshot.size || "");
      fd.append("productSnapshot[metalType]", form.productSnapshot.metalType);
      fd.append("productSnapshot[metalPurity]", form.productSnapshot.metalPurity);
      fd.append("productSnapshot[metalColor]", form.productSnapshot.metalColor);
      fd.append("productSnapshot[netWeight]", form.productSnapshot.netWeight);
      fd.append("productSnapshot[grossWeight]", form.productSnapshot.grossWeight);

      // IMAGES (MULTIPLE)
      // form.productSnapshot.productImages?.forEach((img) => {
      //   if (img instanceof File) {
      //     fd.append("productImages", img);
      //   } else if (typeof img === "string") {
      //     // agar existing image URL/path ho
      //     fd.append("productSnapshot[productImages][]", img);
      //   }
      // });

      form.productSnapshot.productImages.forEach((img) => {
        if (img instanceof File) {
          fd.append("productImages", img); // multer field
        } else {
          fd.append("productSnapshot[productImages][]", img); // existing image
        }
      });

      if (form.metalPayment) {
        fd.append("metalPayment[metalType]", form.metalPayment.metalType);
        fd.append("metalPayment[purity]", form.metalPayment.purity);
        fd.append("metalPayment[weight]", form.metalPayment.weight);
        fd.append("metalPayment[baseRate]", form.metalPayment.baseRate || 0);
        fd.append("metalPayment[purityFactor]", form.metalPayment.purityFactor || 1);
        fd.append("metalPayment[ratePerGram]", form.metalPayment.ratePerGram || 0);
        fd.append("metalPayment[totalValue]", form.metalPayment.totalValue || 0);
        fd.append("metalPayment[receivedAt]", form.metalPayment.receivedAt);
      }

      const components = buildComponents();
      components.forEach((c, index) => {
        fd.append(`productSnapshot[components][${index}][type]`, c.type);
        fd.append(`productSnapshot[components][${index}][componentRole]`, c.componentRole);
        fd.append(`productSnapshot[components][${index}][shape]`, c.shape || "");
        if (c.clarity) {
          fd.append(`productSnapshot[components][${index}][clarity]`, c.clarity);
        }
        if (c.color) {
          fd.append(`productSnapshot[components][${index}][color]`, c.color);
        }
        fd.append(`productSnapshot[components][${index}][grossWeight]`, c.grossWeight || 0);
        // fd.append(`productSnapshot[components][${index}][size]`, c.size || 0);

        if (c.size !== undefined && c.size !== null && c.size !== "") {
          fd.append(`productSnapshot[components][${index}][size]`, c.size);
        } else {
          fd.append(`productSnapshot[components][${index}][size]`, "");
        }


        fd.append(`productSnapshot[components][${index}][weight]`, c.weight || 0);
        fd.append(`productSnapshot[components][${index}][count]`, c.count);
        fd.append(`productSnapshot[components][${index}][pricingRef]`, c.pricingRef);
        if (c.category) {
          fd.append(`productSnapshot[components][${index}][category]`, c.category);
        }
        if (c.rateOverride !== undefined) {
          fd.append(`productSnapshot[components][${index}][rateOverride]`, c.rateOverride);
        }
      });

      if (form.advancePayment.amount > 0) {
        fd.append("advancePayment[amount]", form.advancePayment.amount);
        fd.append("advancePayment[mode]", form.advancePayment.mode);
        if (form.advancePayment.transactionId) {
          fd.append("advancePayment[transactionId]", form.advancePayment.transactionId);
        }
      }

      if (form.expectedDeliveryDate) {
        fd.append("expectedDeliveryDate", form.expectedDeliveryDate);
      }
      fd.append("status", form.status);

      let res;
      if (initialOrder?._id) {
        res = await updateOrderById(initialOrder._id, fd);
        await showAlert("Order updated successfully!");
      } else {
        res = await createOrder(fd);
        await showAlert("Order created successfully!");
      }

      // If converted from estimate, mark estimate as converted
      if (convertedFromEstimateId) {
        try {
          await updateEstimate(convertedFromEstimateId, { status: "CONVERTED" });
        } catch (estErr) {
          console.error("Failed to mark estimate as converted", estErr);
          // Don't fail the whole process if only estimate update fails
        }
      }

      onSuccess?.(res.data.order._id);
    } catch (err) {
      console.error("Order Submit Error Detail:", err.response?.data);
      const serverError = err.response?.data?.error || err.response?.data?.message;
      const errorMsg = serverError || (initialOrder?._id ? "Failed to update order" : "Failed to create order");

      await showAlert(errorMsg);
    }
  };

  /* ================= CALCULATE TOTAL METAL VALUE ================= */

  const calculateMetalValue = () => {
    if (!rates) return 0;

    const { metalType, metalPurity, netWeight } = form.productSnapshot;

    if (!metalType || !metalPurity || !netWeight) return 0;

    const ratePerGram = rates.helpers.getMetalRate(
      metalType,
      metalPurity
    );

    return (ratePerGram * netWeight).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[#F5F3F0] py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-[#6B2E4A] text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            {initialOrder?._id ? `Edit Order #${initialOrder.orderNo}` : "Create New Order"}
          </h1>
          {initialOrder?._id && (
            <span className="text-[10px] bg-white/20 px-2 py-1 rounded uppercase tracking-widest font-bold">
              Editing Mode
            </span>
          )}
        </div>

        <div className="bg-white shadow-sm">
          <div className="grid lg:grid-cols-3 gap-6 p-6">

            {/* LEFT COLUMN - Product Reference & Customer */}
            <div className="lg:col-span-2 space-y-6">

              {/* Product Reference */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                  <h2 className="text-base font-semibold text-gray-800">Product Reference</h2>
                </div>


                <div className="mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                    {/* ADD IMAGE BUTTON */}
                    <button
                      type="button"
                      onClick={() => setShowOptions(true)}
                      className="group relative h-24 rounded-xl 
             
             /* GLASS BASE */
             bg-white/30 backdrop-blur-md
             border border-white/40

             /* LAYOUT */
             flex flex-col items-center justify-center gap-1
             text-[#6B2E4A] text-xs font-semibold

             /* NEUMORPHISM */
             shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.9)]

             /* TRANSITION */
             transition-all duration-300 ease-out

             /* DESKTOP */
             hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)]
             hover:scale-[1.02]

             /* 📱 MOBILE / TABLET */
             active:scale-95 active:shadow-inner"
                    >

                      {/* ✨ GLASS SHINE */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br 
                  from-white/40 via-transparent to-white/10 
                  opacity-60 pointer-events-none" />

                      {/* ICON */}
                      <Camera
                        className="relative z-10 transition-transform duration-300 
               group-hover:scale-110 group-active:scale-95"
                      />

                      {/* TEXT */}
                      <span className="relative z-10">Add Image</span>

                      {/* 🔥 UNDERLINE (ALL DEVICES) */}
                      <div
                        className="absolute bottom-0 left-0 h-[2px] w-0 
               bg-gradient-to-r from-[#6B2E4A] via-[#a46a86] to-[#6B2E4A]
               transition-all duration-500 ease-out
               group-hover:w-full group-active:w-full"
                      />

                    </button>

                    {/* IMAGES */}
                    {form.productSnapshot.productImages.map((img, i) => (
                      <div
                        key={i}
                        className="relative group rounded-lg overflow-hidden 
                   border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                      >
                        <img
                          src={getImageUrl(img)}
                          className="w-full h-28 object-cover cursor-pointer"
                          alt="preview"
                          onClick={() => setPreviewImage(getImageUrl(img))}
                        />

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-[#632947] text-white 
w-7 h-7 rounded-full text-xs flex items-center justify-center print:hidden active:scale-90"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                  </div>
                </div>

                {previewImage && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">

                    {/* CLOSE BUTTON */}
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-6 right-6 text-white text-xl 
                 bg-white/10 rounded-full w-10 h-10 
                 flex items-center justify-center hover:bg-white/20"
                    >
                      ✕
                    </button>

                    {/* IMAGE */}
                    <img
                      src={previewImage}
                      alt="Full Preview"
                      className="max-w-[90%] max-h-[80%] object-contain rounded-lg shadow-2xl"
                    />

                    {/* OPTIONAL TITLE */}
                    <p className="text-white/70 mt-4 text-sm italic">
                      Product Image Preview
                    </p>

                  </div>
                )}

                {showCamera && (
                  <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">

                    {/* HEADER */}
                    <div className="flex justify-between items-center p-4 text-white">
                      <span>Camera</span>

                    </div>

                    {/* CAMERA */}
                    <div className="flex-1 flex items-center justify-center">
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full max-w-md rounded"
                        videoConstraints={{ facingMode: "environment" }}
                      />
                    </div>


                    {/* BUTTON */}
                    <div className="p-6 flex justify-center">
                      <button className="bg-red text-white p-6" onClick={() => setShowCamera(false)}>Close</button>
                      <button
                        onClick={captureFromCamera}
                        className="w-16 h-16 bg-white rounded-full"
                      />
                    </div>


                  </div>
                )}


                {showOptions && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white rounded-xl p-6 w-72 space-y-4">

                      <h3 className="text-sm font-semibold text-center">Select Option</h3>

                      {/* CAMERA */}
                      <button
                        onClick={() => {
                          setShowOptions(false);
                          setShowCamera(true);
                        }}
                        className="w-full py-2 bg-[#6B2E4A] text-white rounded"
                      >
                        Open Camera
                      </button>

                      {/* UPLOAD */}
                      <label className="block w-full text-center py-2 border rounded cursor-pointer">
                        Upload Image
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            handleImageUpload(e);
                            setShowOptions(false);
                          }}
                        />
                      </label>

                      {/* CANCEL */}
                      <button
                        onClick={() => setShowOptions(false)}
                        className="w-full py-2 text-red-500"
                      >
                        Cancel
                      </button>

                    </div>
                  </div>
                )}

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Title</label>
                    <input
                      placeholder="Floral Diamond Bracelet"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.productSnapshot.title}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          productSnapshot: { ...form.productSnapshot, title: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Category</label>
                      <input
                        placeholder="Bracelet"
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                        value={form.productSnapshot.jewelleryCategory}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            productSnapshot: { ...form.productSnapshot, jewelleryCategory: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Size</label>
                      <input
                        placeholder="6.5 inches"
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                        value={form.productSnapshot.size}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            productSnapshot: { ...form.productSnapshot, size: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      placeholder="Product description..."
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm resize-none"
                      rows={2}
                      value={form.productSnapshot.description || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          productSnapshot: { ...form.productSnapshot, description: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Metal Specifications */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                  <h2 className="text-base font-semibold text-gray-800">Metal Specifications</h2>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Metal</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.productSnapshot.metalType}
                      onChange={(e) => {
                        const metalType = e.target.value;
                        setForm({
                          ...form,
                          productSnapshot: {
                            ...form.productSnapshot,
                            metalType,
                            metalPurity: "",
                            metalColor: "",
                          },
                        });
                      }}
                    >
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Purity</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.productSnapshot.metalPurity}
                      onChange={(e) => {
                        const purity = e.target.value;
                        setForm({
                          ...form,
                          productSnapshot: { ...form.productSnapshot, metalPurity: purity },
                        });
                      }}
                    >
                      <option value="">Select</option>
                      {(METAL_OPTIONS[form.productSnapshot.metalType]?.purities || []).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Color</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.productSnapshot.metalColor}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          productSnapshot: { ...form.productSnapshot, metalColor: e.target.value },
                        })
                      }
                    >
                      <option value="">Select</option>
                      {(METAL_OPTIONS[form.productSnapshot.metalType]?.colors || []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">EST. Metal Weight (g)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={form.productSnapshot.netWeight || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          productSnapshot: {
                            ...form.productSnapshot,
                            netWeight: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                    />
                  </div>

                </div>
              </div>


              {/* Diamonds */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                    <h2 className="text-base font-semibold text-gray-800">Diamonds</h2>
                  </div>

                </div>

                {form.productSnapshot.diamonds.map((diamond, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Diamond {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeDiamond(index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 items-end">

                      {/* Shape */}
                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Shape</label>
                        <select
                          className="h-9 px-2 border border-gray-300 rounded text-xs bg-white"
                          value={diamond.shape}
                          onChange={(e) => updateDiamond(index, "shape", e.target.value)}
                        >
                          <option value="">Select</option>
                          {SHAPE_OPTIONS.map(shape => (
                            <option key={shape} value={shape}>{shape}</option>
                          ))}
                        </select>
                      </div>

                      {/* Clarity */}
                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Clarity</label>
                        <select
                          className="h-9 px-2 border border-gray-300 rounded text-xs bg-white"
                          value={diamond.clarity}
                          onChange={(e) => updateDiamond(index, "clarity", e.target.value)}
                        >
                          <option value="">Select</option>
                          {CLARITY_OPTIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Color */}
                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Color</label>
                        <select
                          className="h-9 px-2 border border-gray-300 rounded text-xs bg-white"
                          value={diamond.color}
                          onChange={(e) => updateDiamond(index, "color", e.target.value)}
                        >
                          <option value="">Select</option>
                          {COLOR_OPTIONS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {/* Size */}
                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Size</label>
                        <input
                          type="text"
                          className="h-9 px-2 border border-gray-300 rounded text-xs"
                          value={diamond.size || ""}
                          onChange={(e) => updateDiamond(index, "size", e.target.value)}
                        />
                      </div>

                      {/* Gross Weight */}
                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Est. Total (ct)</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="h-9 px-2 border border-gray-300 rounded text-xs"
                          value={diamond.grossWeight || ""}
                          onChange={(e) => updateDiamond(index, "grossWeight", parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      {/* Count */}
                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Count / Pcs</label>
                        <input
                          type="number"
                          min="0"
                          className="h-9 px-2 border border-gray-300 rounded text-xs"
                          //value={diamond.count}
                          value={diamond.count === 0 ? "" : diamond.count}
                          onChange={(e) => updateDiamond(index, "count", parseInt(e.target.value) || 0)}
                        />
                      </div>


                      {/* Net Weight */}
                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Est. Net (ct)</label>
                        <input
                          type="number"
                          readOnly
                          className="h-9 px-2 border border-gray-300 rounded text-xs bg-gray-100"
                          value={diamond.weight}
                        />
                      </div>


                      {/* Rate Override */}
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] text-gray-600">Rate Override</label>

                          <button
                            type="button"
                            className={`text-[10px] px-1 ${diamond.rateLocked ? "text-green-600" : "text-gray-500"
                              }`}
                            onClick={() => updateDiamond(index, "rateLocked", !diamond.rateLocked)}
                          >
                            {diamond.rateLocked ? "🔓" : "🔒"}
                          </button>
                        </div>

                        <input
                          type="number"
                          step="0.01"
                          disabled={!diamond.rateLocked}
                          className={`h-9 px-2 border rounded text-xs ${diamond.rateLocked
                            ? "border-gray-300 bg-white"
                            : "border-gray-200 bg-gray-100"
                            }`}
                          value={diamond.rateOverride || ""}
                          min="0"
                          onChange={(e) => updateDiamond(index, "rateOverride", parseFloat(e.target.value) || null)}
                        />
                      </div>

                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDiamond}
                  className="px-3 py-1.5 text-xs bg-[#6B2E4A] text-white rounded-md hover:bg-[#5A2640] transition-colors"
                >
                  + Add
                </button>

              </div>

              {/* Precious Gemstones */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                    <h2 className="text-base font-semibold text-gray-800">Precious Gemstones</h2>
                  </div>
                  {/* <button
                    type="button"
                    onClick={addGemstone}
                    className="px-3 py-1.5 text-xs bg-[#6B2E4A] text-white rounded-md hover:bg-[#5A2640] transition-colors"
                  >
                    + Add
                  </button> */}
                </div>

                {form.productSnapshot.gemstones.map((gemstone, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Gemstone {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeGemstone(index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Name</label>
                        <select
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                          value={gemstone.name}
                          onChange={(e) => updateGemstone(index, "name", e.target.value)}
                        >
                          {STONE_OPTIONS.filter(stone => stone !== "diamond").map(stone => (
                            <option key={stone} value={stone.charAt(0).toUpperCase() + stone.slice(1)}>
                              {stone.charAt(0).toUpperCase() + stone.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Shape</label>
                        <select
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                          value={gemstone.shape}
                          onChange={(e) => updateGemstone(index, "shape", e.target.value)}
                        >
                          <option value="">Select</option>
                          {SHAPE_OPTIONS.map(shape => (
                            <option key={shape} value={shape}>{shape}</option>
                          ))}
                        </select>
                      </div>

                      {/* <div>
                        <label className="block text-xs text-gray-600 mb-1">Est. weight (ct)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                          
                          value={gemstone.weight === 0 ? "" : gemstone.weight}
                          onChange={(e) => updateGemstone(index, "weight", parseFloat(e.target.value) || 0)}
                        />
                      </div> */}

                      {/* Gross Weight */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Est. Total (ct)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                          value={gemstone.grossWeight || ""}
                          onChange={(e) =>
                            updateGemstone(index, "grossWeight", e.target.value)
                          }
                        />
                      </div>

                      {/* Net Weight (Auto) */}
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Est. Net (ct)
                        </label>
                        <input
                          type="number"
                          readOnly
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-gray-100"
                          value={gemstone.weight || 0}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Count</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                          value={gemstone.count === 0 ? "" : gemstone.count}
                          onChange={(e) => updateGemstone(index, "count", parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1 flex items-center justify-between">
                          Rate Override
                          <button
                            type="button"
                            className="text-xs text-blue-600"
                            onClick={() => updateGemstone(index, "rateLocked", !gemstone.rateLocked)}
                          >
                            {gemstone.rateLocked ? "🔓 Unlock" : "🔒 Lock"}
                          </button>
                        </label>

                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!gemstone.rateLocked}
                          className={`w-full px-2 py-1.5 border rounded text-xs ${gemstone.rateLocked ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-100"
                            }`}
                          placeholder="Optional"
                          value={gemstone.rateOverride || ""}
                          onChange={(e) =>
                            updateGemstone(index, "rateOverride", parseFloat(e.target.value) || null)
                          }
                        />
                      </div>

                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addGemstone}
                  className="px-3 py-1.5 text-xs bg-[#6B2E4A] text-white rounded-md hover:bg-[#5A2640] transition-colors"
                >
                  + Add
                </button>
              </div>

              {/* Belts */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                    <h2 className="text-base font-semibold text-gray-800">Accessories</h2>
                  </div>
                </div>

                {(form.productSnapshot.belts || []).map((belt, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Accessory {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeBelt(index)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Category</label>
                        <select
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                          value={belt.category || "Belt"}
                          onChange={(e) => updateBelt(index, "category", e.target.value)}
                        >
                          {ACCESSORY_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Material</label>
                        <input
                          type="text"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                          value={belt.material}
                          onChange={(e) => updateBelt(index, "material", e.target.value)}
                          placeholder="e.g. Leather"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Color</label>
                        <input
                          type="text"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                          value={belt.color}
                          onChange={(e) => updateBelt(index, "color", e.target.value)}
                          placeholder="e.g. Black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Size</label>
                        <input
                          type="text"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                          value={belt.size}
                          onChange={(e) => updateBelt(index, "size", e.target.value)}
                          placeholder="e.g. 42mm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Qty</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                          value={belt.count === 0 ? "" : belt.count}
                          onChange={(e) => updateBelt(index, "count", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1 flex items-center justify-between">
                          Rate (₹)
                          <button
                            type="button"
                            className="text-xs text-blue-600"
                            onClick={() => updateBelt(index, "rateLocked", !belt.rateLocked)}
                          >
                            {belt.rateLocked ? "🔓" : "🔒"}
                          </button>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!belt.rateLocked}
                          className={`w-full px-2 py-1.5 border rounded text-xs ${belt.rateLocked ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-100"}`}
                          value={belt.rateOverride || ""}
                          onChange={(e) => updateBelt(index, "rateOverride", e.target.value)}
                          placeholder="Rate"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addBelt}
                  className="px-3 py-1.5 text-xs bg-[#6B2E4A] text-white rounded-md hover:bg-[#5A2640] transition-colors"
                >
                  + Add Accessory
                </button>
              </div>

              {/* Payment Details */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                  <h2 className="text-base font-semibold text-gray-800">Payment Details</h2>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Advance Amount</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      placeholder="0.00"
                      min="0"
                      value={form.advancePayment.amount || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          advancePayment: {
                            ...form.advancePayment,
                            amount: parseFloat(e.target.value) || 0
                          },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Payment Mode</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.advancePayment.mode}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          advancePayment: {
                            ...form.advancePayment,
                            mode: e.target.value
                          },
                        })
                      }
                    >
                      {PAYMENT_MODES.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Refrence No</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      placeholder="Optional"
                      value={form.advancePayment.transactionId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          advancePayment: {
                            ...form.advancePayment,
                            transactionId: e.target.value
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.metalPayment}
                      // onChange={(e) => {
                      //   if (e.target.checked) {
                      //     setForm({
                      //       ...form,
                      //       metalPayment: {
                      //         metalType: form.productSnapshot.metalType,
                      //         purity: form.productSnapshot.metalPurity,
                      //         weight: 0,
                      //         baseRate: 0,
                      //         purityFactor: PURITY_MAP[form.productSnapshot.metalPurity] || 1,
                      //         ratePerGram: 0,
                      //         totalValue: 0,
                      //         receivedAt: new Date(),
                      //       }
                      //     });
                      //   } else {
                      //     setForm({ ...form, metalPayment: null });
                      //   }


                      onChange={(e) => {
                        if (e.target.checked) {

                          const metalType = form.productSnapshot.metalType;
                          const purity = form.productSnapshot.metalPurity;

                          const ratePerGram = rates?.helpers.getMetalRate(metalType, purity) || 0;
                          const purityFactor = rates?.helpers.getPurityFactor(metalType, purity) || 1;

                          setForm({
                            ...form,
                            metalPayment: {
                              metalType,
                              purity,
                              weight: 0,
                              baseRate: ratePerGram,
                              purityFactor,
                              ratePerGram,
                              totalValue: 0,
                              receivedAt: new Date(),
                            }
                          });

                        } else {
                          setForm({ ...form, metalPayment: null });
                        }

                      }}
                      className="w-4 h-4 text-[#6B2E4A]"
                    />
                    <span className="text-sm text-gray-700">Customer providing metal</span>
                  </label>

                  {form.metalPayment && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Metal Weight (g)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                            value={form.metalPayment.weight || ""}
                            onChange={(e) => handleMetalPaymentChange("weight", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Metal Type</label>
                          <select
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
                            value={form.metalPayment.metalType}
                            onChange={(e) => handleMetalPaymentChange("metalType", e.target.value)}
                          >
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Platinum">Platinum</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Purity</label>
                          <select
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
                            value={form.metalPayment.purity}
                            onChange={(e) => handleMetalPaymentChange("purity", e.target.value)}
                          >
                            {METAL_OPTIONS[form.metalPayment.metalType]?.purities.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Handling & Status */}
              {/* <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                  <h2 className="text-base font-semibold text-gray-800">Handling & Status</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Expected Delivery Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.expectedDeliveryDate}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          expectedDeliveryDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Order Status</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="Placed">Placed</option>
                      <option value="Received">Received</option>
                      <option value="In-Process">In-Process</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div> */}

            </div>

            {/* RIGHT COLUMN - Customer Profile */}
            <div className="space-y-6">

              {/* Customer Profile */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                  <h2 className="text-base font-semibold text-gray-800">Customer Profile</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Customer Name</label>
                    <input
                      placeholder="Mr. M. Gold Avenue, Indore"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.customer.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customer: { ...form.customer, name: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Mobile Number</label>
                    <input
                      placeholder="+91 98xxxxxxxx"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.customer.mobile}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customer: { ...form.customer, mobile: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      placeholder="customer@email.com"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.customer.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customer: { ...form.customer, email: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                    <input
                      placeholder="Indore"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={form.customer.city}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customer: { ...form.customer, city: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Address</label>
                    <textarea
                      placeholder="Full address"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm resize-none"
                      rows={3}
                      value={form.customer.address || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customer: { ...form.customer, address: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#6B2E4A] text-white rounded-lg p-5 sticky top-6">
                <h3 className="text-base font-semibold mb-4">Order Summary</h3>

                <div className="space-y-2 text-sm mb-4 pb-4 border-b border-white/20">
                  <div className="flex justify-between">
                    <span className="text-white/80">Metal Value:</span>
                    <span className="font-medium">₹ {calculateMetalValue()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/80">Diamond Value:</span>
                    <span className="font-medium">₹ {calculateDiamondValue()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Stone Value:</span>
                    <span className="font-medium">₹ {calculateStoneValue()}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
                    <span className="text-white font-semibold">Components Total:</span>
                    <span className="font-semibold">₹ {calculateTotalComponents()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-white/80">Advance Received:</span>
                    <span className="font-medium">₹ {form.advancePayment.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between text-white/70">
                    <span>Metal Type:</span>
                    <span>{form.productSnapshot.metalType}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Purity:</span>
                    <span>{form.productSnapshot.metalPurity}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>Net Weight:</span>
                    <span>{form.productSnapshot.netWeight}g</span>
                  </div>
                </div>

                <button
                  onClick={submit}
                  className="w-full bg-[#C5A859] hover:bg-[#C19B2B] text-white font-semibold py-3 rounded-md transition-colors text-sm"
                >
                  CREATE ORDER NOW
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
