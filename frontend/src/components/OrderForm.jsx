import { useEffect, useState } from "react";
import { createOrder, updateOrderById, getOrdersByCustomerMobile } from "../api/orderApi";
import { updateEstimate } from "../api/quotationApi";
import { useLocation } from "react-router-dom";
import { getImageUrl } from "../utils/getImageUrl";
import { useRates } from "../context/RatesContext";
import { useModal } from "../context/ModalContext";
import { Camera, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import Webcam from "react-webcam";
import { useRef } from "react";
import { getDiamondRates } from "../api/diamondRateApi";
import { getStoneRates } from "../api/stoneRateApi";
import { findMatchingDiamondRate, findMatchingStoneRate } from "../utils/rateMatchUtils";

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
    productSnapshots: [
      {
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
        productImages: [],
        advancePayment: {
          amount: 0,
          mode: "CASH",
          transactionId: "",
        },
        metalPayment: null,
      }
    ],
    status: "Placed",
    expectedDeliveryDate: "",
  });

  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const { rates } = useRates();
  const { showAlert, showConfirm } = useModal();
  const [previewImage, setPreviewImage] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);

  // Customer lookup state
  const [customerLookup, setCustomerLookup] = useState({
    loading: false,
    orders: [],
    found: false,
  });

  const [adminDiamondRates, setAdminDiamondRates] = useState([]);
  const [adminStoneRates, setAdminStoneRates] = useState([]);

  const currentSnapshot = form.productSnapshots[activeItemIndex] || {};

  useEffect(() => {
    getDiamondRates()
      .then((res) => { if (res.data?.success) setAdminDiamondRates(res.data.rates); })
      .catch((err) => console.error("Failed to load diamond rates", err));
    getStoneRates()
      .then((res) => { if (res.data?.success) setAdminStoneRates(res.data.rates); })
      .catch((err) => console.error("Failed to load stone rates", err));
  }, []);

  // Auto-lookup customer by mobile number
  useEffect(() => {
    const mobile = form.customer.mobile?.trim();
    if (!mobile || mobile.length < 10) {
      setCustomerLookup({ loading: false, orders: [], found: false });
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setCustomerLookup(prev => ({ ...prev, loading: true }));
      try {
        const res = await getOrdersByCustomerMobile(mobile);
        if (cancelled) return;

        const { orders, customer } = res.data;
        setCustomerLookup({ loading: false, orders: orders || [], found: !!customer });

        // Auto-fill customer details if not editing (fresh form) and customer found
        if (!initialOrder?._id && customer && orders.length > 0) {
          setForm(prev => ({
            ...prev,
            customer: {
              ...prev.customer,
              name: prev.customer.name || customer.name || "",
              email: prev.customer.email || customer.email || "",
              city: prev.customer.city || customer.city || "",
              address: prev.customer.address || customer.address || "",
            }
          }));
        }
      } catch {
        if (!cancelled) setCustomerLookup({ loading: false, orders: [], found: false });
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.customer.mobile]);

  const location = useLocation();
  const initialProduct = propInitialProduct || location.state?.initialProduct || location.state?.product || null;
  const initialProducts = location.state?.initialProducts || null;
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
    if (initialProducts && Array.isArray(initialProducts) && initialProducts.length > 0) {
      const snapshots = initialProducts.map(item => {
        const diamonds = [];
        const gemstones = [];
        const belts = [];

        (item.components || []).forEach(c => {
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

        return {
          title: item.title || "",
          jewelleryCategory: item.jewelleryCategory || "",
          description: item.description || "",
          metalType: item.metalType || "Gold",
          metalPurity: item.metalPurity || "22KT",
          metalColor: item.metalColor || "yellow-gold",
          netWeight: Number(item.netWeight) || 0,
          grossWeight: Number(item.grossWeight) || 0,
          diamonds,
          gemstones,
          belts,
          productImages: (item.images || []).map(img => getImageUrl(img)),
          advancePayment: {
            amount: 0,
            mode: "CASH",
            transactionId: "",
          },
          metalPayment: null,
        };
      });

      setForm(prev => ({
        ...prev,
        productSnapshots: snapshots,
      }));
      setActiveItemIndex(0);
    } else if (initialProduct) {
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
        productSnapshots: [
          {
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
            productImages: (initialProduct.images || []).map(img => getImageUrl(img)),
            advancePayment: {
              amount: 0,
              mode: "CASH",
              transactionId: "",
            },
            metalPayment: null,
          }
        ],
      }));
      setActiveItemIndex(0);
    }
  }, [initialProduct, initialProducts]);

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
      productSnapshots: [
        {
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
          advancePayment: {
            amount: initialOrder.advancePayment?.amount || 0,
            mode: initialOrder.advancePayment?.mode || "CASH",
            transactionId: initialOrder.advancePayment?.transactionId || "",
          },
          metalPayment: initialOrder.metalPayment ? { ...initialOrder.metalPayment } : null,
        }
      ],
      status: initialOrder.status || "Placed",
      expectedDeliveryDate: initialOrder.expectedDeliveryDate ? new Date(initialOrder.expectedDeliveryDate).toISOString().split('T')[0] : "",
    });
    setActiveItemIndex(0);
  }, [initialOrder]);

  const captureFromCamera = () => {
    const imageSrc = webcamRef.current.getScreenshot();

    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera.jpg", { type: "image/jpeg" });

        setForm(prev => {
          const updated = [...prev.productSnapshots];
          updated[activeItemIndex] = {
            ...updated[activeItemIndex],
            productImages: [
              ...(updated[activeItemIndex].productImages || []),
              file
            ]
          };
          return { ...prev, productSnapshots: updated };
        });
      });

    setShowCamera(false);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);

    setForm(prev => {
      const updated = [...prev.productSnapshots];
      updated[activeItemIndex] = {
        ...updated[activeItemIndex],
        productImages: [
          ...(updated[activeItemIndex].productImages || []),
          ...files
        ]
      };
      return { ...prev, productSnapshots: updated };
    });
  };

  const removeImage = (indexToRemove) => {
    setForm((prev) => {
      const updated = [...prev.productSnapshots];
      updated[activeItemIndex] = {
        ...updated[activeItemIndex],
        productImages: (updated[activeItemIndex].productImages || []).filter(
          (_, index) => index !== indexToRemove
        ),
      };
      return { ...prev, productSnapshots: updated };
    });
  };

  const updateSnapshotField = (field, value) => {
    setForm((prev) => {
      const updated = [...prev.productSnapshots];
      updated[activeItemIndex] = {
        ...updated[activeItemIndex],
        [field]: value
      };
      return { ...prev, productSnapshots: updated };
    });
  };

  /* ================= DIAMOND HANDLERS ================= */
  const addDiamond = () => {
    setForm((prev) => {
      const updated = [...prev.productSnapshots];
      updated[activeItemIndex] = {
        ...updated[activeItemIndex],
        diamonds: [
          ...(updated[activeItemIndex].diamonds || []),
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
      };
      return { ...prev, productSnapshots: updated };
    });
  };

  const updateDiamond = (index, field, value) => {
    setForm((prev) => {
      const updatedSnapshots = [...prev.productSnapshots];
      const updatedDiamonds = [...(updatedSnapshots[activeItemIndex].diamonds || [])];

      updatedDiamonds[index] = {
        ...updatedDiamonds[index],
        [field]: value,
      };

      const grossWeight = parseFloat(updatedDiamonds[index].grossWeight) || 0;
      const count = parseFloat(updatedDiamonds[index].count) || 0;

      if (count > 0) {
        updatedDiamonds[index].weight = (grossWeight / count).toFixed(3);
      }

      updatedSnapshots[activeItemIndex] = {
        ...updatedSnapshots[activeItemIndex],
        diamonds: updatedDiamonds,
      };

      return { ...prev, productSnapshots: updatedSnapshots };
    });
  };

  const removeDiamond = (index) => {
    setForm((prev) => {
      const updated = [...prev.productSnapshots];
      updated[activeItemIndex] = {
        ...updated[activeItemIndex],
        diamonds: (updated[activeItemIndex].diamonds || []).filter((_, i) => i !== index),
      };
      return { ...prev, productSnapshots: updated };
    });
  };

  /* ================= GEMSTONE HANDLERS ================= */
  const addGemstone = () => {
    setForm((prev) => {
      const updated = [...prev.productSnapshots];
      updated[activeItemIndex] = {
        ...updated[activeItemIndex],
        gemstones: [
          ...(updated[activeItemIndex].gemstones || []),
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
      };
      return { ...prev, productSnapshots: updated };
    });
  };

  const updateGemstone = (index, field, value) => {
    setForm((prev) => {
      const updatedSnapshots = [...prev.productSnapshots];
      const updatedGemstones = [...(updatedSnapshots[activeItemIndex].gemstones || [])];

      updatedGemstones[index] = {
        ...updatedGemstones[index],
        [field]: field === "grossWeight" || field === "count"
          ? (value === "" ? "" : Number(value))
          : value,
      };

      if (field === "grossWeight" || field === "count") {
        const grossWeight = Number(updatedGemstones[index].grossWeight) || 0;
        const count = Number(updatedGemstones[index].count) || 0;

        updatedGemstones[index].weight = count > 0 ? grossWeight / count : 0;
      }

      updatedSnapshots[activeItemIndex] = {
        ...updatedSnapshots[activeItemIndex],
        gemstones: updatedGemstones,
      };

      return { ...prev, productSnapshots: updatedSnapshots };
    });
  };

  const removeGemstone = (index) => {
    setForm((prev) => {
      const updated = [...prev.productSnapshots];
      updated[activeItemIndex] = {
        ...updated[activeItemIndex],
        gemstones: (updated[activeItemIndex].gemstones || []).filter((_, i) => i !== index),
      };
      return { ...prev, productSnapshots: updated };
    });
  };

  /* ================= BELT HANDLERS ================= */
  const addBelt = () => {
    setForm((prev) => {
      const updated = [...prev.productSnapshots];
      updated[activeItemIndex] = {
        ...updated[activeItemIndex],
        belts: [
          ...(updated[activeItemIndex].belts || []),
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
      };
      return { ...prev, productSnapshots: updated };
    });
  };

  const updateBelt = (index, field, value) => {
    setForm((prev) => {
      const updatedSnapshots = [...prev.productSnapshots];
      const updatedBelts = [...(updatedSnapshots[activeItemIndex].belts || [])];
      
      updatedBelts[index] = {
        ...updatedBelts[index],
        [field]: field === "count" || field === "rateOverride"
          ? (value === "" ? "" : Number(value))
          : value,
      };

      updatedSnapshots[activeItemIndex] = {
        ...updatedSnapshots[activeItemIndex],
        belts: updatedBelts,
      };

      return { ...prev, productSnapshots: updatedSnapshots };
    });
  };

  const removeBelt = (index) => {
    setForm((prev) => {
      const updated = [...prev.productSnapshots];
      updated[activeItemIndex] = {
        ...updated[activeItemIndex],
        belts: (updated[activeItemIndex].belts || []).filter((_, i) => i !== index),
      };
      return { ...prev, productSnapshots: updated };
    });
  };

  /* ================= METAL PAYMENT HANDLERS ================= */
  const handleMetalPaymentChange = (field, value) => {
    setForm((prev) => {
      const updatedSnapshots = [...prev.productSnapshots];
      const current = updatedSnapshots[activeItemIndex].metalPayment || {
        metalType: updatedSnapshots[activeItemIndex].metalType || "Gold",
        purity: updatedSnapshots[activeItemIndex].metalPurity || "22KT",
        weight: 0,
        receivedAt: new Date(),
      };

      const updatedPayment = {
        ...current,
        [field]: value,
      };

      if (rates) {
        const ratePerGram = rates.helpers.getMetalRate(
          updatedPayment.metalType,
          updatedPayment.purity
        );

        const purityFactor = rates.helpers.getPurityFactor(
          updatedPayment.metalType,
          updatedPayment.purity
        );

        const totalValue = (ratePerGram || 0) * (updatedPayment.weight || 0);

        updatedPayment.ratePerGram = ratePerGram;
        updatedPayment.purityFactor = purityFactor;
        updatedPayment.totalValue = Number(totalValue.toFixed(2));
      }

      updatedSnapshots[activeItemIndex] = {
        ...updatedSnapshots[activeItemIndex],
        metalPayment: updatedPayment,
      };

      return {
        ...prev,
        productSnapshots: updatedSnapshots,
      };
    });
  };

  const calculateDiamondValue = (snapshot = currentSnapshot) => {
    if (!rates || !snapshot) return "0.00";

    const total = (snapshot.diamonds || []).reduce((sum, d) => {
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

  const calculateStoneValue = (snapshot = currentSnapshot) => {
    if (!rates || !snapshot) return "0.00";

    const total = (snapshot.gemstones || []).reduce((sum, g) => {
      if (!g.weight || !g.count) return sum;

      const overrideVal = parseFloat(g.rateOverride);
      let rate = overrideVal;
      if (isNaN(rate)) {
        const matchedRate = findMatchingStoneRate({ ...g, type: g.name }, adminStoneRates);
        rate = matchedRate !== null ? matchedRate : parseFloat(rates?.components?.stone || 0);
      }

      return sum + (rate * parseFloat(g.weight) * parseFloat(g.count));
    }, 0);

    return total.toFixed(2);
  };

  const calculateBeltValue = (snapshot = currentSnapshot) => {
    if (!rates || !snapshot) return "0.00";

    const total = (snapshot.belts || []).reduce((sum, b) => {
      if (!b.count) return sum;

      const overrideVal = parseFloat(b.rateOverride);
      let rate = overrideVal || 0;

      return sum + (rate * parseFloat(b.count));
    }, 0);

    return total.toFixed(2);
  };

  const calculateTotalComponents = (snapshot = currentSnapshot) => {
    return (
      Number(calculateDiamondValue(snapshot)) +
      Number(calculateStoneValue(snapshot)) +
      Number(calculateBeltValue(snapshot))
    ).toFixed(2);
  };

  const calculateMetalValue = (snapshot = currentSnapshot) => {
    if (!rates || !snapshot) return "0.00";

    const { metalType, metalPurity, netWeight } = snapshot;

    if (!metalType || !metalPurity || !netWeight) return "0.00";

    const ratePerGram = rates.helpers.getMetalRate(
      metalType,
      metalPurity
    );

    return (ratePerGram * netWeight).toFixed(2);
  };

  const buildComponents = (snapshot = currentSnapshot) => {
    const components = [];

    (snapshot.diamonds || []).forEach((d) => {
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

    (snapshot.gemstones || []).forEach((g) => {
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

    (snapshot.belts || []).forEach((b) => {
      if (!b.count) return;

      components.push({
        type: "Accessory",
        componentRole: "SIDE",
        shape: b.color || "", 
        category: b.category || "Belt", 
        description: b.material || "", 
        size: b.size || "",
        count: b.count,
        pricingRef: "BELT",
        rateOverride: b.rateOverride ?? undefined,
      });
    });

    return components;
  };

  /* ================= MULTI-ITEM STATE MANAGERS ================= */
  const addItem = () => {
    setForm(prev => ({
      ...prev,
      productSnapshots: [
        ...prev.productSnapshots,
        {
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
          productImages: [],
          advancePayment: {
            amount: 0,
            mode: "CASH",
            transactionId: "",
          },
          metalPayment: null,
        }
      ]
    }));
    setActiveItemIndex(form.productSnapshots.length);
  };

  const removeItem = (indexToRemove) => {
    if (form.productSnapshots.length <= 1) return;
    setForm(prev => {
      const updated = prev.productSnapshots.filter((_, idx) => idx !== indexToRemove);
      return { ...prev, productSnapshots: updated };
    });
    if (activeItemIndex >= indexToRemove && activeItemIndex > 0) {
      setActiveItemIndex(prev => prev - 1);
    }
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    try {
      if (!form.customer.name || !form.customer.mobile) {
        showAlert("Customer Name and Mobile are required");
        return;
      }

      if (initialOrder?._id) {
        // --- EDIT MODE (Single order update) ---
        const snap = form.productSnapshots[0];
        if (!snap.netWeight) {
          showAlert("Net metal weight is required");
          return;
        }

        const fd = new FormData();
        fd.append("customer[name]", form.customer.name);
        fd.append("customer[mobile]", form.customer.mobile);
        if (form.customer.email) fd.append("customer[email]", form.customer.email);
        if (form.customer.address) fd.append("customer[address]", form.customer.address);
        if (form.customer.city) fd.append("customer[city]", form.customer.city);

        fd.append("productSnapshot[title]", snap.title || "Custom Order");
        fd.append("productSnapshot[jewelleryCategory]", snap.jewelleryCategory || "");
        fd.append("productSnapshot[description]", snap.description || "");
        fd.append("productSnapshot[size]", snap.size || "");
        fd.append("productSnapshot[metalType]", snap.metalType);
        fd.append("productSnapshot[metalPurity]", snap.metalPurity);
        fd.append("productSnapshot[metalColor]", snap.metalColor);
        fd.append("productSnapshot[netWeight]", snap.netWeight);
        fd.append("productSnapshot[grossWeight]", snap.grossWeight || 0);

        (snap.productImages || []).forEach((img) => {
          if (img instanceof File) {
            fd.append("productImages", img);
          } else {
            fd.append("productSnapshot[productImages][]", img);
          }
        });

        if (snap.metalPayment) {
          fd.append("metalPayment[metalType]", snap.metalPayment.metalType);
          fd.append("metalPayment[purity]", snap.metalPayment.purity);
          fd.append("metalPayment[weight]", snap.metalPayment.weight);
          fd.append("metalPayment[baseRate]", snap.metalPayment.baseRate || 0);
          fd.append("metalPayment[purityFactor]", snap.metalPayment.purityFactor || 1);
          fd.append("metalPayment[ratePerGram]", snap.metalPayment.ratePerGram || 0);
          fd.append("metalPayment[totalValue]", snap.metalPayment.totalValue || 0);
          fd.append("metalPayment[receivedAt]", snap.metalPayment.receivedAt);
        }

        const components = buildComponents(snap);
        components.forEach((c, index) => {
          fd.append(`productSnapshot[components][${index}][type]`, c.type);
          fd.append(`productSnapshot[components][${index}][componentRole]`, c.componentRole);
          fd.append(`productSnapshot[components][${index}][shape]`, c.shape || "");
          if (c.clarity) fd.append(`productSnapshot[components][${index}][clarity]`, c.clarity);
          if (c.color) fd.append(`productSnapshot[components][${index}][color]`, c.color);
          fd.append(`productSnapshot[components][${index}][grossWeight]`, c.grossWeight || 0);
          if (c.size !== undefined && c.size !== null && c.size !== "") {
            fd.append(`productSnapshot[components][${index}][size]`, c.size);
          } else {
            fd.append(`productSnapshot[components][${index}][size]`, "");
          }
          fd.append(`productSnapshot[components][${index}][weight]`, c.weight || 0);
          fd.append(`productSnapshot[components][${index}][count]`, c.count);
          fd.append(`productSnapshot[components][${index}][pricingRef]`, c.pricingRef);
          if (c.category) fd.append(`productSnapshot[components][${index}][category]`, c.category);
          if (c.rateOverride !== undefined) {
            fd.append(`productSnapshot[components][${index}][rateOverride]`, c.rateOverride);
          }
        });

        if (snap.advancePayment && snap.advancePayment.amount > 0) {
          fd.append("advancePayment[amount]", snap.advancePayment.amount);
          fd.append("advancePayment[mode]", snap.advancePayment.mode);
          if (snap.advancePayment.transactionId) {
            fd.append("advancePayment[transactionId]", snap.advancePayment.transactionId);
          }
        }

        if (form.expectedDeliveryDate) {
          fd.append("expectedDeliveryDate", form.expectedDeliveryDate);
        }
        fd.append("status", form.status);

        const res = await updateOrderById(initialOrder._id, fd);
        await showAlert("Order updated successfully!");
        onSuccess?.(res.data.order._id);
      } else {
        // --- CREATE MODE (Sequential Multi-Item submission) ---
        for (let i = 0; i < form.productSnapshots.length; i++) {
          const snap = form.productSnapshots[i];
          if (!snap.netWeight) {
            showAlert(`Item ${i + 1} (${snap.title || 'Untitled'}): Net metal weight is required`);
            return;
          }
        }

        const confirmMsg = form.productSnapshots.length > 1 
          ? `Are you sure you want to book these ${form.productSnapshots.length} custom orders?`
          : "Are you sure you want to create this order?";

        const proceed = await showConfirm(confirmMsg);
        if (!proceed) return;

        let firstOrderId = null;
        let firstOrderNo = null;

        // Sequential Submit to handle sequential order number generation safely
        for (let i = 0; i < form.productSnapshots.length; i++) {
          const snap = form.productSnapshots[i];
          const fd = new FormData();

          fd.append("customer[name]", form.customer.name);
          fd.append("customer[mobile]", form.customer.mobile);
          if (form.customer.email) fd.append("customer[email]", form.customer.email);
          if (form.customer.address) fd.append("customer[address]", form.customer.address);
          if (form.customer.city) fd.append("customer[city]", form.customer.city);

          fd.append("productSnapshot[title]", snap.title || `Custom Item ${i + 1}`);
          fd.append("productSnapshot[jewelleryCategory]", snap.jewelleryCategory || "");
          fd.append("productSnapshot[description]", snap.description || "");
          fd.append("productSnapshot[size]", snap.size || "");
          fd.append("productSnapshot[metalType]", snap.metalType);
          fd.append("productSnapshot[metalPurity]", snap.metalPurity);
          fd.append("productSnapshot[metalColor]", snap.metalColor);
          fd.append("productSnapshot[netWeight]", snap.netWeight);
          fd.append("productSnapshot[grossWeight]", snap.grossWeight || 0);

          (snap.productImages || []).forEach((img) => {
            if (img instanceof File) {
              fd.append("productImages", img);
            } else {
              fd.append("productSnapshot[productImages][]", img);
            }
          });

          const metalPay = snap.metalPayment;
          if (metalPay && metalPay.weight > 0) {
            fd.append("metalPayment[metalType]", metalPay.metalType);
            fd.append("metalPayment[purity]", metalPay.purity);
            fd.append("metalPayment[weight]", metalPay.weight);
            fd.append("metalPayment[baseRate]", metalPay.baseRate || 0);
            fd.append("metalPayment[purityFactor]", metalPay.purityFactor || 1);
            fd.append("metalPayment[ratePerGram]", metalPay.ratePerGram || 0);
            fd.append("metalPayment[totalValue]", metalPay.totalValue || 0);
            fd.append("metalPayment[receivedAt]", metalPay.receivedAt);
          }

          const components = buildComponents(snap);
          components.forEach((c, index) => {
            fd.append(`productSnapshot[components][${index}][type]`, c.type);
            fd.append(`productSnapshot[components][${index}][componentRole]`, c.componentRole);
            fd.append(`productSnapshot[components][${index}][shape]`, c.shape || "");
            if (c.clarity) fd.append(`productSnapshot[components][${index}][clarity]`, c.clarity);
            if (c.color) fd.append(`productSnapshot[components][${index}][color]`, c.color);
            fd.append(`productSnapshot[components][${index}][grossWeight]`, c.grossWeight || 0);
            if (c.size !== undefined && c.size !== null && c.size !== "") {
              fd.append(`productSnapshot[components][${index}][size]`, c.size);
            } else {
              fd.append(`productSnapshot[components][${index}][size]`, "");
            }
            fd.append(`productSnapshot[components][${index}][weight]`, c.weight || 0);
            fd.append(`productSnapshot[components][${index}][count]`, c.count);
            fd.append(`productSnapshot[components][${index}][pricingRef]`, c.pricingRef);
            if (c.category) fd.append(`productSnapshot[components][${index}][category]`, c.category);
            if (c.rateOverride !== undefined) {
              fd.append(`productSnapshot[components][${index}][rateOverride]`, c.rateOverride);
            }
          });

          const advPay = snap.advancePayment;
          if (advPay && advPay.amount > 0) {
            fd.append("advancePayment[amount]", advPay.amount);
            fd.append("advancePayment[mode]", advPay.mode);
            if (advPay.transactionId) {
              fd.append("advancePayment[transactionId]", advPay.transactionId);
            }
          }

          if (form.expectedDeliveryDate) {
            fd.append("expectedDeliveryDate", form.expectedDeliveryDate);
          }
          fd.append("status", form.status);

          if (i > 0 && firstOrderNo) {
            fd.append("groupOrderNo", firstOrderNo);
          }

          const res = await createOrder(fd);
          if (i === 0) {
            firstOrderId = res.data.order._id;
            firstOrderNo = res.data.order.groupOrderNo;
          }
        }

        if (convertedFromEstimateId) {
          try {
            await updateEstimate(convertedFromEstimateId, { status: "CONVERTED" });
          } catch (estErr) {
            console.error("Failed to mark estimate as converted", estErr);
          }
        }

        await showAlert(form.productSnapshots.length > 1 ? "All orders created successfully!" : "Order created successfully!");
        onSuccess?.(firstOrderId);
      }
    } catch (err) {
      console.error("Order Submit Error Detail:", err.response?.data);
      const serverError = err.response?.data?.error || err.response?.data?.message;
      const errorMsg = serverError || (initialOrder?._id ? "Failed to update order" : "Failed to create order");
      await showAlert(errorMsg);
    }
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

            {/* LEFT COLUMN - Product Reference & Specifications */}
            <div className="lg:col-span-2 space-y-6">

              {/* Items Tab Bar (Only during creation mode) */}
              {!initialOrder?._id && (
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {form.productSnapshots.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveItemIndex(idx)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                          activeItemIndex === idx
                            ? "bg-[#6B2E4A] text-white shadow"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="opacity-80">Item {idx + 1}</span>
                        {item.title ? (
                          <span className="font-bold border-l pl-1.5 border-current max-w-[100px] truncate">{item.title}</span>
                        ) : null}
                        {form.productSnapshots.length > 1 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(idx);
                            }}
                            className="text-[10px] font-black hover:text-red-500 rounded-full px-1 py-0.2 hover:bg-white/20 transition-colors ml-1"
                          >
                            ✕
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="px-3.5 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700 transition active:scale-95 shadow"
                  >
                    + Add Item
                  </button>
                </div>
              )}

              {/* Product Reference */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                    <h2 className="text-base font-semibold text-gray-800">
                      Product Reference {form.productSnapshots.length > 1 ? `(Item ${activeItemIndex + 1})` : ""}
                    </h2>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                    {/* ADD IMAGE BUTTON */}
                    <button
                      type="button"
                      onClick={() => setShowOptions(true)}
                      className="group relative h-24 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 flex flex-col items-center justify-center gap-1 text-[#6B2E4A] text-xs font-semibold shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.9)] transition-all duration-300 ease-out hover:shadow-[inset_4px_4px_10px_rgba(0,0,0,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)] hover:scale-[1.02] active:scale-95 active:shadow-inner"
                    >
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/40 via-transparent to-white/10 opacity-60 pointer-events-none" />
                      <Camera className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" />
                      <span className="relative z-10">Add Image</span>
                      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#6B2E4A] via-[#a46a86] to-[#6B2E4A] transition-all duration-500 ease-out group-hover:w-full group-active:w-full" />
                    </button>

                    {/* IMAGES */}
                    {(currentSnapshot.productImages || []).map((img, i) => (
                      <div
                        key={i}
                        className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
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
                          className="absolute top-2 right-2 bg-[#632947] text-white w-7 h-7 rounded-full text-xs flex items-center justify-center print:hidden active:scale-90"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                  </div>
                </div>

                {previewImage && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                    <button
                      onClick={() => setPreviewImage(null)}
                      className="absolute top-6 right-6 text-white text-xl bg-white/10 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/20"
                    >
                      ✕
                    </button>
                    <img
                      src={previewImage}
                      alt="Full Preview"
                      className="max-w-[90%] max-h-[80%] object-contain rounded-lg shadow-2xl"
                    />
                    <p className="text-white/70 mt-4 text-sm italic">
                      Product Image Preview
                    </p>
                  </div>
                )}

                {showCamera && (
                  <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
                    <div className="flex justify-between items-center p-4 text-white">
                      <span>Camera</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full max-w-md rounded"
                        videoConstraints={{ facingMode: "environment" }}
                      />
                    </div>
                    <div className="p-6 flex justify-center">
                      <button className="bg-red text-white p-6" onClick={() => setShowCamera(false)}>Close</button>
                      <button
                        onClick={captureFromCamera}
                        className="w-16 h-16 bg-white rounded-full ml-4"
                      />
                    </div>
                  </div>
                )}

                {showOptions && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-72 space-y-4">
                      <h3 className="text-sm font-semibold text-center">Select Option</h3>
                      <button
                        onClick={() => {
                          setShowOptions(false);
                          setShowCamera(true);
                        }}
                        className="w-full py-2 bg-[#6B2E4A] text-white rounded"
                      >
                        Open Camera
                      </button>
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
                      value={currentSnapshot.title || ""}
                      onChange={(e) => updateSnapshotField("title", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Category</label>
                      <input
                        placeholder="Bracelet"
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                        value={currentSnapshot.jewelleryCategory || ""}
                        onChange={(e) => updateSnapshotField("jewelleryCategory", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Size</label>
                      <input
                        placeholder="6.5 inches"
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                        value={currentSnapshot.size || ""}
                        onChange={(e) => updateSnapshotField("size", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea
                      placeholder="Product description..."
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm resize-none"
                      rows={2}
                      value={currentSnapshot.description || ""}
                      onChange={(e) => updateSnapshotField("description", e.target.value)}
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
                      value={currentSnapshot.metalType || "Gold"}
                      onChange={(e) => {
                        const metalType = e.target.value;
                        setForm(prev => {
                          const updated = [...prev.productSnapshots];
                          updated[activeItemIndex] = {
                            ...updated[activeItemIndex],
                            metalType,
                            metalPurity: "",
                            metalColor: "",
                          };
                          return { ...prev, productSnapshots: updated };
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
                      value={currentSnapshot.metalPurity || ""}
                      onChange={(e) => updateSnapshotField("metalPurity", e.target.value)}
                    >
                      <option value="">Select</option>
                      {(METAL_OPTIONS[currentSnapshot.metalType || "Gold"]?.purities || []).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Color</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={currentSnapshot.metalColor || ""}
                      onChange={(e) => updateSnapshotField("metalColor", e.target.value)}
                    >
                      <option value="">Select</option>
                      {(METAL_OPTIONS[currentSnapshot.metalType || "Gold"]?.colors || []).map((c) => (
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
                      value={currentSnapshot.netWeight || ""}
                      onChange={(e) => updateSnapshotField("netWeight", parseFloat(e.target.value) || 0)}
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

                {(currentSnapshot.diamonds || []).map((diamond, index) => (
                  <div key={index} className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">Diamond {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeDiamond(index)}
                        className="text-xs text-red-600 hover:text-red-800 animate-pulse"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-3 items-end">
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

                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Size</label>
                        <input
                          type="text"
                          className="h-9 px-2 border border-gray-300 rounded text-xs"
                          value={diamond.size || ""}
                          onChange={(e) => updateDiamond(index, "size", e.target.value)}
                        />
                      </div>

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

                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Count / Pcs</label>
                        <input
                          type="number"
                          min="0"
                          className="h-9 px-2 border border-gray-300 rounded text-xs"
                          value={diamond.count === 0 ? "" : diamond.count}
                          onChange={(e) => updateDiamond(index, "count", parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="text-[11px] text-gray-600 mb-1">Est. Net (ct)</label>
                        <input
                          type="number"
                          readOnly
                          className="h-9 px-2 border border-gray-300 rounded text-xs bg-gray-100"
                          value={diamond.weight || 0}
                        />
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[11px] text-gray-600">Rate Override</label>
                          <button
                            type="button"
                            className={`text-[10px] px-1 ${diamond.rateLocked ? "text-green-600" : "text-gray-500"}`}
                            onClick={() => updateDiamond(index, "rateLocked", !diamond.rateLocked)}
                          >
                            {diamond.rateLocked ? "🔓" : "🔒"}
                          </button>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          disabled={!diamond.rateLocked}
                          className={`h-9 px-2 border rounded text-xs ${diamond.rateLocked ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-100"}`}
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
                  + Add Diamond
                </button>
              </div>

              {/* Precious Gemstones */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                    <h2 className="text-base font-semibold text-gray-800">Precious Gemstones</h2>
                  </div>
                </div>

                {(currentSnapshot.gemstones || []).map((gemstone, index) => (
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

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Est. Total (ct)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                          value={gemstone.grossWeight || ""}
                          onChange={(e) => updateGemstone(index, "grossWeight", e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Est. Net (ct)</label>
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
                            className="text-xs text-blue-600 font-bold"
                            onClick={() => updateGemstone(index, "rateLocked", !gemstone.rateLocked)}
                          >
                            {gemstone.rateLocked ? "🔓" : "🔒"}
                          </button>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!gemstone.rateLocked}
                          className={`w-full px-2 py-1.5 border rounded text-xs ${gemstone.rateLocked ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-100"}`}
                          placeholder="Optional"
                          value={gemstone.rateOverride || ""}
                          onChange={(e) => updateGemstone(index, "rateOverride", parseFloat(e.target.value) || null)}
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
                  + Add Gemstone
                </button>
              </div>

              {/* Accessories */}
              <div className="border border-gray-200 rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#6B2E4A] rounded"></div>
                    <h2 className="text-base font-semibold text-gray-800">Accessories</h2>
                  </div>
                </div>

                {(currentSnapshot.belts || []).map((belt, index) => (
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
                          placeholder="Leather"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Color</label>
                        <input
                          type="text"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                          value={belt.color}
                          onChange={(e) => updateBelt(index, "color", e.target.value)}
                          placeholder="Black"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Size</label>
                        <input
                          type="text"
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white"
                          value={belt.size}
                          onChange={(e) => updateBelt(index, "size", e.target.value)}
                          placeholder="42mm"
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
                      value={currentSnapshot.advancePayment?.amount || ""}
                      onChange={(e) =>
                        updateSnapshotField("advancePayment", {
                          ...(currentSnapshot.advancePayment || { mode: "CASH", transactionId: "" }),
                          amount: parseFloat(e.target.value) || 0
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Payment Mode</label>
                    <select
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      value={currentSnapshot.advancePayment?.mode || "CASH"}
                      onChange={(e) =>
                        updateSnapshotField("advancePayment", {
                          ...(currentSnapshot.advancePayment || { amount: 0, transactionId: "" }),
                          mode: e.target.value
                        })
                      }
                    >
                      {PAYMENT_MODES.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Reference No</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#6B2E4A] text-sm"
                      placeholder="Optional"
                      value={currentSnapshot.advancePayment?.transactionId || ""}
                      onChange={(e) =>
                        updateSnapshotField("advancePayment", {
                          ...(currentSnapshot.advancePayment || { amount: 0, mode: "CASH" }),
                          transactionId: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!currentSnapshot.metalPayment}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const metalType = currentSnapshot.metalType || "Gold";
                          const purity = currentSnapshot.metalPurity || "22KT";
                          const ratePerGram = rates?.helpers.getMetalRate(metalType, purity) || 0;
                          const purityFactor = rates?.helpers.getPurityFactor(metalType, purity) || 1;

                          updateSnapshotField("metalPayment", {
                            metalType,
                            purity,
                            weight: 0,
                            baseRate: ratePerGram,
                            purityFactor,
                            ratePerGram,
                            totalValue: 0,
                            receivedAt: new Date(),
                          });
                        } else {
                          updateSnapshotField("metalPayment", null);
                        }
                      }}
                      className="w-4 h-4 text-[#6B2E4A]"
                    />
                    <span className="text-sm text-gray-700 font-medium">Customer providing metal</span>
                  </label>

                  {currentSnapshot.metalPayment && (
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
                            value={currentSnapshot.metalPayment.weight || ""}
                            onChange={(e) => handleMetalPaymentChange("weight", parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Metal Type</label>
                          <select
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
                            value={currentSnapshot.metalPayment.metalType}
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
                            value={currentSnapshot.metalPayment.purity}
                            onChange={(e) => handleMetalPaymentChange("purity", e.target.value)}
                          >
                            {(METAL_OPTIONS[currentSnapshot.metalPayment.metalType]?.purities || []).map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN - Customer Profile & Summary */}
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
                    <div className="relative">
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
                      {customerLookup.loading && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs animate-pulse">Looking up…</span>
                      )}
                    </div>

                    {!customerLookup.loading && customerLookup.orders.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 p-2.5 bg-[#6B2E4A]/5 border border-[#6B2E4A]/20 rounded-md">
                        <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-xs text-[#6B2E4A] font-medium">
                          Returning customer — {customerLookup.orders.length} previous order{customerLookup.orders.length !== 1 ? "s" : ""}
                        </span>
                        <a
                          href={`/orders?search=${encodeURIComponent(form.customer.mobile)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto text-[10px] text-[#6B2E4A] underline font-semibold hover:text-[#4a1e33]"
                        >
                          View All →
                        </a>
                      </div>
                    )}

                    {!customerLookup.loading && customerLookup.orders.length > 0 && (
                      <div className="mt-2 max-h-28 overflow-y-auto space-y-1.5">
                        {customerLookup.orders.slice(0, 4).map(o => (
                          <a
                            key={o._id}
                            href={`/orders/${o._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex justify-between items-center px-2.5 py-1.5 text-xs rounded bg-white border border-gray-200 hover:border-[#6B2E4A]/30 hover:bg-[#6B2E4A]/5 transition"
                          >
                            <span className="font-mono font-medium text-gray-700">{o.orderNo}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              o.status === "Delivered" ? "bg-green-100 text-green-700" :
                              o.status === "Cancelled" ? "bg-red-100 text-red-600" :
                              o.status === "Ready" ? "bg-blue-100 text-blue-700" :
                              o.status === "In-Process" ? "bg-amber-100 text-amber-700" :
                              "bg-purple-100 text-purple-700"
                            }`}>{o.status}</span>
                          </a>
                        ))}
                        {customerLookup.orders.length > 4 && (
                          <p className="text-center text-[10px] text-gray-400 py-1">+{customerLookup.orders.length - 4} more</p>
                        )}
                      </div>
                    )}
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

              {/* Order Summary Card */}
              <div className="bg-[#6B2E4A] text-white rounded-lg p-5 sticky top-6">
                <h3 className="text-base font-semibold mb-4 border-b border-white/20 pb-2">Order Summary</h3>

                {/* Active Item Details */}
                <div className="mb-4 pb-4 border-b border-white/20">
                  <p className="text-xs uppercase tracking-widest text-[#C5A859] font-bold mb-2.5">
                    Active Item {form.productSnapshots.length > 1 ? `(${activeItemIndex + 1} of ${form.productSnapshots.length})` : ""}
                  </p>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex justify-between">
                      <span>Metal Value:</span>
                      <span className="font-medium">₹ {calculateMetalValue(currentSnapshot)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diamond Value:</span>
                      <span className="font-medium">₹ {calculateDiamondValue(currentSnapshot)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stone Value:</span>
                      <span className="font-medium">₹ {calculateStoneValue(currentSnapshot)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accessory Value:</span>
                      <span className="font-medium">₹ {calculateBeltValue(currentSnapshot)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 mt-2 font-medium">
                      <span>Item Estimate:</span>
                      <span className="font-semibold text-white">
                        ₹ {(Number(calculateMetalValue(currentSnapshot)) + Number(calculateTotalComponents(currentSnapshot))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Batch Summary (rendered only if there are multiple items) */}
                {form.productSnapshots.length > 1 && (
                  <div className="mb-4 pb-4 border-b border-white/20 space-y-2.5">
                    <p className="text-xs uppercase tracking-widest text-[#C5A859] font-bold">
                      Batch Summary ({form.productSnapshots.length} Items)
                    </p>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                      {form.productSnapshots.map((snap, idx) => {
                        const itemEst = (Number(calculateMetalValue(snap)) + Number(calculateTotalComponents(snap))).toFixed(2);
                        return (
                          <div
                            key={idx}
                            onClick={() => setActiveItemIndex(idx)}
                            className={`flex justify-between py-1.5 px-2 rounded cursor-pointer transition ${
                              idx === activeItemIndex
                                ? "bg-white/20 border-l-2 border-[#C5A859] pl-1.5"
                                : "hover:bg-white/10"
                            }`}
                          >
                            <span className="truncate max-w-[150px] font-medium">
                              {idx + 1}. {snap.title || `Custom Item ${idx + 1}`}
                            </span>
                            <span>₹ {itemEst}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between border-t border-white/25 pt-2 font-semibold text-sm">
                      <span>Total Batch Estimate:</span>
                      <span className="text-[#C5A859]">
                        ₹ {form.productSnapshots.reduce((sum, snap) => sum + Number(calculateMetalValue(snap)) + Number(calculateTotalComponents(snap)), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Advance Details */}
                <div className="space-y-2 text-xs mb-6 text-white/70">
                  <div className="flex justify-between">
                    <span>Total Advance Cash/UPI:</span>
                    <span className="font-semibold text-white text-sm">
                      ₹ {form.productSnapshots.reduce((sum, snap) => sum + (snap.advancePayment?.amount || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  {form.productSnapshots.some(snap => snap.metalPayment && snap.metalPayment.weight > 0) && (
                    <div className="flex justify-between">
                      <span>Total Metal Advance:</span>
                      <span className="font-semibold text-white text-sm text-right">
                        {Object.entries(form.productSnapshots.reduce((acc, snap) => {
                          if (snap.metalPayment && snap.metalPayment.weight > 0) {
                            const key = `${snap.metalPayment.metalType} ${snap.metalPayment.purity}`;
                            acc[key] = (acc[key] || 0) + snap.metalPayment.weight;
                          }
                          return acc;
                        }, {})).map(([type, weight]) => `${weight.toFixed(3)}g (${type})`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={submit}
                  className="w-full bg-[#C5A859] hover:bg-[#C19B2B] text-white font-semibold py-3.5 rounded-md transition-colors text-sm uppercase tracking-wider shadow hover:shadow-lg active:scale-[0.99]"
                >
                  {initialOrder?._id ? "UPDATE ORDER" : "CREATE BATCH ORDERS"}
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
